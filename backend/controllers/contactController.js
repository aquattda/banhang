const db = require('../config/database');

// Tạo contact message
const createContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !message || (!email && !phone)) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        const [result] = await db.query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );
        
        res.json({ success: true, message: 'Message sent successfully', messageId: result.insertId });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Lấy tất cả contact messages
const getAllContacts = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = 'SELECT * FROM contact_messages';
        const params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [contacts] = await db.query(query, params);
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Admin: Cập nhật trạng thái contact
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await db.query(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [status, id]
        );
        
        res.json({ success: true, message: 'Contact status updated' });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    createContact,
    getAllContacts,
    updateContactStatus
};
