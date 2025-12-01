// Dashboard page logic

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
        const ordersResult = await AdminAPI.getAllOrders({ limit: 1000 });
        const orders = ordersResult.data || [];

        // Get all products
        const productsResult = await AdminAPI.getAllProducts();
        const products = productsResult.data || [];

        // Get contacts
        const contactsResult = await AdminAPI.getAllContacts();
        const contacts = contactsResult.data || [];

        // Calculate stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const totalProducts = products.length;
        const newContacts = contacts.filter(c => c.status === 'new').length;

        // Display stats
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('new-contacts').textContent = newContacts;

    } catch (error) {
        console.error('Load stats error:', error);
    }
}

async function loadRecentOrders() {
    try {
        const result = await AdminAPI.getAllOrders({ limit: 10 });
        
        if (!result.success || !result.data || result.data.length === 0) {
            document.getElementById('recent-orders').innerHTML = `
                <tr><td colspan="6" style="text-align: center;">Chưa có đơn hàng</td></tr>
            `;
            return;
        }

        const orders = result.data;
        
        document.getElementById('recent-orders').innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.order_code}</strong></td>
                <td>
                    ${order.buyer_name}<br>
                    <small style="color: var(--text-light);">${order.buyer_phone}</small>
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
                        <button class="btn btn-primary btn-sm" onclick="window.location.href='/admin/order-detail.html?id=${order.id}'">
                            Chi tiết
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Load recent orders error:', error);
        document.getElementById('recent-orders').innerHTML = `
            <tr><td colspan="6" style="text-align: center; color: var(--danger);">Lỗi khi tải đơn hàng</td></tr>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboard);
