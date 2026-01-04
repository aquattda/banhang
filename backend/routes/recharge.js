const express = require('express');
const router = express.Router();
const rechargeController = require('../controllers/rechargeController');
const customerAuth = require('../middleware/auth');

// Routes cho khách hàng (yêu cầu đăng nhập)
router.get('/wallet', customerAuth.verifyCustomerToken, rechargeController.getWallet);
router.get('/history', customerAuth.verifyCustomerToken, rechargeController.getRechargeHistory);
router.get('/card-fees', rechargeController.getCardFees);
router.post('/card', customerAuth.verifyCustomerToken, rechargeController.rechargeByCard);
router.post('/bank', customerAuth.verifyCustomerToken, rechargeController.rechargeByBank);

// Get pending transactions for manual webhook test
router.get('/pending-transactions', async (req, res) => {
    try {
        const db = require('../config/database');
        const [transactions] = await db.query(
            `SELECT recharge_id, customer_id, request_id, declared_amount, status, created_at 
            FROM recharge_history 
            WHERE status = 'pending' 
            ORDER BY created_at DESC 
            LIMIT 10`
        );
        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Get pending transactions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Callback từ TheSieuRe (không cần auth)
router.post('/callback/card', rechargeController.handleCardCallback);

// Routes cho admin (TODO: thêm admin auth middleware)
router.post('/admin/confirm-bank', rechargeController.confirmBankRecharge);

module.exports = router;
