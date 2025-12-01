const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getCategoriesByGame,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Public routes
router.get('/game/:game_id', getCategoriesByGame);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
