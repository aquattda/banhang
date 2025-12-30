const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware, customerAuthMiddleware } = require('../middleware/auth');
const {
    createOrder,
    getOrderByCode,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getCustomerOrders
} = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);

// Customer routes (yêu cầu đăng nhập customer)
router.get('/my-orders', customerAuthMiddleware, getCustomerOrders);

// Admin routes (đặt trước để tránh conflict)
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/detail/:id', authMiddleware, adminMiddleware, getOrderById);
router.patch('/:id', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

// Public route (đặt sau)
router.get('/:order_code', getOrderByCode);

module.exports = router;
