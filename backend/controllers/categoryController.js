const db = require('../config/database');

// Lấy tất cả categories với thông tin game và parent
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT c.*, g.name as game_name, 
                   pc.name as parent_name
            FROM categories c
            LEFT JOIN games g ON c.game_id = g.game_id
            LEFT JOIN categories pc ON c.parent_id = pc.category_id
            ORDER BY c.game_id, c.display_order, c.name
        `);
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Lấy categories theo game
const getCategoriesByGame = async (req, res) => {
    try {
        const { game_id } = req.params;
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE game_id = ? ORDER BY name',
            [game_id]
        );
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Tạo category
const createCategory = async (req, res) => {
    try {
        const { game_id, parent_id, name, description, display_order, is_active } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO categories (game_id, parent_id, name, description, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [game_id, parent_id || null, name, description || '', display_order || 0, is_active !== undefined ? is_active : 1]
        );
        
        res.json({ success: true, message: 'Category created', categoryId: result.insertId });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

// Admin: Cập nhật category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { game_id, parent_id, name, description, display_order, is_active } = req.body;
        
        await db.query(
            'UPDATE categories SET game_id = ?, parent_id = ?, name = ?, description = ?, display_order = ?, is_active = ? WHERE category_id = ?',
            [game_id, parent_id || null, name, description || '', display_order || 0, is_active !== undefined ? is_active : 1, id]
        );
        
        res.json({ success: true, message: 'Category updated' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

// Admin: Xóa category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    getAllCategories,
    getCategoriesByGame,
    createCategory,
    updateCategory,
    deleteCategory
};
