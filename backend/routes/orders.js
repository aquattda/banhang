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

// Admin routes (đặt trước để tránh conflict)
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);
router.patch('/:id', authMiddleware, adminMiddleware, updateOrderStatus);

// Public route (đặt sau)
router.get('/:order_code', getOrderByCode);

module.exports = router;
