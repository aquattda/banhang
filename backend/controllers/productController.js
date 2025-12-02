const db = require('../config/database');

// Lấy sản phẩm với filter & sort
const getProducts = async (req, res) => {
    try {
        const { 
            game_id, 
            category_id, 
            min_price, 
            max_price, 
            sort = 'name',
            order = 'ASC',
            limit = 50 
        } = req.query;
        
        let query = `
            SELECT p.product_id as id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.is_featured, 
                   p.is_active, p.created_at, p.updated_at,
                   g.name as game_name, g.slug as game_slug, c.name as category_name 
            FROM products p 
            JOIN games g ON p.game_id = g.game_id 
            JOIN categories c ON p.category_id = c.category_id 
            WHERE p.is_active = TRUE
        `;
        const params = [];
        
        if (game_id) {
            query += ' AND p.game_id = ?';
            params.push(game_id);
        }
        
        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }
        
        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(min_price);
        }
        
        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(max_price);
        }
        
        // Validate sort field
        const validSorts = ['name', 'price', 'created_at'];
        const sortField = validSorts.includes(sort) ? sort : 'name';
        const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY p.${sortField} ${sortOrder} LIMIT ?`;
        params.push(parseInt(limit));
        
        const [products] = await db.query(query, params);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
    try {
        console.log('Fetching featured products...');
        const [products] = await db.query(`
            SELECT p.product_id as id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.is_featured, 
                   p.is_active, p.created_at, p.updated_at,
                   g.name as game_name, g.slug as game_slug 
            FROM products p 
            JOIN games g ON p.game_id = g.game_id 
            WHERE p.is_active = TRUE 
            ORDER BY p.is_featured DESC, p.created_at DESC 
            LIMIT 8
        `);
        console.log(`Found ${products.length} products`);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

// Lấy sản phẩm mới nhất
const getLatestProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.product_id as id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.is_featured, 
                   p.is_active, p.created_at, p.updated_at,
                   g.name as game_name, g.slug as game_slug 
            FROM products p 
            JOIN games g ON p.game_id = g.game_id 
            WHERE p.is_active = TRUE 
            ORDER BY p.created_at DESC 
            LIMIT 8
        `);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Get latest products error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

// Lấy chi tiết sản phẩm
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.query(`
            SELECT p.product_id as id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.is_featured, 
                   p.is_active, p.created_at, p.updated_at,
                   g.name as game_name, g.slug as game_slug, c.name as category_name 
            FROM products p 
            JOIN games g ON p.game_id = g.game_id 
            JOIN categories c ON p.category_id = c.category_id 
            WHERE p.product_id = ? AND p.is_active = TRUE
        `, [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        res.json({ success: true, data: products[0] });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Tạo sản phẩm
const createProduct = async (req, res) => {
    try {
        const { 
            game_id, category_id, name, description, price, 
            unit, image_url, is_featured, stock, min_age 
        } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock_quantity) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [game_id, category_id, name, description, price, unit || 'VNĐ', image_url, is_featured || false, stock || 999]
        );
        
        res.json({ success: true, message: 'Product created', productId: result.insertId });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            game_id, category_id, name, description, price, 
            unit, image_url, is_active, is_featured, stock, min_age 
        } = req.body;
        
        await db.query(
            `UPDATE products SET game_id = ?, category_id = ?, name = ?, description = ?, 
             price = ?, unit = ?, image_url = ?, is_active = ?, is_featured = ?, stock_quantity = ?, min_age = ? 
             WHERE product_id = ?`,
            [game_id, category_id, name, description, price, unit, image_url, is_active, is_featured, stock, min_age, id]
        );
        
        res.json({ success: true, message: 'Product updated' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE product_id = ?', [id]);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    getProducts,
    getFeaturedProducts,
    getLatestProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
