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
        const authBtnModern = document.getElementById('auth-btn-modern');
        
        if (CustomerAuth.isLoggedIn()) {
            const customer = CustomerAuth.getCustomer();
            const userMenuHTML = `
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
            
            const modernUserMenuHTML = `
                <div class="header-user-menu">
                    <button class="header-user-btn" onclick="toggleUserMenu()">
                        <span class="icon">👤</span>
                        <span>${customer?.name || 'Tài khoản'}</span>
                    </button>
                    <div class="user-dropdown" id="user-dropdown">
                        <a href="/account.html">📋 Tài khoản của tôi</a>
                        <a href="/account.html" onclick="event.preventDefault(); switchToOrders()">🛍️ Đơn hàng của tôi</a>
                        <a href="#" onclick="event.preventDefault(); CustomerAuth.logout()">🚪 Đăng xuất</a>
                    </div>
                </div>
            `;
            
            if (authBtn) authBtn.innerHTML = userMenuHTML;
            if (authBtnModern) authBtnModern.innerHTML = modernUserMenuHTML;
        } else {
            const loginHTML = `<a href="/login.html" class="cart-btn">🔐 Đăng nhập</a>`;
            const modernLoginHTML = `<a href="/login.html" class="header-btn">🔐 Đăng nhập</a>`;
            
            if (authBtn) authBtn.innerHTML = loginHTML;
            if (authBtnModern) authBtnModern.innerHTML = modernLoginHTML;
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
