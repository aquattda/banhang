// Game page logic

let currentGame = null;
let allProducts = [];
let categories = [];

// Load game info and products
async function loadGamePage() {
    const slug = getUrlParameter('slug');
    
    if (!slug) {
        showNotification('Không tìm thấy game', 'error');
        setTimeout(() => navigateTo('/'), 2000);
        return;
    }

    try {
        // Load game info
        const gameResult = await API.getGameBySlug(slug);
        
        if (!gameResult.success) {
            showNotification('Không tìm thấy game', 'error');
            setTimeout(() => navigateTo('/'), 2000);
            return;
        }

        currentGame = gameResult.data;
        displayGameInfo(currentGame);

        // Load categories
        const categoriesResult = await API.getCategoriesByGame(currentGame.id);
        if (categoriesResult.success) {
            categories = categoriesResult.data;
            populateCategoryFilter(categories);
        }

        // Load products
        await loadProducts();

    } catch (error) {
        console.error('Load game page error:', error);
        showNotification('Lỗi khi tải trang', 'error');
    }
}

// Display game info
function displayGameInfo(game) {
    const gameIcons = {
        'roblox': '🎮',
        'lien-quan': '⚔️',
        'free-fire': '🔫',
        'genshin': '✨'
    };

    document.getElementById('game-header').innerHTML = `
        <div class="game-info">
            <div class="game-icon-large">${gameIcons[game.slug] || '🎮'}</div>
            <div class="game-details">
                <h1>${game.name}</h1>
                <p>${game.description || 'Mua vật phẩm nhanh chóng và an toàn'}</p>
            </div>
        </div>
    `;

    document.title = `${game.name} - GameShop`;
}

// Populate category filter
function populateCategoryFilter(categories) {
    const select = document.getElementById('filter-category');
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// Load products
async function loadProducts() {
    try {
        const result = await API.getProducts({ game_id: currentGame.id, limit: 100 });
        
        if (result.success) {
            allProducts = result.data;
            applyFilters();
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error('Load products error:', error);
        showNotification('Lỗi khi tải sản phẩm', 'error');
    }
}

// Apply filters
function applyFilters() {
    const categoryFilter = document.getElementById('filter-category').value;
    const priceFilter = document.getElementById('filter-price').value;
    const sortFilter = document.getElementById('filter-sort').value;

    let filtered = [...allProducts];

    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category_id == categoryFilter);
    }

    // Filter by price
    if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(Number);
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    // Sort
    const [sortField, sortOrder] = sortFilter.split('-');
    filtered.sort((a, b) => {
        let compareA = sortField === 'price' ? a.price : a.name.toLowerCase();
        let compareB = sortField === 'price' ? b.price : b.name.toLowerCase();

        if (sortOrder === 'asc') {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });

    displayProducts(filtered);
}

// Display products
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');

    if (products.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    grid.innerHTML = products.map(product => `
        <div class="card product-card">
            <div class="product-card-img" onclick="navigateTo('/product.html?id=${product.product_id}')">
                ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : '🎁'}
            </div>
            <div class="card-body">
                <span class="product-game-tag">${product.category_name}</span>
                <h3 class="card-title">${product.name}</h3>
                <p class="card-text">${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
                <div class="card-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="navigateTo('/product.html?id=${product.product_id}')">
                        Chi tiết
                    </button>
                    <button class="btn btn-primary" onclick="quickBuyNow(${product.product_id})">
                        Mua ngay ⚡
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display no results
function displayNoResults() {
    document.getElementById('products-grid').style.display = 'none';
    document.getElementById('no-results').style.display = 'block';
}

// Reset filters
function resetFilters() {
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-price').value = '';
    document.getElementById('filter-sort').value = 'name-asc';
    applyFilters();
}

// Quick buy now - redirect to cart with exclusive selection
async function quickBuyNow(productId) {
    try {
        const result = await API.getProductById(productId);
        if (result.success) {
            Cart.add(result.data, 1);
            const productIdToUse = result.data.product_id || result.data.id;
            localStorage.setItem('cart_selected_items', JSON.stringify([productIdToUse]));
            showNotification('Đã thêm vào giỏ hàng! Đang chuyển đến thanh toán...', 'success');
            setTimeout(() => navigateTo('/cart.html'), 500);
        }
    } catch (error) {
        console.error('Buy now error:', error);
        showNotification('Lỗi khi mua hàng', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGamePage();
});
