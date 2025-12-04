// Customer Auth utilities
const CustomerAuth = {
    getToken: () => localStorage.getItem('customer_token'),
    
    getCustomer: () => {
        const customerInfo = localStorage.getItem('customer_info');
        return customerInfo ? JSON.parse(customerInfo) : null;
    },
    
    isLoggedIn: () => {
        return !!CustomerAuth.getToken();
    },
    
    logout: () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        window.location.href = '/';
    },
    
    updateHeader: () => {
        const authBtn = document.getElementById('auth-btn');
        if (!authBtn) return;
        
        if (CustomerAuth.isLoggedIn()) {
            const customer = CustomerAuth.getCustomer();
            authBtn.innerHTML = `
                <div class="user-menu">
                    <button class="user-btn" onclick="toggleUserMenu()">
                        👤 ${customer?.name || 'Tài khoản'}
                    </button>
                    <div class="user-dropdown" id="user-dropdown">
                        <a href="/account.html">📋 Tài khoản của tôi</a>
                        <a href="/account.html" onclick="event.preventDefault(); switchToOrders()">🛍️ Đơn hàng của tôi</a>
                        <a href="#" onclick="event.preventDefault(); CustomerAuth.logout()">🚪 Đăng xuất</a>
                    </div>
                </div>
            `;
        } else {
            authBtn.innerHTML = `<a href="/login.html" class="cart-btn">🔐 Đăng nhập</a>`;
        }
    },
    
    getAuthHeaders: () => {
        const token = CustomerAuth.getToken();
        return token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        } : {
            'Content-Type': 'application/json'
        };
    }
};

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function switchToOrders() {
    window.location.href = '/account.html?tab=orders';
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Update header on page load
document.addEventListener('DOMContentLoaded', () => {
    CustomerAuth.updateHeader();
});
