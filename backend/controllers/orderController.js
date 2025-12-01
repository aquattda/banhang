const db = require('../config/database');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const {
            buyer_name,
            buyer_phone,
            buyer_email,
            game_nickname,
            game_server,
            payment_method,
            note,
            items // Array: [{ product_id, quantity }]
        } = req.body;
        
        // Validate
        if (!buyer_name || !buyer_phone || !payment_method || !items || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        // Tính tổng tiền và lấy thông tin sản phẩm
        let total_amount = 0;
        const orderItems = [];
        
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT id, name, price, stock FROM products WHERE id = ? AND is_active = TRUE',
                [item.product_id]
            );
            
            if (products.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, error: `Product ${item.product_id} not found` });
            }
            
            const product = products[0];
            
            // Kiểm tra stock
            if (product.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ success: false, error: `Not enough stock for ${product.name}` });
            }
            
            const subtotal = product.price * item.quantity;
            total_amount += subtotal;
            
            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price,
                subtotal: subtotal
            });
        }
        
        // Tạo mã đơn hàng
        const order_code = 'ORD' + Date.now();
        
        // Insert order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (order_code, buyer_name, buyer_phone, buyer_email, game_nickname, game_server, 
             total_amount, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [order_code, buyer_name, buyer_phone, buyer_email, game_nickname, game_server, total_amount, payment_method, note]
        );
        
        const order_id = orderResult.insertId;
        
        // Insert order items
        for (const item of orderItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [order_id, item.product_id, item.product_name, item.quantity, item.price, item.subtotal]
            );
            
            // Update stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Order created successfully',
            data: {
                order_id,
                order_code,
                total_amount
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        connection.release();
    }
};

// Lấy thông tin đơn hàng theo order_code
const getOrderByCode = async (req, res) => {
    try {
        const { order_code } = req.params;
        
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE order_code = ?',
            [order_code]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        const [items] = await db.query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orders[0].id]
        );
        
        res.json({ 
            success: true, 
            data: {
                ...orders[0],
                items
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const { status, limit = 100, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM orders';
        const params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [orders] = await db.query(query, params);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status, note } = req.body;
        
        let query = 'UPDATE orders SET';
        const params = [];
        const updates = [];
        
        if (status) {
            updates.push(' status = ?');
            params.push(status);
        }
        
        if (payment_status) {
            updates.push(' payment_status = ?');
            params.push(payment_status);
        }
        
        if (note !== undefined) {
            updates.push(' note = ?');
            params.push(note);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        
        query += updates.join(',') + ' WHERE id = ?';
        params.push(id);
        
        await db.query(query, params);
        res.json({ success: true, message: 'Order updated' });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getOrderByCode,
    getAllOrders,
    updateOrderStatus
};
