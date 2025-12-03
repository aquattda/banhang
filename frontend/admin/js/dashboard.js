// Dashboard page logic
let currentDashboardPage = 1;
const dashboardItemsPerPage = 10;
let allRecentOrders = [];

async function loadDashboard() {
    const auth = checkAdminAuth();
    if (!auth) return;

    // Display admin name
    document.getElementById('admin-name').textContent = auth.user.name;

    // Load statistics
    await loadStats();

    // Load recent orders
    await loadRecentOrders();
}

async function loadStats() {
    try {
        // Get all orders
        let totalOrders = 0;
        let pendingOrders = 0;
        let totalProducts = 0;
        let newContacts = 0;

        try {
            const ordersResult = await AdminAPI.getAllOrders({ limit: 1000 });
            if (ordersResult.success && ordersResult.data) {
                const orders = ordersResult.data;
                totalOrders = orders.length;
                pendingOrders = orders.filter(o => o.status === 'pending').length;
            }
        } catch (err) {
            console.error('Load orders stats error:', err);
        }

        try {
            const productsResult = await fetch('/api/products?limit=1000');
            const productsData = await productsResult.json();
            if (productsData.success && productsData.data) {
                totalProducts = productsData.data.length;
            }
        } catch (err) {
            console.error('Load products stats error:', err);
        }

        try {
            const contactsResult = await AdminAPI.getAllContacts();
            if (contactsResult.success && contactsResult.data) {
                const contacts = contactsResult.data;
                newContacts = contacts.filter(c => c.status === 'new').length;
            }
        } catch (err) {
            console.error('Load contacts stats error:', err);
        }

        // Display stats
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('new-contacts').textContent = newContacts;

    } catch (error) {
        console.error('Load stats error:', error);
        showNotification('Lỗi khi tải thống kê', 'error');
    }
}

async function loadRecentOrders() {
    try {
        const result = await AdminAPI.getAllOrders({ limit: 1000 });
        
        if (!result.success || !result.data || result.data.length === 0) {
            document.getElementById('recent-orders').innerHTML = `
                <tr><td colspan="6" style="text-align: center;">Chưa có đơn hàng</td></tr>
            `;
            document.getElementById('dashboard-pagination').innerHTML = '';
            return;
        }

        allRecentOrders = result.data;
        displayRecentOrders(allRecentOrders);

    } catch (error) {
        console.error('Load recent orders error:', error);
        document.getElementById('recent-orders').innerHTML = `
            <tr><td colspan="6" style="text-align: center; color: var(--danger);">Lỗi khi tải đơn hàng</td></tr>
        `;
    }
}

function displayRecentOrders(orders) {
    const totalPages = Math.ceil(orders.length / dashboardItemsPerPage);
    
    if (currentDashboardPage > totalPages && totalPages > 0) {
        currentDashboardPage = totalPages;
    }
    if (currentDashboardPage < 1) {
        currentDashboardPage = 1;
    }

    const startIndex = (currentDashboardPage - 1) * dashboardItemsPerPage;
    const endIndex = startIndex + dashboardItemsPerPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    document.getElementById('recent-orders').innerHTML = paginatedOrders.map(order => `
        <tr>
            <td><strong>${order.order_code}</strong></td>
            <td>
                ${order.customer_name}<br>
                <small style="color: var(--text-light);">${order.customer_phone}</small>
            </td>
            <td><strong>${formatCurrency(order.total_amount)}</strong></td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td><small>${formatDate(order.created_at)}</small></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="window.location.href='/admin/orders.html'">
                        Chi tiết
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderDashboardPagination(orders.length);
}

function renderDashboardPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / dashboardItemsPerPage);
    const startItem = (currentDashboardPage - 1) * dashboardItemsPerPage + 1;
    const endItem = Math.min(currentDashboardPage * dashboardItemsPerPage, totalItems);

    let paginationHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <button class="btn btn-secondary btn-sm" onclick="changeDashboardPage(${currentDashboardPage - 1})" ${currentDashboardPage === 1 ? 'disabled' : ''}>
                ← Trang trước
            </button>
            <span style="font-size: 14px;">
                Hiển thị ${startItem}-${endItem} trong tổng ${totalItems} đơn hàng | Trang ${currentDashboardPage}/${totalPages}
            </span>
            <button class="btn btn-secondary btn-sm" onclick="changeDashboardPage(${currentDashboardPage + 1})" ${currentDashboardPage === totalPages ? 'disabled' : ''}>
                Trang sau →
            </button>
        </div>
    `;

    document.getElementById('dashboard-pagination').innerHTML = paginationHTML;
}

function changeDashboardPage(page) {
    const totalPages = Math.ceil(allRecentOrders.length / dashboardItemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentDashboardPage = page;
    displayRecentOrders(allRecentOrders);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboard);
