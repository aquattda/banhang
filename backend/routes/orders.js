const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    createOrder,
    getOrderByCode,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);
router.get('/:order_code', getOrderByCode);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.patch('/:id', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
