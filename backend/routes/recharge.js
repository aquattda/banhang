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

// Callback từ TheSieuRe (không cần auth)
router.post('/callback/card', rechargeController.handleCardCallback);

// Routes cho admin (TODO: thêm admin auth middleware)
router.post('/admin/confirm-bank', rechargeController.confirmBankRecharge);

module.exports = router;
