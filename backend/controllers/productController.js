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
            SELECT p.product_id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.sold_count, p.is_featured, 
                   p.is_active, p.created_at, p.updated_at,
                   g.name as game_name, g.slug as game_slug, c.name as category_name 
            FROM products p 
            JOIN games g ON p.game_id = g.game_id 
            JOIN categories c ON p.category_id = c.category_id 
            WHERE 1=1
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
            SELECT p.product_id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.cost_price, p.unit, p.image_url, p.stock_quantity, p.sold_count, p.is_featured, 
                   p.is_active, p.created_at, p.updated_at,
                   g.name as game_name, g.slug as game_slug 
            FROM products p 
            JOIN games g ON p.game_id = g.game_id 
            WHERE p.is_active = TRUE AND p.sold_count > 0
            ORDER BY p.sold_count DESC 
            LIMIT 8
        `);
        console.log(`Found ${products.length} featured products with sales`);
        products.forEach(p => console.log(`- ${p.name}: image_url = ${p.image_url}`));
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
            SELECT p.product_id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.sold_count, p.is_featured, 
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
            SELECT p.product_id, p.game_id, p.category_id, p.name, p.description, 
                   p.price, p.unit, p.image_url, p.stock_quantity, p.sold_count, p.is_featured, 
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
            game_id, category_id, name, description, price, cost_price,
            unit, image_url, is_featured, stock_quantity, is_active 
        } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO products (game_id, category_id, name, description, price, cost_price, unit, image_url, is_featured, stock_quantity, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [game_id, category_id, name, description, price, cost_price || 0, unit || 'VNĐ', image_url, is_featured || 0, stock_quantity || 999, is_active !== undefined ? is_active : 1]
        );
        
        res.json({ success: true, message: 'Product created', productId: result.insertId });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

// Admin: Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            game_id, category_id, name, description, price, cost_price,
            unit, image_url, is_active, is_featured, stock_quantity 
        } = req.body;
        
        await db.query(
            `UPDATE products SET game_id = ?, category_id = ?, name = ?, description = ?, 
             price = ?, cost_price = ?, unit = ?, image_url = ?, is_active = ?, is_featured = ?, stock_quantity = ? 
             WHERE product_id = ?`,
            [game_id, category_id, name, description, price, cost_price || 0, unit || 'VNĐ', image_url, is_active, is_featured, stock_quantity, id]
        );
        
        res.json({ success: true, message: 'Product updated' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

// Admin: Xóa sản phẩm
const deleteProduct = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        
        // Kiểm tra trạng thái sản phẩm
        const [products] = await connection.query(
            'SELECT is_active, name FROM products WHERE product_id = ?',
            [id]
        );
        
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy sản phẩm' 
            });
        }
        
        const product = products[0];
        const isActive = product.is_active;
        
        // Kiểm tra xem sản phẩm có trong đơn hàng không
        const [orderItems] = await connection.query(
            'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
            [id]
        );
        
        const hasOrders = orderItems[0].count > 0;
        
        console.log(`Delete product ${id}: is_active=${isActive}, hasOrders=${hasOrders}`);
        
        // Nếu sản phẩm đang bán (is_active = 1) và đã có trong đơn hàng
        if (isActive === 1 && hasOrders) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể xóa sản phẩm đang bán và đã có đơn hàng. Vui lòng chuyển sang trạng thái "Ngừng bán" trước khi xóa.',
                code: 'PRODUCT_IN_USE'
            });
        }
        
        // Nếu sản phẩm đã ngừng bán (is_active = 0) VÀ có trong đơn hàng
        // => Xóa reference trong order_items trước (set product_id = NULL hoặc giữ tên sản phẩm)
        if (isActive === 0 && hasOrders) {
            // Cập nhật order_items: set product_id = NULL nhưng giữ lại product_name
            await connection.query(
                'UPDATE order_items SET product_id = NULL WHERE product_id = ?',
                [id]
            );
            console.log(`Updated order_items: set product_id = NULL for product ${id}`);
        }
        
        // Bây giờ có thể xóa sản phẩm an toàn
        await connection.query('DELETE FROM products WHERE product_id = ?', [id]);
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Xóa sản phẩm thành công' 
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Delete product error:', error);
        
        // Xử lý lỗi foreign key constraint
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể xóa sản phẩm do ràng buộc dữ liệu. Vui lòng liên hệ quản trị viên.',
                code: 'FOREIGN_KEY_CONSTRAINT'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi hệ thống khi xóa sản phẩm',
            error: error.message
        });
    } finally {
        connection.release();
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
