const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Đăng ký khách hàng mới
const register = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { email, password, name, phone, address } = req.body;
        
        // Validate
        if (!email || !password || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, mật khẩu và tên là bắt buộc' 
            });
        }
        
        // Kiểm tra email tồn tại
        const [existingUsers] = await connection.query(
            'SELECT customer_id FROM customers WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email đã được sử dụng' 
            });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Insert customer
        const [result] = await connection.query(
            `INSERT INTO customers (email, password_hash, name, phone, address) 
             VALUES (?, ?, ?, ?, ?)`,
            [email, password_hash, name, phone || null, address || null]
        );
        
        const customer_id = result.insertId;
        
        // Tạo token
        const token = jwt.sign(
            { customer_id, email, type: 'customer' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                token,
                customer: {
                    customer_id,
                    email,
                    name,
                    phone,
                    address
                }
            }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Đăng nhập
const login = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { email, password } = req.body;
        
        // Validate
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email và mật khẩu là bắt buộc' 
            });
        }
        
        // Tìm customer
        const [customers] = await connection.query(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );
        
        if (customers.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }
        
        const customer = customers[0];
        
        // Kiểm tra password
        const validPassword = await bcrypt.compare(password, customer.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }
        
        // Tạo token
        const token = jwt.sign(
            { customer_id: customer.customer_id, email: customer.email, type: 'customer' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        // Không trả về password_hash
        delete customer.password_hash;
        
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                customer
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Lấy thông tin profile
const getProfile = async (req, res) => {
    try {
        const customer_id = req.user.customer_id;
        
        const [customers] = await db.query(
            'SELECT customer_id, email, name, phone, address, avatar, is_verified, created_at FROM customers WHERE customer_id = ?',
            [customer_id]
        );
        
        if (customers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy tài khoản' 
            });
        }
        
        res.json({
            success: true,
            data: customers[0]
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Cập nhật profile
const updateProfile = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const customer_id = req.user.customer_id;
        const { name, phone, address, avatar } = req.body;
        
        const updates = [];
        const params = [];
        
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
        }
        if (avatar !== undefined) {
            updates.push('avatar = ?');
            params.push(avatar);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không có thông tin để cập nhật' 
            });
        }
        
        params.push(customer_id);
        
        await connection.query(
            `UPDATE customers SET ${updates.join(', ')} WHERE customer_id = ?`,
            params
        );
        
        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const customer_id = req.user.customer_id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mật khẩu cũ và mật khẩu mới là bắt buộc' 
            });
        }
        
        // Lấy password hiện tại
        const [customers] = await connection.query(
            'SELECT password_hash FROM customers WHERE customer_id = ?',
            [customer_id]
        );
        
        if (customers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy tài khoản' 
            });
        }
        
        // Kiểm tra mật khẩu cũ
        const validPassword = await bcrypt.compare(currentPassword, customers[0].password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Mật khẩu hiện tại không đúng' 
            });
        }
        
        // Hash mật khẩu mới
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // Cập nhật
        await connection.query(
            'UPDATE customers SET password_hash = ? WHERE customer_id = ?',
            [newPasswordHash, customer_id]
        );
        
        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Lấy lịch sử đơn hàng
const getOrderHistory = async (req, res) => {
    try {
        const customer_id = req.user.customer_id;
        const { limit = 50, offset = 0 } = req.query;
        
        const [orders] = await db.query(
            `SELECT * FROM orders 
             WHERE customer_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [customer_id, parseInt(limit), parseInt(offset)]
        );
        
        // Lấy items cho mỗi order
        for (let order of orders) {
            const [items] = await db.query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.order_id]
            );
            order.items = items;
        }
        
        res.json({
            success: true,
            data: orders
        });
        
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getOrderHistory
};
