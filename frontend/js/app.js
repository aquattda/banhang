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
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'block' : 'none';
    }
}

// API calls
const API = {
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

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.animation = 'slideIn 0.3s ease';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
