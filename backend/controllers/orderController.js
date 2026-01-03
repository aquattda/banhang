const db = require('../config/database');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        console.log('=== CREATE ORDER REQUEST ===');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        const {
            buyer_name,
            buyer_phone,
            buyer_email,
            payment_method,
            note,
            customer_id, // ID khách hàng nếu đã đăng nhập
            items // Array: [{ product_id, quantity }]
        } = req.body;
        
        // Validate
        if (!buyer_name || !buyer_phone || !items || items.length === 0) {
            console.log('Validation failed:', { buyer_name, buyer_phone, items_length: items?.length });
            await connection.rollback();
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        // Tính tổng tiền và lấy thông tin sản phẩm
        let total_amount = 0;
        const orderItems = [];
        
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT product_id, name, price, cost_price, stock_quantity FROM products WHERE product_id = ? AND is_active = TRUE',
                [item.product_id]
            );
            
            if (products.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, error: `Product ${item.product_id} not found` });
            }
            
            const product = products[0];
            
            // Kiểm tra stock
            if (product.stock_quantity < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ success: false, error: `Not enough stock for ${product.name}` });
            }
            
            const subtotal = product.price * item.quantity;
            total_amount += subtotal;
            
            orderItems.push({
                product_id: product.product_id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price,
                cost_price: product.cost_price || 0,
                subtotal: subtotal
            });
        }
        
        // Tạo mã đơn hàng
        const order_code = 'ORD' + Date.now();
        
        // Insert order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (order_code, customer_id, customer_name, customer_phone, customer_email, 
             total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [order_code, customer_id || null, buyer_name, buyer_phone, buyer_email || '', total_amount, note || '']
        );
        
        const order_id = orderResult.insertId;
        
        // Insert order items
        for (const item of orderItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, unit_cost_price, subtotal) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [order_id, item.product_id, item.product_name, item.quantity, item.price, item.cost_price, item.subtotal]
            );
            
            // Update stock
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
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
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
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
            [orders[0].order_id]
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

// Admin: Lấy chi tiết đơn hàng theo ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [id]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        // Lấy order items - unit_cost_price đã lưu giá nhập tại thời điểm đặt hàng
        const [items] = await db.query(
            `SELECT oi.* 
             FROM order_items oi
             WHERE oi.order_id = ?`,
            [id]
        );
        
        res.json({ 
            success: true, 
            data: {
                ...orders[0],
                items
            }
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { status, payment_status, note } = req.body;
        
        // Lấy trạng thái cũ của đơn hàng
        const [orders] = await connection.query('SELECT status FROM orders WHERE order_id = ?', [id]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        const oldStatus = orders[0].status;
        
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
            updates.push(' notes = ?');
            params.push(note);
        }
        
        if (updates.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        
        query += updates.join(',') + ' WHERE order_id = ?';
        params.push(id);
        
        await connection.query(query, params);
        
        // Nếu đơn hàng chuyển sang "completed", cập nhật sold_count và payment_status
        if (status === 'completed' && oldStatus !== 'completed') {
            // Tự động set thanh toán = đã thanh toán
            await connection.query(
                'UPDATE orders SET payment_status = "paid" WHERE order_id = ?',
                [id]
            );
            
            const [orderItems] = await connection.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );
            
            for (const item of orderItems) {
                await connection.query(
                    'UPDATE products SET sold_count = sold_count + ? WHERE product_id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Order updated' });
    } catch (error) {
        await connection.rollback();
        console.error('Update order error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        connection.release();
    }
};

// Admin: Xóa đơn hàng
const deleteOrder = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        
        // Kiểm tra đơn hàng có tồn tại
        const [orders] = await connection.query('SELECT * FROM orders WHERE order_id = ?', [id]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        // Xóa order items trước
        await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);
        
        // Xóa đơn hàng
        await connection.query('DELETE FROM orders WHERE order_id = ?', [id]);
        
        await connection.commit();
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Delete order error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    } finally {
        connection.release();
    }
};

// Customer: Lấy đơn hàng của mình
const getCustomerOrders = async (req, res) => {
    try {
        const customer_id = req.user.customer_id;
        
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
            [customer_id]
        );
        
        // Lấy items cho từng order
        for (let order of orders) {
            const [items] = await db.query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.order_id]
            );
            order.items = items;
        }
        
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getOrderByCode,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getCustomerOrders
};
