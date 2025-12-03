// Product detail page logic

let currentProduct = null;
let allProducts = [];

async function loadProductDetail() {
    const productId = getUrlParameter('id');
    const gameId = getUrlParameter('game_id');
    const categoryId = getUrlParameter('category_id');
    
    // Nếu có game_id và category_id → hiển thị danh sách sản phẩm
    if (gameId && categoryId) {
        await loadProductsList(gameId, categoryId);
        return;
    }
    
    // Nếu có id → hiển thị chi tiết 1 sản phẩm
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

// Load danh sách sản phẩm theo game và category
async function loadProductsList(gameId, categoryId) {
    try {
        const result = await API.getProducts({ game_id: gameId, category_id: categoryId, limit: 100 });
        
        if (!result.success || result.data.length === 0) {
            displayNoProducts();
            return;
        }

        allProducts = result.data;
        displayProductsList(allProducts);
    } catch (error) {
        console.error('Load products list error:', error);
        showNotification('Lỗi khi tải danh sách sản phẩm', 'error');
    }
}

// Hiển thị danh sách sản phẩm
function displayProductsList(products) {
    const container = document.getElementById('product-detail');
    
    // Lấy thông tin game và category từ sản phẩm đầu tiên
    const firstProduct = products[0];
    document.title = `${firstProduct.game_name} - ${firstProduct.category_name || 'Sản phẩm'} - GameShop`;
    
    let html = `
        <div class="products-list-container">
            <div class="products-header">
                <div class="breadcrumb">
                    <a href="/">Trang chủ</a> / 
                    <a href="/games.html">Danh mục Game</a> / 
                    <a href="/game-detail.html?parent=roblox">Roblox</a> / 
                    <a href="/game-detail.html?game_id=${firstProduct.game_id}">${firstProduct.game_name}</a> / 
                    ${firstProduct.category_name || 'Sản phẩm'}
                </div>
                <h1>🎮 ${firstProduct.game_name} - ${firstProduct.category_name || 'Sản phẩm'}</h1>
                <p>Tìm thấy ${products.length} sản phẩm</p>
            </div>
            
            <div class="products-grid">
    `;
    
    products.forEach(product => {
        html += `
            <div class="product-card" onclick="navigateTo('/product.html?id=${product.id}')">
                <div class="product-card-image">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}">` : '<div class="no-image">🎁</div>'}
                </div>
                <div class="product-card-body">
                    <h3 class="product-card-title">${product.name}</h3>
                    <div class="product-card-price">${formatCurrency(product.price)}</div>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
                        Thêm vào giỏ 🛒
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Hiển thị khi không có sản phẩm
function displayNoProducts() {
    const container = document.getElementById('product-detail');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <h2>😕 Không tìm thấy sản phẩm</h2>
            <p>Danh mục này chưa có sản phẩm nào.</p>
            <a href="/games.html" class="btn btn-primary" style="margin-top: 20px;">Quay lại danh mục</a>
        </div>
    `;
}

// Quick add to cart từ danh sách
async function quickAddToCart(productId) {
    try {
        const result = await API.getProductById(productId);
        if (result.success) {
            Cart.add(result.data, 1);
        }
    } catch (error) {
        console.error('Quick add to cart error:', error);
        showNotification('Lỗi khi thêm vào giỏ hàng', 'error');
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
                    <a href="/game-detail.html?game_id=${product.game_id}">${product.game_name}</a> / 
                    ${product.category_name ? `<a href="/product.html?game_id=${product.game_id}&category_id=${product.category_id}">${product.category_name}</a> / ` : ''}
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
                        <label class="form-label">Số lượng</label>
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                            <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="${product.stock}">
                            <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                        </div>
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

    Cart.add(currentProduct, quantity);
    
    // Kiểm tra xem có đang bị tắt thông báo không
    const snoozeUntil = localStorage.getItem('cart_modal_snooze');
    const now = Date.now();
    
    if (snoozeUntil && now < parseInt(snoozeUntil)) {
        // Đang trong thời gian tắt thông báo, chỉ hiện notification nhỏ
        showNotification('Đã thêm vào giỏ hàng!', 'success');
        return;
    }
    
    // Ask if user wants to continue shopping or go to cart
    showModal({
        title: 'Thành công!',
        message: 'Sản phẩm đã được thêm vào giỏ hàng. Bạn có muốn đi tới giỏ hàng không?',
        icon: '🛒',
        confirmText: 'Đi tới giỏ hàng',
        cancelText: 'Tiếp tục mua',
        showCancel: true,
        showSnooze: true,
        onConfirm: () => navigateTo('/cart.html'),
        onSnooze: () => {
            // Lưu thời gian tắt thông báo (1 giờ = 3600000ms)
            const snoozeTime = Date.now() + (60 * 60 * 1000);
            localStorage.setItem('cart_modal_snooze', snoozeTime.toString());
            showNotification('Đã tắt thông báo trong 1 giờ', 'info');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
});
