-- Database Schema for Game Items Shop
-- Tạo database
CREATE DATABASE IF NOT EXISTS banhang_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banhang_game;

-- Bảng users (người dùng và admin)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng games
CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng categories (nhóm sản phẩm trong game)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng products (sản phẩm)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(100) DEFAULT 'gói',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    stock INT DEFAULT 999999,
    min_age INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_category_id (category_id),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng orders (đơn hàng)
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    buyer_email VARCHAR(255),
    game_nickname VARCHAR(255),
    game_server VARCHAR(255),
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_code (order_code),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng order_items (chi tiết đơn hàng)
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng contact_messages (tin nhắn liên hệ)
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status ENUM('new', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng banners (tuỳ chọn - banner trang chủ)
CREATE TABLE banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    position VARCHAR(50) DEFAULT 'hero',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_position (position),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert dữ liệu mẫu admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin', 'admin@banhang.com', '$2a$10$2bDK6a3j8e5O2PkgQjn0ju9A46PSd2foRQzFSSvPHgswesUdBeEzW', 'admin');

-- Insert dữ liệu mẫu games
INSERT INTO games (name, slug, description, thumbnail_url) VALUES
('Roblox', 'roblox', 'Nền tảng game và sáng tạo phổ biến nhất thế giới', '/images/games/roblox.jpg'),
('Liên Quân Mobile', 'lien-quan', 'Game MOBA số 1 Việt Nam', '/images/games/lienquan.jpg'),
('Free Fire', 'free-fire', 'Game battle royale hấp dẫn', '/images/games/freefire.jpg'),
('Genshin Impact', 'genshin', 'Game nhập vai thế giới mở đình đám', '/images/games/genshin.jpg');

-- Insert dữ liệu mẫu categories
INSERT INTO categories (game_id, name, description) VALUES
(1, 'Robux', 'Tiền tệ chính trong Roblox'),
(1, 'Game Pass', 'Vật phẩm đặc biệt trong game'),
(2, 'Quân Huy', 'Tiền tệ trong Liên Quân'),
(2, 'Skin Tướng', 'Trang phục cho tướng'),
(3, 'Kim Cương', 'Tiền tệ trong Free Fire'),
(3, 'Thẻ Tháng', 'Gói đặc quyền hàng tháng'),
(4, 'Genesis Crystal', 'Tiền tệ cao cấp'),
(4, 'Welkin Moon', 'Gói nạp hàng tháng');

-- Insert dữ liệu mẫu products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured) VALUES
(1, 1, 'Robux 400', 'Gói 400 Robux chính hãng', 75000, 'gói', '/images/products/robux400.jpg', TRUE),
(1, 1, 'Robux 800', 'Gói 800 Robux giá tốt', 150000, 'gói', '/images/products/robux800.jpg', TRUE),
(1, 1, 'Robux 1700', 'Gói 1700 Robux phổ biến', 300000, 'gói', '/images/products/robux1700.jpg', FALSE),
(2, 3, 'Quân Huy 50', 'Nạp 50 Quân Huy', 10000, 'gói', '/images/products/quanhuy50.jpg', FALSE),
(2, 3, 'Quân Huy 200', 'Nạp 200 Quân Huy', 35000, 'gói', '/images/products/quanhuy200.jpg', TRUE),
(2, 4, 'Skin Nakroth Nguyệt Hạ', 'Skin giới hạn hot', 150000, 'skin', '/images/products/skin-nakroth.jpg', TRUE),
(3, 5, 'Kim Cương 100', 'Nạp 100 kim cương', 20000, 'gói', '/images/products/ff-100.jpg', FALSE),
(3, 5, 'Kim Cương 500', 'Nạp 500 kim cương', 90000, 'gói', '/images/products/ff-500.jpg', TRUE),
(4, 7, 'Genesis Crystal 980', 'Gói 980 tinh thạch', 250000, 'gói', '/images/products/genesis980.jpg', FALSE),
(4, 8, 'Welkin Moon', 'Gói đặc quyền hàng tháng', 120000, 'tháng', '/images/products/welkin.jpg', TRUE);

-- Insert dữ liệu mẫu banner
INSERT INTO banners (title, image_url, link_url, position) VALUES
('Ưu đãi Robux khủng', '/images/banners/robux-sale.jpg', '/game/roblox', 'hero'),
('Skin Liên Quân mới', '/images/banners/lq-new.jpg', '/game/lien-quan', 'hero');
