const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getAllGames,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame
} = require('../controllers/gameController');

// Public routes
router.get('/', getAllGames);
router.get('/:slug', getGameBySlug);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createGame);
router.put('/:id', authMiddleware, adminMiddleware, updateGame);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGame);

module.exports = router;
