const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    createOrder,
    getOrderByCode,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);

// Admin routes (đặt trước để tránh conflict)
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/detail/:id', authMiddleware, adminMiddleware, getOrderById);
router.patch('/:id', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

// Public route (đặt sau)
router.get('/:order_code', getOrderByCode);

module.exports = router;
