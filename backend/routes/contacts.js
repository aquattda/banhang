const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    createContact,
    getAllContacts,
    updateContactStatus
} = require('../controllers/contactController');

// Public routes
router.post('/', createContact);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllContacts);
router.patch('/:id', authMiddleware, adminMiddleware, updateContactStatus);

module.exports = router;
