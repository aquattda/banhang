const db = require('../config/database');

// Lấy tất cả games đang active
const getAllGames = async (req, res) => {
    try {
        const [games] = await db.query(
            'SELECT * FROM games WHERE is_active = TRUE ORDER BY display_order ASC, name ASC'
        );
        
        // Lấy tất cả slugs cho mỗi game
        for (let game of games) {
            const [slugs] = await db.query(
                'SELECT slug FROM game_slugs WHERE game_id = ? ORDER BY is_primary DESC, slug ASC',
                [game.game_id]
            );
            game.slugs = slugs.map(s => s.slug);
            game.slug = game.slugs[0] || null; // Slug đầu tiên là primary
        }
        
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
        
        // Tìm game thông qua bảng game_slugs
        const [slugData] = await db.query(
            'SELECT game_id FROM game_slugs WHERE slug = ?',
            [slug]
        );
        
        if (slugData.length === 0) {
            return res.status(404).json({ success: false, error: 'Game not found' });
        }
        
        const [games] = await db.query(
            'SELECT * FROM games WHERE game_id = ? AND is_active = TRUE',
            [slugData[0].game_id]
        );
        
        if (games.length === 0) {
            return res.status(404).json({ success: false, error: 'Game not found' });
        }
        
        // Lấy tất cả slugs của game này
        const [slugs] = await db.query(
            'SELECT slug FROM game_slugs WHERE game_id = ? ORDER BY is_primary DESC',
            [games[0].game_id]
        );
        games[0].slugs = slugs.map(s => s.slug);
        games[0].slug = games[0].slugs[0] || null;
        
        res.json({ success: true, data: games[0] });
    } catch (error) {
        console.error('Get game error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Tạo game mới
const createGame = async (req, res) => {
    try {
        const { name, slugs, description, display_order, image_url } = req.body;
        
        console.log('Creating game with data:', { name, slugs, description, display_order, image_url });
        
        // Validate slugs
        if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one slug is required' });
        }
        
        // Tạo game (không cần slug column nữa)
        const [result] = await db.query(
            'INSERT INTO games (name, description, display_order, image_url) VALUES (?, ?, ?, ?)',
            [name, description, display_order || 0, image_url || null]
        );
        
        const gameId = result.insertId;
        
        // Thêm tất cả slugs vào bảng game_slugs
        for (let i = 0; i < slugs.length; i++) {
            await db.query(
                'INSERT INTO game_slugs (game_id, slug, is_primary) VALUES (?, ?, ?)',
                [gameId, slugs[i], i === 0] // Slug đầu tiên là primary
            );
        }
        
        res.json({ success: true, message: 'Game created', gameId: gameId });
    } catch (error) {
        console.error('Create game error:', error);
        console.error('Error details:', error.message);
        
        // Check for duplicate slug error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: 'Một trong các slug đã tồn tại' });
        }
        
        res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

// Admin: Cập nhật game
const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slugs, description, display_order, image_url } = req.body;
        
        // Validate slugs
        if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one slug is required' });
        }
        
        // Cập nhật thông tin game
        await db.query(
            'UPDATE games SET name = ?, description = ?, display_order = ?, image_url = ? WHERE game_id = ?',
            [name, description, display_order || 0, image_url || null, id]
        );
        
        // Xóa tất cả slugs cũ
        await db.query('DELETE FROM game_slugs WHERE game_id = ?', [id]);
        
        // Thêm slugs mới
        for (let i = 0; i < slugs.length; i++) {
            await db.query(
                'INSERT INTO game_slugs (game_id, slug, is_primary) VALUES (?, ?, ?)',
                [id, slugs[i], i === 0] // Slug đầu tiên là primary
            );
        }
        
        res.json({ success: true, message: 'Game updated' });
    } catch (error) {
        console.error('Update game error:', error);
        
        // Check for duplicate slug error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: 'Một trong các slug đã tồn tại' });
        }
        
        res.status(500).json({ success: false, error: error.message || 'Server error' });
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
