const db = require('../config/database');

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
        const { game_id, name, description } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO categories (game_id, name, description) VALUES (?, ?, ?)',
            [game_id, name, description]
        );
        
        res.json({ success: true, message: 'Category created', categoryId: result.insertId });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Cập nhật category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { game_id, name, description } = req.body;
        
        await db.query(
            'UPDATE categories SET game_id = ?, name = ?, description = ? WHERE id = ?',
            [game_id, name, description, id]
        );
        
        res.json({ success: true, message: 'Category updated' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Xóa category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    getCategoriesByGame,
    createCategory,
    updateCategory,
    deleteCategory
};
