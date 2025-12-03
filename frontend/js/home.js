// Home page logic

// Load games
async function loadGames() {
    try {
        const result = await API.getGames();
        
        if (result.success && result.data.length > 0) {
            displayGames(result.data);
        } else {
            document.getElementById('games-list').innerHTML = '<p class="text-center">Không có game nào.</p>';
        }
    } catch (error) {
        console.error('Load games error:', error);
        document.getElementById('games-list').innerHTML = '<p class="text-center alert-error">Lỗi khi tải danh sách game.</p>';
    }
}

// Display games
function displayGames(games) {
    const gamesContainer = document.getElementById('games-list');
    
    // Game icons mapping (emoji fallback)
    const gameIcons = {
        'roblox': '🎮',
        'lien-quan': '⚔️',
        'free-fire': '🔫',
        'genshin': '✨',
        'pubg': '🎯',
        'minecraft': '⛏️',
        'bloxfruits': '🍇',
        'king-legacy': '👑',
        'strongest-battlegrounds': '💪',
        'code-roblox': '🎮',
        'sols-rng': '🎰',
        'heroes-battlegrounds': '🦸',
        'rivals': '🔫',
        'jujutsu-shenanigans': '⚡',
        'blue-lock-rivals': '⚽',
        'forsaken': '🗡️',
        'fish-it': '🐟'
    };
    
    gamesContainer.innerHTML = games.map(game => `
        <div class="card game-card" onclick="navigateTo('/game-detail.html?game_id=${game.game_id}')">
            <div class="game-card-icon">${gameIcons[game.slug] || '🎮'}</div>
            <h3 class="game-card-name">${game.name}</h3>
            <p class="game-card-desc">${game.description || ''}</p>
            <button class="btn btn-primary">Xem vật phẩm</button>
        </div>
    `).join('');
}

// Load featured products
async function loadFeaturedProducts() {
    try {
        const result = await API.getFeaturedProducts();
        
        if (result.success && result.data.length > 0) {
            displayFeaturedProducts(result.data);
        } else {
            document.getElementById('featured-products').innerHTML = '<p class="text-center">Chưa có sản phẩm nổi bật.</p>';
        }
    } catch (error) {
        console.error('Load featured products error:', error);
        document.getElementById('featured-products').innerHTML = '<p class="text-center alert-error">Lỗi khi tải sản phẩm.</p>';
    }
}

// Display featured products
function displayFeaturedProducts(products) {
    const productsContainer = document.getElementById('featured-products');
    
    productsContainer.innerHTML = products.map(product => `
        <div class="card product-card" onclick="navigateTo('/product.html?id=${product.id}')">
            <div class="product-badge">⭐ Nổi bật</div>
            <div class="product-card-img">
                ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : '🎁'}
            </div>
            <div class="card-body">
                <span class="product-game-tag">${product.game_name}</span>
                <h3 class="card-title">${product.name}</h3>
                <div class="product-sold">🔥 Đã bán: <strong>${product.sold_count || 0}</strong></div>
                <div class="card-price">${formatCurrency(product.price)}</div>
                <button class="btn btn-primary" onclick="event.stopPropagation(); addToCartQuick(${product.id})">
                    Thêm vào giỏ 🛒
                </button>
            </div>
        </div>
    `).join('');
}

// Quick add to cart
async function addToCartQuick(productId) {
    try {
        const result = await API.getProductById(productId);
        if (result.success) {
            Cart.add(result.data, 1);
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showNotification('Lỗi khi thêm vào giỏ hàng', 'error');
    }
}

// Load latest products
async function loadLatestProducts() {
    try {
        const result = await API.getLatestProducts();
        
        if (result.success && result.data.length > 0) {
            displayLatestProducts(result.data);
        } else {
            document.getElementById('latest-products').innerHTML = '<p class="text-center">Chưa có sản phẩm mới.</p>';
        }
    } catch (error) {
        console.error('Load latest products error:', error);
        document.getElementById('latest-products').innerHTML = '<p class="text-center alert-error">Lỗi khi tải sản phẩm.</p>';
    }
}

// Display latest products
function displayLatestProducts(products) {
    const productsContainer = document.getElementById('latest-products');
    
    productsContainer.innerHTML = products.map(product => `
        <div class="card product-card" onclick="navigateTo('/product.html?id=${product.id}')">
            <div class="product-badge new">🆕 Mới</div>
            <div class="product-card-img">
                ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : '🎁'}
            </div>
            <div class="card-body">
                <span class="product-game-tag">${product.game_name}</span>
                <h3 class="card-title">${product.name}</h3>
                <div class="product-sold">📊 Đã bán: <strong>${product.sold_count || 0}</strong></div>
                <div class="card-price">${formatCurrency(product.price)}</div>
                <button class="btn btn-primary" onclick="event.stopPropagation(); addToCartQuick(${product.id})">
                    Thêm vào giỏ 🛒
                </button>
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    loadLatestProducts();
});
