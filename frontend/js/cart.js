// Cart page logic

function loadCart() {
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

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '🎁'}
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
        </div>
    `).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const total = Cart.getTotal();
    
    document.getElementById('subtotal').textContent = formatCurrency(total);
    document.getElementById('total').textContent = formatCurrency(total);
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        if (confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            removeFromCart(productId);
        }
        return;
    }

    Cart.updateQuantity(productId, newQuantity);
    loadCart();
}

function removeFromCart(productId) {
    Cart.remove(productId);
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

    const formData = new FormData(e.target);
    const orderData = {
        buyer_name: formData.get('buyer_name'),
        buyer_phone: formData.get('buyer_phone'),
        buyer_email: formData.get('buyer_email'),
        game_nickname: formData.get('game_nickname'),
        game_server: formData.get('game_server'),
        payment_method: formData.get('payment_method'),
        note: formData.get('note'),
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang xử lý...';
        submitBtn.disabled = true;

        const result = await API.createOrder(orderData);

        if (result.success) {
            // Clear cart
            Cart.clear();

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updatePaymentInfo();

    // Payment method change listener
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', updatePaymentInfo);
    });

    // Form submit listener
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
});
