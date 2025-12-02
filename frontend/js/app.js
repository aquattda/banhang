// API Base URL
const API_URL = '/api';

// Cart management (localStorage)
const Cart = {
    get: () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },
    
    set: (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    },
    
    add: (product, quantity = 1, gameInfo = {}) => {
        const cart = Cart.get();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                game_name: product.game_name,
                quantity: quantity,
                gameInfo: gameInfo
            });
        }
        
        Cart.set(cart);
        showNotification('Đã thêm vào giỏ hàng!', 'success');
    },
    
    remove: (productId) => {
        const cart = Cart.get();
        const newCart = cart.filter(item => item.id !== productId);
        Cart.set(newCart);
    },
    
    updateQuantity: (productId, quantity) => {
        const cart = Cart.get();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            Cart.set(cart);
        }
    },
    
    clear: () => {
        localStorage.removeItem('cart');
        updateCartCount();
    },
    
    getTotal: () => {
        const cart = Cart.get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
};

// Update cart count in header
function updateCartCount() {
    const cart = Cart.get();
    const count = cart.length; // Đếm số loại sản phẩm, không phải tổng số lượng
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'block' : 'none';
    }
}

// API calls
const API = {
    // Generic methods
    get: async (url, useAuth = false) => {
        const headers = { 'Content-Type': 'application/json' };
        if (useAuth) {
            const token = localStorage.getItem('admin_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, { headers });
        return response.json();
    },

    post: async (url, data, useAuth = false) => {
        const headers = { 'Content-Type': 'application/json' };
        if (useAuth) {
            const token = localStorage.getItem('admin_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return response.json();
    },

    put: async (url, data, useAuth = false) => {
        const headers = { 'Content-Type': 'application/json' };
        if (useAuth) {
            const token = localStorage.getItem('admin_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (url, useAuth = false) => {
        const headers = { 'Content-Type': 'application/json' };
        if (useAuth) {
            const token = localStorage.getItem('admin_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });
        return response.json();
    },

    // Games
    getGames: async () => {
        const response = await fetch(`${API_URL}/games`);
        return response.json();
    },
    
    getGameBySlug: async (slug) => {
        const response = await fetch(`${API_URL}/games/${slug}`);
        return response.json();
    },
    
    // Products
    getProducts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/products?${queryString}`);
        return response.json();
    },
    
    getFeaturedProducts: async () => {
        const response = await fetch(`${API_URL}/products/featured`);
        return response.json();
    },
    
    getLatestProducts: async () => {
        const response = await fetch(`${API_URL}/products/latest`);
        return response.json();
    },
    
    getProductById: async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`);
        return response.json();
    },
    
    // Categories
    getAllCategories: async () => {
        const response = await fetch(`${API_URL}/categories`);
        return response.json();
    },

    getCategoriesByGame: async (gameId) => {
        const response = await fetch(`${API_URL}/categories/game/${gameId}`);
        return response.json();
    },
    
    // Orders
    createOrder: async (orderData) => {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return response.json();
    },
    
    getOrderByCode: async (orderCode) => {
        const response = await fetch(`${API_URL}/orders/${orderCode}`);
        return response.json();
    },
    
    // Contact
    sendContact: async (contactData) => {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        return response.json();
    }
};

// Custom Modal Dialog
function showModal(options) {
    const {
        title = 'Thông báo',
        message = '',
        icon = '✓',
        confirmText = 'OK',
        cancelText = 'Hủy',
        onConfirm = () => {},
        onCancel = () => {},
        showCancel = false,
        showSnooze = false, // Thêm option để hiện nút tắt thông báo
        onSnooze = () => {}
    } = options;

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-icon ${showCancel ? 'warning' : 'success'}">${icon}</div>
        <h3 class="custom-modal-title">${title}</h3>
        <p class="custom-modal-message">${message}</p>
        <div class="custom-modal-buttons">
            ${showCancel ? `<button class="custom-modal-btn cancel-btn">${cancelText}</button>` : ''}
            <button class="custom-modal-btn confirm-btn">${confirmText}</button>
        </div>
        ${showSnooze ? '<button class="custom-modal-snooze">🔕 Đừng hiện lại trong 1 giờ</button>' : ''}
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add('show');
        modal.classList.add('show');
    }, 10);
    
    // Button handlers
    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const snoozeBtn = modal.querySelector('.custom-modal-snooze');
    
    const closeModal = () => {
        overlay.classList.remove('show');
        modal.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
    
    confirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            onCancel();
            closeModal();
        });
    }
    
    if (snoozeBtn) {
        snoozeBtn.addEventListener('click', () => {
            onSnooze();
            closeModal();
        });
    }
    
    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            onCancel();
            closeModal();
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto close
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// Get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Navigate to page
function navigateTo(path) {
    window.location.href = path;
}

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initMobileMenu();
});
