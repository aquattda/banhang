const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getProducts,
    getFeaturedProducts,
    getLatestProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
