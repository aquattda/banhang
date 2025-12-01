const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Admin login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Register (optional - cho customer)
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields required' });
        }
        
        // Check if email exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, 'customer']
        );
        
        // Generate token
        const token = jwt.sign(
            { id: result.insertId, email, role: 'customer' },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            message: 'User registered',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role: 'customer'
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    login,
    register
};
