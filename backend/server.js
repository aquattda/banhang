const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contacts', require('./routes/contacts'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   🎮 Game Items Shop Server Started 🎮           ║
╠═══════════════════════════════════════════════════╣
║   Port: ${PORT}                                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║   URL: http://localhost:${PORT}                    ║
╚═══════════════════════════════════════════════════╝
    `);
});

module.exports = app;
