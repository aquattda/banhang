const db = require('../config/database');
const crypto = require('crypto');

// Lấy thông tin ví của khách hàng
exports.getWallet = async (req, res) => {
    try {
        const customerId = req.customerId;

        const [wallets] = await db.query(
            'SELECT * FROM customer_wallets WHERE customer_id = ?',
            [customerId]
        );

        // Nếu chưa có ví, tạo mới
        if (wallets.length === 0) {
            await db.query(
                'INSERT INTO customer_wallets (customer_id, balance) VALUES (?, 0.00)',
                [customerId]
            );
            return res.json({ balance: 0.00 });
        }

        res.json({ balance: wallets[0].balance });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin ví' });
    }
};

// Lấy lịch sử nạp tiền
exports.getRechargeHistory = async (req, res) => {
    try {
        const customerId = req.customerId;
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT recharge_id, request_id, recharge_type, card_type, card_amount,
                   bank_name, declared_amount, actual_amount, fee_amount, fee_percent,
                   status, response_message, created_at, updated_at, completed_at
            FROM recharge_history
            WHERE customer_id = ?
        `;
        const params = [customerId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [history] = await db.query(query, params);

        // Đếm tổng số bản ghi
        let countQuery = 'SELECT COUNT(*) as total FROM recharge_history WHERE customer_id = ?';
        const countParams = [customerId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        const [countResult] = await db.query(countQuery, countParams);

        res.json({
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Get recharge history error:', error);
        res.status(500).json({ message: 'Lỗi lấy lịch sử nạp tiền' });
    }
};

// Lấy cấu hình phí thẻ cào
exports.getCardFees = async (req, res) => {
    try {
        const [fees] = await db.query(
            'SELECT card_type, fee_percent FROM card_fee_config WHERE is_active = 1 ORDER BY card_type'
        );
        res.json(fees);
    } catch (error) {
        console.error('Get card fees error:', error);
        res.status(500).json({ message: 'Lỗi lấy cấu hình phí' });
    }
};

// Nạp tiền bằng thẻ cào
exports.rechargeByCard = async (req, res) => {
    try {
        const customerId = req.customerId;
        const { card_type, card_serial, card_code, card_amount } = req.body;

        // Validate input
        if (!card_type || !card_serial || !card_code || !card_amount) {
            return res.status(400).json({ message: 'Thiếu thông tin thẻ cào' });
        }

        // Validate card amount (chỉ cho phép các mệnh giá hợp lệ)
        const validAmounts = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000];
        if (!validAmounts.includes(parseInt(card_amount))) {
            return res.status(400).json({ message: 'Mệnh giá thẻ không hợp lệ' });
        }

        // Lấy phí thẻ
        const [feeConfig] = await db.query(
            'SELECT fee_percent FROM card_fee_config WHERE card_type = ? AND is_active = 1',
            [card_type]
        );

        if (feeConfig.length === 0) {
            return res.status(400).json({ message: 'Loại thẻ không được hỗ trợ' });
        }

        const feePercent = feeConfig[0].fee_percent;
        const feeAmount = (card_amount * feePercent) / 100;
        const actualAmount = card_amount - feeAmount;

        // Tạo request_id unique
        const requestId = 'CARD_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

        // Lưu vào database với trạng thái pending
        const [result] = await db.query(
            `INSERT INTO recharge_history 
            (customer_id, request_id, recharge_type, card_type, card_serial, card_code, 
             card_amount, declared_amount, actual_amount, fee_amount, fee_percent, status)
            VALUES (?, ?, 'card', ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [customerId, requestId, card_type, card_serial, card_code, card_amount, 
             card_amount, actualAmount, feeAmount, feePercent]
        );

        const rechargeId = result.insertId;

        // Gọi API TheSieuRe (sẽ xử lý trong middleware)
        const thesieure = require('../middleware/thesieure');
        const apiResult = await thesieure.submitCard({
            request_id: requestId,
            card_type: card_type,
            card_serial: card_serial,
            card_code: card_code,
            card_amount: card_amount
        });

        // Cập nhật kết quả từ API
        await db.query(
            `UPDATE recharge_history 
            SET response_code = ?, response_message = ?, response_data = ?
            WHERE recharge_id = ?`,
            [apiResult.code, apiResult.message, JSON.stringify(apiResult), rechargeId]
        );

        // Nếu API trả về success ngay (hiếm khi xảy ra với thẻ cào)
        if (apiResult.code === '1') {
            await db.query(
                'UPDATE recharge_history SET status = ?, completed_at = NOW() WHERE recharge_id = ?',
                ['success', rechargeId]
            );
            
            // Cộng tiền vào ví
            await db.query(
                'UPDATE customer_wallets SET balance = balance + ? WHERE customer_id = ?',
                [actualAmount, customerId]
            );
        }

        res.json({
            success: true,
            message: 'Đã gửi yêu cầu nạp thẻ. Vui lòng đợi xác nhận.',
            request_id: requestId,
            recharge_id: rechargeId,
            declared_amount: card_amount,
            actual_amount: actualAmount,
            fee_amount: feeAmount,
            status: apiResult.code === '1' ? 'success' : 'pending'
        });

    } catch (error) {
        console.error('Recharge by card error:', error);
        res.status(500).json({ message: 'Lỗi nạp tiền bằng thẻ cào' });
    }
};

// Nạp tiền bằng chuyển khoản ngân hàng
exports.rechargeByBank = async (req, res) => {
    try {
        const customerId = req.customerId;
        const { bank_name, bank_account, bank_transaction_code, amount } = req.body;

        // Validate input
        if (!bank_name || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Thông tin chuyển khoản không hợp lệ' });
        }

        // Tạo request_id unique
        const requestId = 'BANK_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

        // Lưu vào database với trạng thái pending (chờ admin xác nhận)
        await db.query(
            `INSERT INTO recharge_history 
            (customer_id, request_id, recharge_type, bank_name, bank_account, 
             bank_transaction_code, declared_amount, status)
            VALUES (?, ?, 'bank', ?, ?, ?, ?, 'pending')`,
            [customerId, requestId, bank_name, bank_account, bank_transaction_code, amount]
        );

        res.json({
            success: true,
            message: 'Đã ghi nhận yêu cầu nạp tiền qua ngân hàng. Admin sẽ xác nhận trong vòng 24h.',
            request_id: requestId,
            declared_amount: amount
        });

    } catch (error) {
        console.error('Recharge by bank error:', error);
        res.status(500).json({ message: 'Lỗi nạp tiền qua ngân hàng' });
    }
};

// Callback từ TheSieuRe (webhook)
exports.handleCardCallback = async (req, res) => {
    try {
        const callbackData = req.body;
        console.log('TheSieuRe Callback:', callbackData);

        const { request_id, status, message, declared_value, value, amount } = callbackData;

        if (!request_id) {
            return res.status(400).json({ message: 'Missing request_id' });
        }

        // Validate signature (sẽ làm trong middleware)
        const thesieure = require('../middleware/thesieure');
        const isValid = thesieure.validateCallback(callbackData);
        if (!isValid) {
            console.error('Invalid callback signature');
            return res.status(403).json({ message: 'Invalid signature' });
        }

        // Tìm giao dịch trong database
        const [transactions] = await db.query(
            'SELECT * FROM recharge_history WHERE request_id = ?',
            [request_id]
        );

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const transaction = transactions[0];

        // Map status code từ TheSieuRe
        // 99 = pending, 1 = success, 2 = wrong_amount, 3 = invalid_card, 4 = maintenance
        let newStatus = 'pending';
        if (status === '1' || status === 1) {
            newStatus = 'success';
        } else if (status === '2' || status === 2) {
            newStatus = 'wrong_amount';
        } else if (status === '3' || status === 3) {
            newStatus = 'invalid_card';
        } else if (status === '4' || status === 4) {
            newStatus = 'maintenance';
        } else if (status === '99' || status === 99) {
            newStatus = 'pending';
        } else {
            newStatus = 'failed';
        }

        // Cập nhật trạng thái
        await db.query(
            `UPDATE recharge_history 
            SET status = ?, response_code = ?, response_message = ?, 
                actual_amount = ?, response_data = ?, 
                completed_at = IF(? = 'success', NOW(), completed_at),
                updated_at = NOW()
            WHERE request_id = ?`,
            [newStatus, status, message, amount || value, JSON.stringify(callbackData), newStatus, request_id]
        );

        // Nếu thành công, cộng tiền vào ví
        if (newStatus === 'success' && transaction.status !== 'success') {
            const actualAmount = amount || value || transaction.actual_amount;
            await db.query(
                'UPDATE customer_wallets SET balance = balance + ? WHERE customer_id = ?',
                [actualAmount, transaction.customer_id]
            );
            console.log(`Added ${actualAmount} to customer ${transaction.customer_id} wallet`);
        }

        res.json({ success: true, message: 'Callback processed' });

    } catch (error) {
        console.error('Handle card callback error:', error);
        res.status(500).json({ message: 'Callback processing failed' });
    }
};

// Admin: Xác nhận nạp tiền qua ngân hàng
exports.confirmBankRecharge = async (req, res) => {
    try {
        const { recharge_id, status, actual_amount } = req.body;

        if (!recharge_id || !status) {
            return res.status(400).json({ message: 'Thiếu thông tin' });
        }

        // Kiểm tra quyền admin (middleware sẽ xử lý)

        // Lấy thông tin giao dịch
        const [transactions] = await db.query(
            'SELECT * FROM recharge_history WHERE recharge_id = ? AND recharge_type = "bank"',
            [recharge_id]
        );

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        const transaction = transactions[0];

        // Cập nhật trạng thái
        await db.query(
            `UPDATE recharge_history 
            SET status = ?, actual_amount = ?, completed_at = NOW(), updated_at = NOW()
            WHERE recharge_id = ?`,
            [status, actual_amount || transaction.declared_amount, recharge_id]
        );

        // Nếu xác nhận thành công, cộng tiền vào ví
        if (status === 'success') {
            const amountToAdd = actual_amount || transaction.declared_amount;
            await db.query(
                'UPDATE customer_wallets SET balance = balance + ? WHERE customer_id = ?',
                [amountToAdd, transaction.customer_id]
            );
        }

        res.json({ success: true, message: 'Đã cập nhật trạng thái giao dịch' });

    } catch (error) {
        console.error('Confirm bank recharge error:', error);
        res.status(500).json({ message: 'Lỗi xác nhận giao dịch' });
    }
};
