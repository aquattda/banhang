-- =====================================================
-- FULL DATABASE SETUP - BÁN HÀNG GAME
-- Chạy file này một lần duy nhất để setup toàn bộ database
-- =====================================================

-- Tạo database
DROP DATABASE IF EXISTS banhang_game;
CREATE DATABASE banhang_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banhang_game;

-- =====================================================
-- TẠO CÁC BẢNG
-- =====================================================

-- Bảng users (người dùng và admin)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng games
CREATE TABLE games (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng categories (danh mục sản phẩm trong game)
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Bảng products (sản phẩm)
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'VNĐ',
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 999,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Bảng orders (đơn hàng)
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng order_items (chi tiết đơn hàng)
CREATE TABLE order_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Bảng contacts (liên hệ)
CREATE TABLE contacts (
    contact_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- THÊM DỮ LIỆU
-- =====================================================

-- 1. Thêm Admin (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('admin@banhang.com', '$2a$10$2bDK6a3j8e5O2PkgQjn0ju9A46PSd2foRQzFSSvPHgswesUdBeEzW', 'Administrator', 'admin', TRUE);

-- 2. Thêm Games
INSERT INTO games (name, slug, description, is_active) VALUES
-- Roblox Games (game_id 1-11)
('BloxFruits', 'blox-fruits', 'Game phiêu lưu biển cả với trái ác quỷ', TRUE),
('King Legacy', 'king-legacy', 'Game One Piece trên Roblox', TRUE),
('The Strongest Battlegrounds', 'the-strongest-battlegrounds', 'Game chiến đấu sức mạnh', TRUE),
('Code Roblox', 'code-roblox', 'Mã code và Prime Gaming cho Roblox', TRUE),
('Sol\'s RNG', 'sols-rng', 'Game may rủi và gacha', TRUE),
('Heroes Battlegrounds', 'heroes-battlegrounds', 'Game siêu anh hùng chiến đấu', TRUE),
('RIVALS', 'rivals', 'Game bắn súng cạnh tranh', TRUE),
('Jujutsu Shenanigans', 'jujutsu-shenanigans', 'Game Jujutsu Kaisen', TRUE),
('Blue Lock: Rivals', 'blue-lock-rivals', 'Game bóng đá Blue Lock', TRUE),
('Forsaken', 'forsaken', 'Game sinh tồn kinh dị', TRUE),
('Fish It!', 'fish-it', 'Game câu cá thư giãn', TRUE),
-- Liên Quân Mobile (game_id 12)
('Liên Quân Mobile', 'lien-quan-mobile', 'Game MOBA số 1 Việt Nam', TRUE);

-- 3. Thêm Categories
-- BloxFruits (game_id = 1)
-- Tổng 28 categories cho 12 games
INSERT INTO categories (game_id, name, description, is_active) VALUES
-- BloxFruits (game_id = 1) - 2 categories
(1, 'Trái Ác Quỷ', 'Các loại trái ác quỷ trong BloxFruits', TRUE),
(1, 'Gamepass', 'Gamepass cho BloxFruits', TRUE),

-- King Legacy (game_id = 2) - 2 categories
(2, 'Trái Cây', 'Các loại trái cây trong King Legacy', TRUE),
(2, 'Gamepass', 'Gamepass cho King Legacy', TRUE),

-- The Strongest Battlegrounds (game_id = 3) - 1 category
(3, 'Gamepass', 'Gamepass cho The Strongest Battlegrounds', TRUE),

-- Code Roblox (game_id = 4) - 1 category
(4, 'Prime Gaming', 'Prime Gaming codes và rewards', TRUE),

-- Sol's RNG (game_id = 5) - 1 category
(5, 'Gamepass', 'Gamepass cho Sol\'s RNG', TRUE),

-- Heroes Battlegrounds (game_id = 6) - 1 category
(6, 'Gamepass', 'Gamepass cho Heroes Battlegrounds', TRUE),

-- RIVALS (game_id = 7) - 2 categories
(7, 'Gamepass', 'Gamepass cho RIVALS', TRUE),
(7, 'Key Bundle', 'Key Bundle cho RIVALS', TRUE),

-- Jujutsu Shenanigans (game_id = 8) - 1 category
(8, 'Gamepass', 'Gamepass cho Jujutsu Shenanigans', TRUE),

-- Blue Lock: Rivals (game_id = 9) - 3 categories
(9, 'Gamepass', 'Gamepass cho Blue Lock: Rivals', TRUE),
(9, 'Spins', 'Spins cho Blue Lock: Rivals', TRUE),
(9, 'Limiteds', 'Items Limited cho Blue Lock: Rivals', TRUE),

-- Forsaken (game_id = 10) - 1 category
(10, 'Gamepass', 'Gamepass cho Forsaken', TRUE),

-- Fish It! (game_id = 11) - 1 category
(11, 'Gamepass', 'Gamepass cho Fish It!', TRUE),

-- Liên Quân Mobile (game_id = 12) - 4 categories
(12, 'Kim Cương', 'Nạp kim cương Liên Quân', TRUE),
(12, 'Skin', 'Mua skin tướng Liên Quân', TRUE),
(12, 'Tướng', 'Mua tướng Liên Quân', TRUE),
(12, 'Thẻ Quý Tộc', 'Thẻ Quý Tộc các loại', TRUE);

-- 4. Thêm Products đầy đủ (10 sản phẩm cho mỗi danh mục = 280 sản phẩm)
-- =====================================================
-- BLOXFRUITS (game_id = 1)
-- =====================================================

-- Category 1: Trái Ác Quỷ
INSERT INTO products (game_id, category_id, name, description, price, unit, stock_quantity, is_featured, is_active) VALUES
(1, 1, 'Trái Dragon Huyền Thoại', 'Trái rồng mạnh nhất trong game, sát thương khủng khiếp', 15000000, 'VNĐ', 5, TRUE, TRUE),
(1, 1, 'Trái Leopard', 'Trái báo tốc độ và sát thương cao, rất mạnh PvP', 12000000, 'VNĐ', 8, TRUE, TRUE),
(1, 1, 'Trái Dough V2', 'Trái bột đã thức tỉnh, combo mạnh mẽ', 8000000, 'VNĐ', 15, TRUE, TRUE),
(1, 1, 'Trái Shadow', 'Trái bóng tối, tấn công từ xa tốt', 5500000, 'VNĐ', 20, FALSE, TRUE),
(1, 1, 'Trái Venom', 'Trái độc có DOT damage cao', 4800000, 'VNĐ', 25, FALSE, TRUE),
(1, 1, 'Trái Spirit', 'Trái linh hồn, kỹ năng đẹp', 4200000, 'VNĐ', 30, FALSE, TRUE),
(1, 1, 'Trái Control', 'Trái kiểm soát, support tốt', 3800000, 'VNĐ', 35, FALSE, TRUE),
(1, 1, 'Trái Blizzard', 'Trái băng tuyết, slow địch', 3500000, 'VNĐ', 40, FALSE, TRUE),
(1, 1, 'Trái Gravity', 'Trái trọng lực, kéo địch lại', 3200000, 'VNĐ', 45, FALSE, TRUE),
(1, 1, 'Trái Buddha', 'Trái Phật, tăng HP và phòng thủ', 2800000, 'VNĐ', 50, FALSE, TRUE),

-- Category 2: Gamepass BloxFruits
(1, 2, '2x Experience Gamepass', 'Tăng gấp đôi kinh nghiệm nhận được', 500000, 'VNĐ', 999, TRUE, TRUE),
(1, 2, 'Fast Boat Gamepass', 'Tàu di chuyển nhanh hơn 2 lần', 300000, 'VNĐ', 999, TRUE, TRUE),
(1, 2, '2x Money Gamepass', 'Tăng gấp đôi tiền nhận được', 450000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Fruit Storage Gamepass', 'Kho chứa trái ác quỷ mở rộng', 350000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Race Reroll Gamepass', 'Quay lại chủng tộc không giới hạn', 280000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Geppo Gamepass', 'Bay trong không trung', 200000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Buso Haki Gamepass', 'Sử dụng Buso Haki sớm', 180000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Ken Haki Gamepass', 'Sử dụng Ken Haki sớm', 180000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Soru Gamepass', 'Di chuyển siêu nhanh', 150000, 'VNĐ', 999, FALSE, TRUE),
(1, 2, 'Private VIP Server', 'Server riêng cho bạn và bạn bè', 800000, 'VNĐ', 100, TRUE, TRUE),

-- =====================================================
-- KING LEGACY (game_id = 2)
-- =====================================================

-- Category 3: Trái Cây
(2, 3, 'Phoenix Fruit Huyền Thoại', 'Trái chim phượng hoàng, hồi máu cực mạnh', 10000000, 'VNĐ', 6, TRUE, TRUE),
(2, 3, 'Dark Fruit', 'Trái tối, sát thương cao', 7500000, 'VNĐ', 10, TRUE, TRUE),
(2, 3, 'Flame Fruit', 'Trái lửa Ace, đốt cháy mọi thứ', 5000000, 'VNĐ', 15, FALSE, TRUE),
(2, 3, 'Light Fruit', 'Trái ánh sáng, tốc độ ánh sáng', 6800000, 'VNĐ', 12, TRUE, TRUE),
(2, 3, 'Ice Fruit', 'Trái băng, làm đóng băng địch', 4500000, 'VNĐ', 18, FALSE, TRUE),
(2, 3, 'Magma Fruit', 'Trái nham thạch, sát thương liên tục', 5500000, 'VNĐ', 14, FALSE, TRUE),
(2, 3, 'Quake Fruit', 'Trái địa chấn Whitebeard', 8000000, 'VNĐ', 8, TRUE, TRUE),
(2, 3, 'String Fruit', 'Trái dây, kiểm soát tốt', 4200000, 'VNĐ', 20, FALSE, TRUE),
(2, 3, 'Paw Fruit', 'Trái bàn tay gấu, đẩy bay địch', 6000000, 'VNĐ', 11, FALSE, TRUE),
(2, 3, 'Rubber Fruit', 'Trái cao su Luffy, miễn nhiễm sét', 3800000, 'VNĐ', 25, FALSE, TRUE),

-- Category 4: Gamepass King Legacy
(2, 4, '2x Drop Chance', 'Tăng gấp đôi tỷ lệ rơi vật phẩm', 400000, 'VNĐ', 999, TRUE, TRUE),
(2, 4, '2x EXP Boost', 'Nhận gấp đôi kinh nghiệm', 450000, 'VNĐ', 999, TRUE, TRUE),
(2, 4, '2x Gem Collector', 'Nhận gấp đôi gem', 380000, 'VNĐ', 999, FALSE, TRUE),
(2, 4, 'Fast Travel Pass', 'Dịch chuyển nhanh giữa các đảo', 320000, 'VNĐ', 999, FALSE, TRUE),
(2, 4, 'Auto Collect Fruit', 'Tự động nhặt trái rơi', 500000, 'VNĐ', 999, TRUE, TRUE),
(2, 4, 'Inventory Expansion', 'Mở rộng túi đồ 100 slot', 280000, 'VNĐ', 999, FALSE, TRUE),
(2, 4, 'Sword Mastery Boost', 'Tăng tốc độ luyện kiếm', 350000, 'VNĐ', 999, FALSE, TRUE),
(2, 4, 'Devil Fruit Reset', 'Reset trái ác quỷ bất kỳ lúc nào', 420000, 'VNĐ', 999, FALSE, TRUE),
(2, 4, 'VIP Chat Badge', 'Huy hiệu VIP trong chat', 150000, 'VNĐ', 999, FALSE, TRUE),
(2, 4, 'Premium Boat', 'Thuyền cao cấp nhanh nhất', 600000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- THE STRONGEST BATTLEGROUNDS (game_id = 3)
-- =====================================================

-- Category 5: Gamepass TSB
(3, 5, 'Saitama Character Pack', 'Nhân vật Saitama - One Punch Man', 650000, 'VNĐ', 999, TRUE, TRUE),
(3, 5, 'Garou Character Pack', 'Nhân vật Garou - Hero Hunter', 580000, 'VNĐ', 999, TRUE, TRUE),
(3, 5, 'Genos Character Pack', 'Nhân vật Genos - Cyborg', 550000, 'VNĐ', 999, FALSE, TRUE),
(3, 5, 'Sonic Character Pack', 'Nhân vật Sonic - Speed', 520000, 'VNĐ', 999, FALSE, TRUE),
(3, 5, 'Atomic Samurai Pack', 'Nhân vật Atomic Samurai', 600000, 'VNĐ', 999, FALSE, TRUE),
(3, 5, 'Metal Bat Character', 'Nhân vật Metal Bat', 480000, 'VNĐ', 999, FALSE, TRUE),
(3, 5, 'All Character Bundle', 'Tất cả nhân vật trong game', 2500000, 'VNĐ', 100, TRUE, TRUE),
(3, 5, 'Emote Pack Ultimate', 'Gói emote đầy đủ', 350000, 'VNĐ', 999, FALSE, TRUE),
(3, 5, 'VIP Server 30 Days', 'Server riêng 30 ngày', 450000, 'VNĐ', 200, FALSE, TRUE),
(3, 5, 'Training Boost Pass', 'Tăng tốc độ train stats', 380000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- CODE ROBLOX (game_id = 4)
-- =====================================================

-- Category 6: Prime Gaming
(4, 6, 'Amazon Prime Gaming Code Tháng 12', 'Code Prime Gaming mới nhất', 220000, 'VNĐ', 50, TRUE, TRUE),
(4, 6, 'Exclusive Item Pack Code', 'Code vật phẩm độc quyền', 180000, 'VNĐ', 80, TRUE, TRUE),
(4, 6, 'Premium Avatar Code', 'Code avatar cao cấp', 150000, 'VNĐ', 100, FALSE, TRUE),
(4, 6, 'Robux Bonus Code 100R', 'Code bonus 100 Robux', 280000, 'VNĐ', 30, TRUE, TRUE),
(4, 6, 'Gear Bundle Code', 'Code gói gear đặc biệt', 200000, 'VNĐ', 60, FALSE, TRUE),
(4, 6, 'Face Accessory Code', 'Code phụ kiện mặt hiếm', 120000, 'VNĐ', 120, FALSE, TRUE),
(4, 6, 'Wings Code Limited', 'Code cánh giới hạn', 350000, 'VNĐ', 25, TRUE, TRUE),
(4, 6, 'Pet Companion Code', 'Code thú cưng đặc biệt', 160000, 'VNĐ', 90, FALSE, TRUE),
(4, 6, 'Hair Style Code', 'Code kiểu tóc độc quyền', 130000, 'VNĐ', 110, FALSE, TRUE),
(4, 6, 'Emote Dance Code', 'Code điệu nhảy Prime', 140000, 'VNĐ', 100, FALSE, TRUE),

-- =====================================================
-- SOL'S RNG (game_id = 5)
-- =====================================================

-- Category 7: Gamepass Sol's RNG
(5, 7, 'Luck Boost Ultimate', 'Tăng may mắn cực đại khi quay', 420000, 'VNĐ', 999, TRUE, TRUE),
(5, 7, '2x Roll Speed', 'Quay nhanh gấp đôi', 380000, 'VNĐ', 999, TRUE, TRUE),
(5, 7, 'Pity System Access', 'Mở khóa hệ thống pity đảm bảo', 550000, 'VNĐ', 999, TRUE, TRUE),
(5, 7, 'Auto Clicker Pass', 'Auto click không giới hạn', 320000, 'VNĐ', 999, FALSE, TRUE),
(5, 7, 'Legendary Aura +10%', 'Tăng 10% tỷ lệ aura huyền thoại', 480000, 'VNĐ', 999, FALSE, TRUE),
(5, 7, 'Mythical Rate Boost', 'Boost tỷ lệ aura thần thoại', 650000, 'VNĐ', 999, TRUE, TRUE),
(5, 7, 'Instant Notification', 'Thông báo ngay khi có aura hiếm', 250000, 'VNĐ', 999, FALSE, TRUE),
(5, 7, 'Display Aura Pack', 'Hiển thị aura đặc biệt', 350000, 'VNĐ', 999, FALSE, TRUE),
(5, 7, 'Roll History Tracker', 'Theo dõi lịch sử quay chi tiết', 200000, 'VNĐ', 999, FALSE, TRUE),
(5, 7, 'VIP Crafting Access', 'Mở khóa hệ thống chế tạo VIP', 500000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- HEROES BATTLEGROUNDS (game_id = 6)
-- =====================================================

-- Category 8: Gamepass Heroes BG
(6, 8, 'All Might Character', 'Nhân vật All Might #1 Hero', 750000, 'VNĐ', 999, TRUE, TRUE),
(6, 8, 'Deku Full Cowling', 'Nhân vật Deku 100%', 680000, 'VNĐ', 999, TRUE, TRUE),
(6, 8, 'Todoroki Character', 'Nhân vật Todoroki băng lửa', 620000, 'VNĐ', 999, FALSE, TRUE),
(6, 8, 'Bakugo Explosion', 'Nhân vật Bakugo nổ tung', 650000, 'VNĐ', 999, FALSE, TRUE),
(6, 8, 'Shigaraki Villain', 'Nhân vật Shigaraki phản diện', 600000, 'VNĐ', 999, FALSE, TRUE),
(6, 8, 'All For One', 'Nhân vật All For One', 800000, 'VNĐ', 999, TRUE, TRUE),
(6, 8, 'Endeavor Flame Hero', 'Nhân vật Endeavor #2 Hero', 580000, 'VNĐ', 999, FALSE, TRUE),
(6, 8, 'Quirk Slot Expansion', 'Mở rộng slot quirk thêm 3', 450000, 'VNĐ', 999, FALSE, TRUE),
(6, 8, '2x EXP Training', 'Gấp đôi EXP khi train', 400000, 'VNĐ', 999, FALSE, TRUE),
(6, 8, 'Hero Costume Pack', 'Gói trang phục hero đầy đủ', 520000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- RIVALS (game_id = 7)
-- =====================================================

-- Category 9: Gamepass RIVALS
(7, 9, 'VIP Diamond Pass', 'VIP pass cao cấp nhất', 480000, 'VNĐ', 999, TRUE, TRUE),
(7, 9, '2x Credits Earner', 'Nhận gấp đôi credits', 420000, 'VNĐ', 999, TRUE, TRUE),
(7, 9, 'Weapon Skin Bundle', 'Gói skin vũ khí độc quyền', 550000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Premium Emote Pack', 'Gói emote premium đầy đủ', 350000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Exclusive Map Access', 'Truy cập map độc quyền', 380000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Rank XP Booster', 'Tăng tốc lên rank', 400000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Kill Effect Bundle', 'Gói hiệu ứng kill đặc biệt', 320000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Victory Dance Pack', 'Gói điệu nhảy chiến thắng', 280000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Name Tag Customizer', 'Tùy chỉnh tên hiển thị', 250000, 'VNĐ', 999, FALSE, TRUE),
(7, 9, 'Private Match Pass', 'Tạo trận đấu riêng', 500000, 'VNĐ', 999, FALSE, TRUE),

-- Category 10: Key Bundle RIVALS
(7, 10, 'Legendary Key x10', '10 chìa khóa huyền thoại', 850000, 'VNĐ', 150, TRUE, TRUE),
(7, 10, 'Epic Key x20', '20 chìa khóa epic', 700000, 'VNĐ', 200, TRUE, TRUE),
(7, 10, 'Rare Key x50', '50 chìa khóa rare', 500000, 'VNĐ', 300, FALSE, TRUE),
(7, 10, 'Common Key x100', '100 chìa khóa thường', 350000, 'VNĐ', 500, FALSE, TRUE),
(7, 10, 'Weapon Crate Key x5', '5 chìa rương vũ khí', 450000, 'VNĐ', 250, FALSE, TRUE),
(7, 10, 'Skin Crate Key x5', '5 chìa rương skin', 480000, 'VNĐ', 220, FALSE, TRUE),
(7, 10, 'Ultimate Bundle Key', 'Bundle chìa khóa tối thượng', 1200000, 'VNĐ', 80, TRUE, TRUE),
(7, 10, 'Season Pass Key', 'Chìa khóa mở Season Pass', 600000, 'VNĐ', 180, FALSE, TRUE),
(7, 10, 'Mystery Box Key x3', '3 chìa hộp bí ẩn', 380000, 'VNĐ', 300, FALSE, TRUE),
(7, 10, 'Golden Key Special', 'Chìa khóa vàng đặc biệt', 950000, 'VNĐ', 100, TRUE, TRUE),

-- =====================================================
-- JUJUTSU SHENANIGANS (game_id = 8)
-- =====================================================

-- Category 11: Gamepass Jujutsu
(8, 11, 'Gojo Satoru Character', 'Nhân vật Gojo - Vô hạn', 950000, 'VNĐ', 999, TRUE, TRUE),
(8, 11, 'Sukuna King of Curses', 'Nhân vật Sukuna - Vua nguyền rủa', 920000, 'VNĐ', 999, TRUE, TRUE),
(8, 11, 'Megumi Fushiguro', 'Nhân vật Megumi - 10 bóng', 680000, 'VNĐ', 999, FALSE, TRUE),
(8, 11, 'Yuji Itadori', 'Nhân vật Yuji - Sức mạnh thể chất', 650000, 'VNĐ', 999, FALSE, TRUE),
(8, 11, 'Nobara Kugisaki', 'Nhân vật Nobara - Búa và đinh', 620000, 'VNĐ', 999, FALSE, TRUE),
(8, 11, 'Toji Fushiguro', 'Nhân vật Toji - Sát thủ thể thuật', 850000, 'VNĐ', 999, TRUE, TRUE),
(8, 11, 'Mahito Character', 'Nhân vật Mahito - Biến đổi linh hồn', 780000, 'VNĐ', 999, FALSE, TRUE),
(8, 11, 'Domain Expansion Pack', 'Mở khóa Domain của tất cả nhân vật', 1200000, 'VNĐ', 999, TRUE, TRUE),
(8, 11, '2x Cursed Energy', 'Gấp đôi năng lượng nguyền', 450000, 'VNĐ', 999, FALSE, TRUE),
(8, 11, 'Technique Slot +2', 'Thêm 2 slot kỹ năng', 550000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- BLUE LOCK: RIVALS (game_id = 9)
-- =====================================================

-- Category 12: Gamepass Blue Lock
(9, 12, 'Pro League Pass', 'Pass chuyên nghiệp đầy đủ tính năng', 550000, 'VNĐ', 999, TRUE, TRUE),
(9, 12, '2x Goal Rewards', 'Gấp đôi phần thưởng ghi bàn', 420000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Skill Training Boost', 'Tăng tốc độ train kỹ năng', 380000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Stadium VIP Access', 'Truy cập sân VIP đặc biệt', 450000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Team Formation+', 'Mở khóa đội hình nâng cao', 350000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Ego Boost System', 'Hệ thống tăng EGO nhanh', 480000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Celebration Pack', 'Gói động tác ăn mừng đặc biệt', 320000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Match History Pro', 'Xem lịch sử trận đấu chi tiết', 250000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Custom Jersey Design', 'Thiết kế áo đấu tùy chỉnh', 400000, 'VNĐ', 999, FALSE, TRUE),
(9, 12, 'Premium Chat Badge', 'Huy hiệu chat cao cấp', 200000, 'VNĐ', 999, FALSE, TRUE),

-- Category 13: Spins Blue Lock
(9, 13, '10000 Spins Mega', '10000 lượt quay gacha', 2500000, 'VNĐ', 100, TRUE, TRUE),
(9, 13, '5000 Spins', '5000 lượt quay', 1300000, 'VNĐ', 200, TRUE, TRUE),
(9, 13, '2000 Spins', '2000 lượt quay', 550000, 'VNĐ', 300, TRUE, TRUE),
(9, 13, '1000 Spins', '1000 lượt quay', 300000, 'VNĐ', 500, FALSE, TRUE),
(9, 13, '500 Spins', '500 lượt quay', 160000, 'VNĐ', 999, FALSE, TRUE),
(9, 13, '250 Spins', '250 lượt quay', 85000, 'VNĐ', 999, FALSE, TRUE),
(9, 13, '100 Spins', '100 lượt quay', 35000, 'VNĐ', 999, FALSE, TRUE),
(9, 13, '50 Spins Daily', '50 lượt quay mỗi ngày 30 ngày', 450000, 'VNĐ', 250, FALSE, TRUE),
(9, 13, 'Lucky Spin x100', '100 lượt quay may mắn tăng tỷ lệ', 400000, 'VNĐ', 200, FALSE, TRUE),
(9, 13, 'Guaranteed Rare Spin x10', '10 lượt quay đảm bảo rare+', 650000, 'VNĐ', 150, TRUE, TRUE),

-- Category 14: Limiteds Blue Lock
(9, 14, 'Isagi Limited Jersey', 'Áo đấu Isagi phiên bản giới hạn', 1200000, 'VNĐ', 30, TRUE, TRUE),
(9, 14, 'Bachira Limited Jersey', 'Áo đấu Bachira giới hạn', 1150000, 'VNĐ', 35, TRUE, TRUE),
(9, 14, 'Nagi Limited Jersey', 'Áo đấu Nagi cực hiếm', 1300000, 'VNĐ', 25, TRUE, TRUE),
(9, 14, 'Rin Limited Jersey', 'Áo đấu Rin giới hạn', 1250000, 'VNĐ', 28, FALSE, TRUE),
(9, 14, 'Golden Boot Trophy', 'Cúp giày vàng limited', 1500000, 'VNĐ', 20, TRUE, TRUE),
(9, 14, 'Blue Lock Crown', 'Vương miện Blue Lock', 1800000, 'VNĐ', 15, TRUE, TRUE),
(9, 14, 'Championship Ring', 'Nhẫn vô địch giới hạn', 1600000, 'VNĐ', 18, FALSE, TRUE),
(9, 14, 'Limited Face Paint', 'Sơn mặt phiên bản giới hạn', 800000, 'VNĐ', 50, FALSE, TRUE),
(9, 14, 'Exclusive Arm Band', 'Băng đội trưởng đặc biệt', 900000, 'VNĐ', 45, FALSE, TRUE),
(9, 14, 'Legend Status Badge', 'Huy hiệu huyền thoại', 2000000, 'VNĐ', 10, TRUE, TRUE),

-- =====================================================
-- FORSAKEN (game_id = 10)
-- =====================================================

-- Category 15: Gamepass Forsaken
(10, 15, 'Ultimate Survival Kit', 'Bộ sinh tồn hoàn hảo', 480000, 'VNĐ', 999, TRUE, TRUE),
(10, 15, 'Weapon Mastery Pass', 'Pass thành thạo vũ khí', 420000, 'VNĐ', 999, FALSE, TRUE),
(10, 15, '2x Loot Drop', 'Gấp đôi vật phẩm rơi', 450000, 'VNĐ', 999, TRUE, TRUE),
(10, 15, 'Safe Zone Builder', 'Xây dựng khu an toàn nhanh', 380000, 'VNĐ', 999, FALSE, TRUE),
(10, 15, 'Night Vision Gear', 'Trang bị nhìn ban đêm', 350000, 'VNĐ', 999, FALSE, TRUE),
(10, 15, 'Resource Scanner', 'Máy quét tài nguyên', 400000, 'VNĐ', 999, FALSE, TRUE),
(10, 15, 'Medic Training Pro', 'Đào tạo y tế chuyên nghiệp', 320000, 'VNĐ', 999, FALSE, TRUE),
(10, 15, 'Stealth Mode Access', 'Chế độ tàng hình', 550000, 'VNĐ', 999, TRUE, TRUE),
(10, 15, 'Inventory Expansion Pro', 'Mở rộng kho đồ tối đa', 380000, 'VNĐ', 999, FALSE, TRUE),
(10, 15, 'Vehicle Upgrade Kit', 'Bộ nâng cấp phương tiện', 500000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- FISH IT! (game_id = 11)
-- =====================================================

-- Category 16: Gamepass Fish It
(11, 16, 'Legendary Rod Ultimate', 'Cần câu huyền thoại mạnh nhất', 420000, 'VNĐ', 999, TRUE, TRUE),
(11, 16, '2x Fish Value', 'Gấp đôi giá trị cá bán được', 380000, 'VNĐ', 999, TRUE, TRUE),
(11, 16, 'Auto Fishing Bot', 'Bot câu cá tự động', 450000, 'VNĐ', 999, TRUE, TRUE),
(11, 16, 'Bait Unlimited Pack', 'Mồi câu không giới hạn', 320000, 'VNĐ', 999, FALSE, TRUE),
(11, 16, 'Rare Fish Magnet', 'Nam châm thu hút cá hiếm', 480000, 'VNĐ', 999, FALSE, TRUE),
(11, 16, 'Boat Speed Upgrade', 'Tăng tốc độ thuyền 3x', 350000, 'VNĐ', 999, FALSE, TRUE),
(11, 16, 'Aquarium Premium', 'Bể cá cao cấp chứa nhiều', 400000, 'VNĐ', 999, FALSE, TRUE),
(11, 16, 'Weather Controller', 'Điều khiển thời tiết câu cá', 500000, 'VNĐ', 999, FALSE, TRUE),
(11, 16, 'Fish Tracker GPS', 'GPS theo dõi đàn cá', 360000, 'VNĐ', 999, FALSE, TRUE),
(11, 16, 'Tournament Pass VIP', 'Pass VIP giải đấu câu cá', 550000, 'VNĐ', 999, FALSE, TRUE),

-- =====================================================
-- LIÊN QUÂN MOBILE (game_id = 12)
-- =====================================================

-- Category 17: Kim Cương
(12, 17, '20000 Kim Cương', 'Gói 20000 kim cương siêu khủng', 3200000, 'VNĐ', 100, TRUE, TRUE),
(12, 17, '10000 Kim Cương', 'Gói 10000 kim cương', 1650000, 'VNĐ', 200, TRUE, TRUE),
(12, 17, '5000 Kim Cương', 'Gói 5000 kim cương', 850000, 'VNĐ', 300, TRUE, TRUE),
(12, 17, '2000 Kim Cương', 'Gói 2000 kim cương', 350000, 'VNĐ', 500, FALSE, TRUE),
(12, 17, '1000 Kim Cương', 'Gói 1000 kim cương', 180000, 'VNĐ', 999, FALSE, TRUE),
(12, 17, '500 Kim Cương', 'Gói 500 kim cương', 95000, 'VNĐ', 999, FALSE, TRUE),
(12, 17, '200 Kim Cương', 'Gói 200 kim cương', 40000, 'VNĐ', 999, FALSE, TRUE),
(12, 17, '100 Kim Cương', 'Gói 100 kim cương', 20000, 'VNĐ', 999, FALSE, TRUE),
(12, 17, '50 Kim Cương', 'Gói 50 kim cương', 11000, 'VNĐ', 999, FALSE, TRUE),
(12, 17, '20 Kim Cương', 'Gói 20 kim cương nhỏ', 5000, 'VNĐ', 999, FALSE, TRUE),

-- Category 18: Skin
(12, 18, 'Skin Nakroth Rồng Đen', 'Skin huyền thoại Nakroth', 550000, 'VNĐ', 15, TRUE, TRUE),
(12, 18, 'Skin Murad Huyền Ảnh', 'Skin giới hạn Murad', 520000, 'VNĐ', 20, TRUE, TRUE),
(12, 18, 'Skin Quillen Sát Thủ Bóng Đêm', 'Skin SS Quillen', 480000, 'VNĐ', 25, TRUE, TRUE),
(12, 18, 'Skin Lauriel Thiên Thần', 'Skin limited Lauriel', 500000, 'VNĐ', 18, FALSE, TRUE),
(12, 18, 'Skin Butterfly Hoa Nguyệt', 'Skin đẹp nhất Butterfly', 450000, 'VNĐ', 30, FALSE, TRUE),
(12, 18, 'Skin Raz Siêu Sao', 'Skin SS+ Raz', 420000, 'VNĐ', 35, FALSE, TRUE),
(12, 18, 'Skin Tulen Phượng Hoàng', 'Skin huyền thoại Tulen', 480000, 'VNĐ', 22, FALSE, TRUE),
(12, 18, 'Skin Violet Nữ Thần Chiến Tranh', 'Skin limited Violet', 500000, 'VNĐ', 28, TRUE, TRUE),
(12, 18, 'Skin Ryoma Samurai Huyền Thoại', 'Skin SS Ryoma', 450000, 'VNĐ', 32, FALSE, TRUE),
(12, 18, 'Skin Zuka Quyền Vương', 'Skin đẹp Zuka', 380000, 'VNĐ', 40, FALSE, TRUE),

-- Category 19: Tướng
(12, 19, 'Tướng Nakroth', 'Sát thủ cực mạnh', 200000, 'VNĐ', 999, TRUE, TRUE),
(12, 19, 'Tướng Murad', 'Sát thủ linh hoạt', 180000, 'VNĐ', 999, TRUE, TRUE),
(12, 19, 'Tướng Quillen', 'Sát thủ bùng nổ', 180000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Lauriel', 'Pháp sư mạnh mẽ', 180000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Butterfly', 'Sát thủ nhanh nhẹn', 160000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Raz', 'Pháp sư bùng nổ', 160000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Tulen', 'Pháp sư linh hoạt', 180000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Violet', 'Xạ thủ xa đẹp', 180000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Ryoma', 'Đấu sĩ mạnh', 160000, 'VNĐ', 999, FALSE, TRUE),
(12, 19, 'Tướng Zuka', 'Đấu sĩ linh hoạt', 140000, 'VNĐ', 999, FALSE, TRUE),

-- Category 20: Thẻ Quý Tộc
(12, 20, 'Thẻ Quý Tộc 365 Ngày', 'Thẻ quý tộc 1 năm', 2000000, 'VNĐ', 100, TRUE, TRUE),
(12, 20, 'Thẻ Quý Tộc 180 Ngày', 'Thẻ quý tộc 6 tháng', 1050000, 'VNĐ', 150, TRUE, TRUE),
(12, 20, 'Thẻ Quý Tộc 90 Ngày', 'Thẻ quý tộc 3 tháng', 550000, 'VNĐ', 200, TRUE, TRUE),
(12, 20, 'Thẻ Quý Tộc 30 Ngày', 'Thẻ quý tộc 1 tháng', 200000, 'VNĐ', 999, FALSE, TRUE),
(12, 20, 'Thẻ Quý Tộc 15 Ngày', 'Thẻ quý tộc 15 ngày', 110000, 'VNĐ', 999, FALSE, TRUE),
(12, 20, 'Thẻ Quý Tộc 7 Ngày', 'Thẻ quý tộc 7 ngày', 60000, 'VNĐ', 999, FALSE, TRUE),
(12, 20, 'Thẻ Quý Tộc 3 Ngày', 'Thẻ quý tộc 3 ngày dùng thử', 30000, 'VNĐ', 999, FALSE, TRUE),
(12, 20, 'Thẻ Quý Tộc Plus 30 Ngày', 'Thẻ quý tộc nâng cao 1 tháng', 350000, 'VNĐ', 500, FALSE, TRUE),
(12, 20, 'Gia Hạn Quý Tộc Tự Động', 'Tự động gia hạn hàng tháng', 220000, 'VNĐ', 999, FALSE, TRUE),
(12, 20, 'Quý Tộc Bundle Mega', 'Bundle 1 năm + 10000 KC', 3500000, 'VNĐ', 50, TRUE, TRUE);

-- 5. Thêm đơn hàng mẫu
INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, total_amount, status, payment_status, notes) VALUES
('ORD20250101001', 'Nguyễn Văn A', 'nguyenvana@email.com', '0901234567', 15500000, 'completed', 'paid', 'Giao hàng nhanh'),
('ORD20250101002', 'Trần Thị B', 'tranthib@email.com', '0912345678', 8300000, 'processing', 'paid', NULL),
('ORD20250101003', 'Lê Văn C', 'levanc@email.com', '0923456789', 1700000, 'pending', 'unpaid', NULL);

-- Chi tiết đơn hàng
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal) VALUES
-- Đơn 1
(1, 1, 'Trái Ác Quỷ Dragon', 1, 15000000, 15000000),
(1, 4, '2x EXP Gamepass', 1, 500000, 500000),
-- Đơn 2
(2, 3, 'Trái Ác Quỷ Dough', 1, 8000000, 8000000),
(2, 11, 'Amazon Prime Gaming Code', 1, 200000, 200000),
(2, 18, '1000 Spins', 1, 300000, 300000),
-- Đơn 3
(3, 23, '500 Kim Cương', 1, 90000, 90000),
(3, 24, '1000 Kim Cương', 1, 170000, 170000),
(3, 27, 'Thẻ Quý Tộc 30 Ngày', 1, 200000, 200000);

-- 6. Thêm contacts mẫu
INSERT INTO contacts (name, email, phone, subject, message, status) VALUES
('Phạm Văn D', 'phamvand@email.com', '0934567890', 'Hỏi về sản phẩm', 'Tôi muốn hỏi về trái Dragon có còn hàng không?', 'new'),
('Hoàng Thị E', 'hoangthie@email.com', '0945678901', 'Khiếu nại', 'Đơn hàng của tôi chưa được giao', 'replied');

-- =====================================================
-- TẠO INDEX ĐỂ TỐI ƯU HÓA TRUY VẤN
-- =====================================================

CREATE INDEX idx_products_game ON products(game_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_categories_game ON categories(game_id);

-- =====================================================
-- KIỂM TRA DỮ LIỆU
-- =====================================================

-- Kiểm tra số lượng bản ghi
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Games', COUNT(*) FROM games
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Contacts', COUNT(*) FROM contacts;

-- Kiểm tra games và số danh mục
SELECT 
    g.name AS 'Game',
    COUNT(DISTINCT c.category_id) AS 'Số danh mục',
    COUNT(DISTINCT p.product_id) AS 'Số sản phẩm'
FROM games g
LEFT JOIN categories c ON g.game_id = c.game_id
LEFT JOIN products p ON g.game_id = p.game_id
GROUP BY g.game_id, g.name
ORDER BY g.game_id;

-- Hiển thị cấu trúc categories theo game
SELECT 
    g.name AS 'Game',
    c.name AS 'Danh mục',
    c.description AS 'Mô tả',
    CASE WHEN c.is_active = 1 THEN 'Hoạt động' ELSE 'Ngừng' END AS 'Trạng thái'
FROM categories c
JOIN games g ON c.game_id = g.game_id
ORDER BY g.game_id, c.category_id;

-- =====================================================
-- HOÀN TẤT
-- =====================================================

SELECT '✅ DATABASE SETUP HOÀN TẤT!' as Status;
SELECT 'Admin: admin@banhang.com / admin123' as Login_Info;
SELECT CONCAT(
    'Total: ',
    (SELECT COUNT(*) FROM games), ' games, ',
    (SELECT COUNT(*) FROM categories), ' categories, ',
    (SELECT COUNT(*) FROM products), ' products'
) as Summary;
