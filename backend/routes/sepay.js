const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { customerAuthMiddleware } = require('../middleware/auth');
const sepay = require('../middleware/sepay');

/**
 * Tạo giao dịch nạp tiền qua SePay - Trả về QR Code
 */
router.post('/create-payment', customerAuthMiddleware, async (req, res) => {
    try {
        const customerId = req.customerId;
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount < 10000) {
            return res.status(400).json({ 
                success: false,
                message: 'Số tiền nạp tối thiểu là 10,000 VNĐ' 
            });
        }

        if (amount > 50000000) {
            return res.status(400).json({ 
                success: false,
                message: 'Số tiền nạp tối đa là 50,000,000 VNĐ' 
            });
        }

        // Lấy thông tin khách hàng
        const [customers] = await db.query(
            'SELECT email, name FROM customers WHERE customer_id = ?',
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy tài khoản' 
            });
        }

        const customer = customers[0];

        // Tạo order ID unique
        const orderId = `RECHARGE_${customerId}_${Date.now()}`;

        // Lưu giao dịch vào database với trạng thái pending
        const [result] = await db.query(
            `INSERT INTO recharge_history 
            (customer_id, request_id, recharge_type, declared_amount, status, response_message)
            VALUES (?, ?, 'sepay', ?, 'pending', 'Đang chờ thanh toán')`,
            [customerId, orderId, amount]
        );

        const rechargeId = result.insertId;

        // Tạo QR Code VietQR
        const qrData = sepay.generateVietQR({
            order_id: orderId,
            amount: amount,
            description: `Nap tien cho ${customer.email}`
        });

        res.json({
            success: true,
            message: 'Tạo giao dịch thành công',
            data: {
                recharge_id: rechargeId,
                order_id: orderId,
                amount: amount,
                qr_url: qrData.qr_url,
                qr_data_url: qrData.qr_data_url,
                bank_info: {
                    bank_code: qrData.bank_code,
                    account_number: qrData.account_number,
                    account_name: qrData.account_name,
                    transfer_content: qrData.transfer_content
                }
            }
        });

    } catch (error) {
        console.error('Create SePay payment error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi tạo giao dịch thanh toán' 
        });
    }
});

/**
 * Webhook từ SePay (khi có giao dịch)
 */
router.post('/webhook', async (req, res) => {
    try {
        console.log('SePay Callback received:', req.body);
        console.log('Headers:', req.headers);

        // Trong sandbox mode, skip signature validation để test
        if (process.env.SEPAY_ENV === 'sandbox') {
            console.log('⚠️ SANDBOX MODE: Skipping signature validation for testing');
        } else {
            // Validate signature trong production
            const isValid = sepay.validateCallback(req.body);
            if (!isValid) {
                console.error('Invalid SePay callback signature');
                return res.status(403).json({ 
                    success: false,
                    message: 'Invalid signature' 
                });
            }
        }

        // Parse callback data
        const callbackData = sepay.parseCallback(req.body);
        const { order_invoice_number, transaction_id, amount, status, message } = callbackData;

        console.log('Parsed callback data:', callbackData);

        // Tìm giao dịch trong database bằng order_id
        const [transactions] = await db.query(
            'SELECT * FROM recharge_history WHERE request_id = ?',
            [order_invoice_number]
        );

        if (transactions.length === 0) {
            console.error('Transaction not found:', order_invoice_number);
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy giao dịch' 
            });
        }

        const transaction = transactions[0];

        // Kiểm tra nếu đã xử lý rồi
        if (transaction.status === 'success') {
            console.log('Transaction already processed:', order_invoice_number);
            return res.json({ 
                success: true,
                message: 'Giao dịch đã được xử lý trước đó' 
            });
        }

        // Cập nhật trạng thái giao dịch
        if (status === 'success') {
            // Kiểm tra số tiền khớp
            if (parseFloat(amount) !== parseFloat(transaction.declared_amount)) {
                console.error('Amount mismatch:', amount, 'vs', transaction.declared_amount);
                await db.query(
                    `UPDATE recharge_history 
                    SET status = ?, response_message = ?, updated_at = NOW()
                    WHERE recharge_id = ?`,
                    ['failed', 'Số tiền không khớp', transaction.recharge_id]
                );
                return res.status(400).json({ 
                    success: false,
                    message: 'Số tiền không khớp' 
                });
            }

            // Transaction để đảm bảo atomic
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Cập nhật trạng thái giao dịch
                await connection.query(
                    `UPDATE recharge_history 
                    SET status = ?, actual_amount = ?, transaction_id = ?, 
                        response_message = ?, completed_at = NOW(), updated_at = NOW()
                    WHERE recharge_id = ?`,
                    ['success', amount, transaction_id, message, transaction.recharge_id]
                );

                // Cộng tiền vào ví
                await connection.query(
                    `UPDATE customer_wallets 
                    SET balance = balance + ?, updated_at = NOW()
                    WHERE customer_id = ?`,
                    [amount, transaction.customer_id]
                );

                await connection.commit();
                connection.release();

                console.log('✅ Nạp tiền thành công:', {
                    customer_id: transaction.customer_id,
                    amount: amount,
                    transaction_id: transaction_id
                });

                res.json({ 
                    success: true,
                    message: 'Nạp tiền thành công' 
                });

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } else {
            // Giao dịch thất bại hoặc bị hủy
            await db.query(
                `UPDATE recharge_history 
                SET status = ?, response_message = ?, updated_at = NOW()
                WHERE recharge_id = ?`,
                [status, message, transaction.recharge_id]
            );

            res.json({ 
                success: false,
                message: 'Giao dịch không thành công' 
            });
        }

    } catch (error) {
        console.error('SePay callback error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi xử lý callback' 
        });
    }
});

// ENDPOINT CŨ ĐÃ BỊ XÓA - Dùng endpoint mới phía dưới với rechargeId thay vì orderId

/**
 * Xử lý redirect từ SePay (DEPRECATED - không dùng với QR flow)
 */
router.get('/callback', async (req, res) => {
    try {
        const { status, recharge_id } = req.query;

        // Lấy thông tin giao dịch
        const [transactions] = await db.query(
            'SELECT * FROM recharge_history WHERE recharge_id = ?',
            [recharge_id]
        );

        if (transactions.length === 0) {
            return res.redirect('/recharge.html?error=not_found');
        }

        const transaction = transactions[0];

        // Redirect về trang nạp tiền với kết quả
        if (status === 'success' || transaction.status === 'success') {
            return res.redirect(`/recharge.html?success=true&amount=${transaction.declared_amount}`);
        } else if (status === 'cancel') {
            return res.redirect('/recharge.html?error=cancelled');
        } else {
            return res.redirect('/recharge.html?error=failed');
        }

    } catch (error) {
        console.error('SePay redirect error:', error);
        res.redirect('/recharge.html?error=system');
    }
});

/**
 * Kiểm tra trạng thái giao dịch
 */
router.get('/check-status/:rechargeId', customerAuthMiddleware, async (req, res) => {
    try {
        const { rechargeId } = req.params;
        const customerId = req.customerId;

        const [transactions] = await db.query(
            'SELECT * FROM recharge_history WHERE recharge_id = ? AND customer_id = ?',
            [rechargeId, customerId]
        );

        if (transactions.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy giao dịch' 
            });
        }

        const transaction = transactions[0];

        res.json({
            success: true,
            data: {
                recharge_id: transaction.recharge_id,
                status: transaction.status,
                amount: transaction.declared_amount,
                actual_amount: transaction.actual_amount,
                message: transaction.response_message,
                created_at: transaction.created_at,
                completed_at: transaction.completed_at
            }
        });

    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi kiểm tra trạng thái' 
        });
    }
});

/**
 * TEST ONLY - Tạo test transaction để test webhook
 */
router.post('/test/create-transaction', async (req, res) => {
    try {
        const { order_invoice_number, amount, customer_id } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO recharge_history 
            (customer_id, request_id, recharge_type, declared_amount, status, response_message)
            VALUES (?, ?, 'sepay', ?, 'pending', 'Test transaction')`,
            [customer_id || 1, order_invoice_number, amount || 50000]
        );
        
        res.json({
            success: true,
            message: 'Test transaction created',
            recharge_id: result.insertId,
            order_invoice_number: order_invoice_number
        });
    } catch (error) {
        console.error('Create test transaction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
