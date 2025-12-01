// Product detail page logic

let currentProduct = null;

async function loadProductDetail() {
    const productId = getUrlParameter('id');
    
    if (!productId) {
        showNotification('Không tìm thấy sản phẩm', 'error');
        setTimeout(() => navigateTo('/'), 2000);
        return;
    }

    try {
        const result = await API.getProductById(productId);
        
        if (!result.success) {
            showNotification('Không tìm thấy sản phẩm', 'error');
            setTimeout(() => navigateTo('/'), 2000);
            return;
        }

        currentProduct = result.data;
        displayProduct(currentProduct);
    } catch (error) {
        console.error('Load product error:', error);
        showNotification('Lỗi khi tải sản phẩm', 'error');
    }
}

function displayProduct(product) {
    document.title = `${product.name} - GameShop`;
    
    const container = document.getElementById('product-detail');
    container.innerHTML = `
        <div class="product-container">
            <div class="product-image-section">
                <div class="product-image-large">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:15px;">` : '🎁'}
                </div>
            </div>

            <div class="product-info-section">
                <div class="product-breadcrumb">
                    <a href="/">Trang chủ</a> / 
                    <a href="/game.html?slug=${product.game_slug}">${product.game_name}</a> / 
                    ${product.name}
                </div>

                <h1 class="product-title">${product.name}</h1>

                <div class="product-price-box">
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div>/ ${product.unit}</div>
                </div>

                <div class="product-description">
                    <h3>📝 Mô tả sản phẩm</h3>
                    <p>${product.description || 'Sản phẩm chính hãng, giao hàng nhanh chóng.'}</p>
                </div>

                <div class="product-form">
                    <h3>🛒 Thêm vào giỏ hàng</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Nickname / UID trong game (tùy chọn)</label>
                        <input type="text" id="game-nickname" class="form-input" placeholder="VD: PlayerName123">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Server / Khu vực (tùy chọn)</label>
                        <input type="text" id="game-server" class="form-input" placeholder="VD: Việt Nam, Asia, Server 1">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Số lượng</label>
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                            <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="${product.stock}">
                            <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                        </div>
                        <small style="color: var(--text-light);">Còn lại: ${product.stock} ${product.unit}</small>
                    </div>

                    <button class="btn btn-primary btn-lg" onclick="addToCart()" style="width: 100%;">
                        Thêm vào giỏ hàng 🛒
                    </button>
                </div>

                <div class="product-warning">
                    <strong>⚠️ Lưu ý an toàn:</strong>
                    <ul>
                        <li>Chúng tôi KHÔNG BAO GIỜ yêu cầu mật khẩu game của bạn</li>
                        <li>Thời gian xử lý: 5-15 phút sau khi thanh toán</li>
                        <li>Liên hệ hỗ trợ qua Zalo nếu có vấn đề</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function changeQuantity(delta) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value) + delta;
    
    if (value < 1) value = 1;
    if (value > currentProduct.stock) value = currentProduct.stock;
    
    input.value = value;
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const gameNickname = document.getElementById('game-nickname').value;
    const gameServer = document.getElementById('game-server').value;

    const gameInfo = {
        nickname: gameNickname,
        server: gameServer
    };

    Cart.add(currentProduct, quantity, gameInfo);
    
    // Ask if user wants to continue shopping or go to cart
    if (confirm('Đã thêm vào giỏ hàng! Bạn có muốn đi tới giỏ hàng không?')) {
        navigateTo('/cart.html');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
});
