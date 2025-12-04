const express = require('express');
const router = express.Router();
const { customerAuthMiddleware } = require('../middleware/auth');
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getOrderHistory
} = require('../controllers/customerAuthController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', customerAuthMiddleware, getProfile);
router.put('/profile', customerAuthMiddleware, updateProfile);
router.post('/change-password', customerAuthMiddleware, changePassword);
router.get('/orders', customerAuthMiddleware, getOrderHistory);

module.exports = router;
