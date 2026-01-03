const db = require('../config/database');

// Lấy tất cả games đang active
const getAllGames = async (req, res) => {
    try {
        const [games] = await db.query(
            'SELECT * FROM games WHERE is_active = TRUE ORDER BY display_order ASC, name ASC'
        );
        res.json({ success: true, data: games });
    } catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Lấy thông tin game theo slug
const getGameBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [games] = await db.query(
            'SELECT * FROM games WHERE slug = ? AND is_active = TRUE',
            [slug]
        );
        
        if (games.length === 0) {
            return res.status(404).json({ success: false, error: 'Game not found' });
        }
        
        res.json({ success: true, data: games[0] });
    } catch (error) {
        console.error('Get game error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Tạo game mới
const createGame = async (req, res) => {
    try {
        const { name, slug, description, display_order, image_url } = req.body;
        
        console.log('Creating game with data:', { name, slug, description, display_order, image_url });
        
        const [result] = await db.query(
            'INSERT INTO games (name, slug, description, display_order, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, slug, description, display_order || 0, image_url || null]
        );
        
        res.json({ success: true, message: 'Game created', gameId: result.insertId });
    } catch (error) {
        console.error('Create game error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

// Admin: Cập nhật game
const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, display_order, image_url } = req.body;
        
        await db.query(
            'UPDATE games SET name = ?, slug = ?, description = ?, display_order = ?, image_url = ? WHERE game_id = ?',
            [name, slug, description, display_order || 0, image_url || null, id]
        );
        
        res.json({ success: true, message: 'Game updated' });
    } catch (error) {
        console.error('Update game error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Xóa game
const deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM games WHERE game_id = ?', [id]);
        res.json({ success: true, message: 'Game deleted' });
    } catch (error) {
        console.error('Delete game error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    getAllGames,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame
};
