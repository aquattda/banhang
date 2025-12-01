// Admin authentication utilities

function checkAdminAuth() {
    const token = localStorage.getItem('admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

    if (!token || user.role !== 'admin') {
        window.location.href = '/admin/login.html';
        return false;
    }

    return { token, user };
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login.html';
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Admin API calls
const AdminAPI = {
    // Orders
    getAllOrders: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/orders/all${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    updateOrderStatus: async (orderId, data) => {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Products
    getAllProducts: async () => {
        const response = await fetch('/api/products?limit=1000', {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    createProduct: async (productData) => {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        return response.json();
    },

    updateProduct: async (productId, productData) => {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        return response.json();
    },

    deleteProduct: async (productId) => {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Games
    getAllGames: async () => {
        const response = await fetch('/api/games');
        return response.json();
    },

    createGame: async (gameData) => {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(gameData)
        });
        return response.json();
    },

    updateGame: async (gameId, gameData) => {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(gameData)
        });
        return response.json();
    },

    deleteGame: async (gameId) => {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Contacts
    getAllContacts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`/api/contacts?${queryString}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    updateContactStatus: async (contactId, status) => {
        const response = await fetch(`/api/contacts/${contactId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        return response.json();
    }
};

// Display utilities
function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-pending';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
}

function getPaymentStatusText(status) {
    const texts = {
        'unpaid': 'Chưa thanh toán',
        'paid': 'Đã thanh toán',
        'refunded': 'Đã hoàn tiền'
    };
    return texts[status] || status;
}
