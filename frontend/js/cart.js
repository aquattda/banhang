// Cart page logic

// Đồng bộ giá từ API cho các sản phẩm trong giỏ
async function syncCartPrices() {
    const cart = Cart.get();
    if (cart.length === 0) return;
    
    let hasUpdates = false;
    
    // Lấy giá mới nhất từ API cho từng sản phẩm
    for (const item of cart) {
        try {
            const result = await API.getProductById(item.id);
            if (result.success && result.data) {
                const currentPrice = result.data.price;
                if (item.price !== currentPrice) {
                    item.price = currentPrice;
                    hasUpdates = true;
                    console.log(`Updated price for ${item.name}: ${formatCurrency(currentPrice)}`);
                }
            }
        } catch (error) {
            console.error(`Failed to sync price for product ${item.id}:`, error);
        }
    }
    
    // Lưu lại giỏ hàng với giá mới
    if (hasUpdates) {
        Cart.set(cart);
        showNotification('Giá sản phẩm đã được cập nhật', 'info');
    }
}

// Lấy trạng thái đã chọn từ localStorage
function getSelectedItems() {
    const selected = localStorage.getItem('cart_selected_items');
    return selected ? JSON.parse(selected) : [];
}

// Lưu trạng thái đã chọn vào localStorage
function saveSelectedItems(selectedIds) {
    localStorage.setItem('cart_selected_items', JSON.stringify(selectedIds));
}

async function loadCart() {
    // Đồng bộ giá từ API trước khi hiển thị
    await syncCartPrices();
    
    const cart = Cart.get();
    const cartItemsContainer = document.getElementById('cart-items');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Giỏ hàng của bạn đang trống</p>
                <a href="/" class="btn btn-primary">Tiếp tục mua sắm</a>
            </div>
        `;
        updateCartSummary();
        return;
    }

    // Lấy danh sách đã chọn trước đó
    const selectedItems = getSelectedItems();
    const cartItemIds = cart.map(item => item.id);
    
    // Nếu chưa có gì được lưu, chọn tất cả mặc định
    const shouldSelectAll = selectedItems.length === 0;
    
    // Lọc lại danh sách chỉ giữ items còn tồn tại trong giỏ
    const validSelectedItems = selectedItems.filter(id => cartItemIds.includes(id));

    cartItemsContainer.innerHTML = `
        <div class="cart-select-all">
            <label class="cart-checkbox-label">
                <input type="checkbox" id="select-all-items" onchange="toggleSelectAll(this.checked)">
                <span>Chọn tất cả (${cart.length} sản phẩm)</span>
            </label>
        </div>
    ` + cart.map((item, index) => {
        const isChecked = shouldSelectAll || validSelectedItems.includes(item.id);
        return `
        <div class="cart-item" data-item-id="${item.id}">
            <label class="cart-item-checkbox">
                <input type="checkbox" class="item-select-checkbox" data-item-id="${item.id}" onchange="updateCartSelection()" ${isChecked ? 'checked' : ''}>
            </label>
            <div class="cart-item-image">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" onerror="this.parentElement.innerHTML='🎁'" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '🎁'}
            </div>
            <div class="cart-item-details">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-game">🎮 ${item.game_name}</div>
                    ${item.gameInfo && item.gameInfo.nickname ? `<small>👤 ${item.gameInfo.nickname}</small>` : ''}
                </div>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="cart-remove-btn" onclick="removeFromCart(${item.id})" title="Xóa">🗑️</button>
                <div class="cart-quantity-control">
                    <button class="cart-quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="cart-quantity-value">${item.quantity}</span>
                    <button class="cart-quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
        </div>`;
    }).join('');

    updateCartSelection();
}

// Toggle select all items
function toggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.item-select-checkbox');
    checkboxes.forEach(cb => cb.checked = checked);
    updateCartSelection();
}

// Update cart selection and calculate total
function updateCartSelection() {
    const cart = Cart.get();
    const checkboxes = document.querySelectorAll('.item-select-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-items');
    
    let selectedCount = 0;
    let total = 0;
    const selectedIds = [];
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedCount++;
            const itemId = parseInt(cb.dataset.itemId);
            selectedIds.push(itemId);
            const item = cart.find(i => i.id === itemId);
            if (item) {
                total += item.price * item.quantity;
            }
        }
    });
    
    // Lưu trạng thái đã chọn vào localStorage
    saveSelectedItems(selectedIds);
    
    // Update select all checkbox state
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selectedCount === checkboxes.length;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
    }
    
    // Update summary
    document.getElementById('subtotal').textContent = formatCurrency(total);
    document.getElementById('total').textContent = formatCurrency(total);
    
    // Update select all text
    const selectAllLabel = document.querySelector('.cart-select-all span');
    if (selectAllLabel) {
        selectAllLabel.textContent = `Chọn tất cả (${selectedCount}/${cart.length} sản phẩm)`;
    }
}

function updateCartSummary() {
    updateCartSelection();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        showModal({
            title: 'Xác nhận',
            message: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
            icon: '🗑️',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            showCancel: true,
            onConfirm: () => removeFromCart(productId)
        });
        return;
    }

    Cart.updateQuantity(productId, newQuantity);
    loadCart();
}

function removeFromCart(productId) {
    Cart.remove(productId);
    
    // Xóa sản phẩm khỏi danh sách đã chọn trong localStorage
    const currentSelected = getSelectedItems();
    const newSelected = currentSelected.filter(id => id !== productId);
    saveSelectedItems(newSelected);
    
    loadCart();
    showNotification('Đã xóa khỏi giỏ hàng', 'success');
}

// Payment method display
function updatePaymentInfo() {
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    const paymentInfo = document.getElementById('payment-info');

    if (paymentMethod === 'bank_transfer') {
        paymentInfo.innerHTML = `
            <h4>📋 Thông tin chuyển khoản</h4>
            <p><strong>Ngân hàng:</strong> Vietcombank</p>
            <p><strong>Số tài khoản:</strong> 0123456789</p>
            <p><strong>Chủ tài khoản:</strong> NGUYEN VAN A</p>
            <p><strong>Nội dung:</strong> <span style="color: var(--primary-color);">GAMESHOP [SĐT]</span></p>
            <p style="margin-top: 15px; font-size: 14px; color: var(--text-light);">
                ⚠️ Vui lòng ghi đúng nội dung để đơn hàng được xử lý nhanh nhất
            </p>
        `;
    } else if (paymentMethod === 'momo') {
        paymentInfo.innerHTML = `
            <h4>📱 Thông tin MoMo</h4>
            <p><strong>Số điện thoại:</strong> 0123-456-789</p>
            <p><strong>Tên:</strong> NGUYEN VAN A</p>
            <p><strong>Nội dung:</strong> <span style="color: var(--primary-color);">GAMESHOP [SĐT]</span></p>
            <p style="margin-top: 15px; font-size: 14px; color: var(--text-light);">
                ⚠️ Sau khi chuyển khoản, vui lòng chụp ảnh bill gửi Zalo để được xử lý nhanh
            </p>
        `;
    }
}

// Handle checkout form submit
async function handleCheckout(e) {
    e.preventDefault();

    const cart = Cart.get();
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }

    // Lấy danh sách sản phẩm được chọn
    const selectedCheckboxes = document.querySelectorAll('.item-select-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showNotification('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!', 'warning');
        return;
    }

    const selectedItems = [];
    selectedCheckboxes.forEach(cb => {
        const itemId = parseInt(cb.dataset.itemId);
        const item = cart.find(i => i.id === itemId);
        if (item) {
            selectedItems.push({
                product_id: item.id,
                quantity: item.quantity
            });
        }
    });

    const formData = new FormData(e.target);
    
    // Get customer info - kiểm tra trực tiếp localStorage
    let customer_id = null;
    
    if (window.CustomerAuth && typeof CustomerAuth.isLoggedIn === 'function' && CustomerAuth.isLoggedIn()) {
        const customer = CustomerAuth.getCustomer();
        customer_id = customer?.customer_id || null;
        console.log('=== CHECKOUT DEBUG ===');
        console.log('Logged in via CustomerAuth');
        console.log('Customer:', customer);
        console.log('Customer ID:', customer_id);
    } else {
        // Fallback: check localStorage directly
        const customerInfo = localStorage.getItem('customer_info');
        if (customerInfo) {
            try {
                const parsed = JSON.parse(customerInfo);
                customer_id = parsed.customer_id || null;
                console.log('=== CHECKOUT DEBUG (Fallback) ===');
                console.log('Using localStorage directly');
                console.log('Customer ID:', customer_id);
            } catch (e) {
                console.error('Failed to parse customer_info:', e);
            }
        }
    }
    
    const orderData = {
        buyer_name: formData.get('buyer_name'),
        buyer_phone: formData.get('buyer_phone'),
        buyer_email: formData.get('buyer_email') || '',
        payment_method: formData.get('payment_method'),
        note: formData.get('note') || '',
        customer_id: customer_id,
        items: selectedItems
    };
    
    console.log('Final order data:', orderData);

    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang xử lý...';
        submitBtn.disabled = true;

        const result = await API.createOrder(orderData);

        if (result.success) {
            // Xóa chỉ các sản phẩm đã chọn khỏi giỏ hàng
            const removedIds = [];
            selectedCheckboxes.forEach(cb => {
                const itemId = parseInt(cb.dataset.itemId);
                Cart.remove(itemId);
                removedIds.push(itemId);
            });

            // Cập nhật lại localStorage: xóa các sản phẩm đã thanh toán khỏi danh sách đã chọn
            const currentSelected = getSelectedItems();
            const newSelected = currentSelected.filter(id => !removedIds.includes(id));
            saveSelectedItems(newSelected);

            // Show success and redirect
            showNotification('Đặt hàng thành công!', 'success');
            
            // Redirect to order confirmation page
            setTimeout(() => {
                navigateTo(`/order-success.html?code=${result.data.order_code}`);
            }, 1000);
        } else {
            showNotification(result.error || 'Đặt hàng thất bại', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Lỗi khi đặt hàng. Vui lòng thử lại', 'error');
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Xác Nhận Đặt Hàng 🎉';
        submitBtn.disabled = false;
    }
}

// // Auto-fill thông tin nếu đã đăng nhập
// function autoFillCustomerInfo() {
//     // Kiểm tra xem có đăng nhập không
//     if (window.CustomerAuth && CustomerAuth.isLoggedIn()) {
//         const customer = CustomerAuth.getCustomer();
//         if (customer) {
//             const nameInput = document.querySelector('input[name="buyer_name"]');
//             const phoneInput = document.querySelector('input[name="buyer_phone"]');
//             const emailInput = document.querySelector('input[name="buyer_email"]');
            
//             // Tự động điền thông tin nếu có
//             if (nameInput && customer.name) {
//                 nameInput.value = customer.name;
//             }
            
//             if (phoneInput && customer.phone) {
//                 phoneInput.value = customer.phone;
//             }
            
//             if (emailInput && customer.email) {
//                 emailInput.value = customer.email;
//             }
//         }
//     }
// }

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadCart(); // Load cart và sync giá
    updatePaymentInfo();
    // autoFillCustomerInfo(); // Auto-fill thông tin khách hàng nếu đã đăng nhập

    // Payment method change listener
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', updatePaymentInfo);
    });

    // Form submit listener
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
});
