-- Script cập nhật games và categories mới
-- Chạy script này sau khi đã có database banhang_game

USE banhang_game;

-- Xóa dữ liệu cũ (nếu muốn làm mới)
-- DELETE FROM products;
-- DELETE FROM categories;
-- DELETE FROM games;

-- Insert 11 games Roblox mới
INSERT INTO games (name, slug, description, thumbnail_url, is_active) VALUES
('BloxFruits', 'bloxfruits', 'Game phiêu lưu hải tặc với hệ thống trái ác quỷ độc đáo', '🍇', TRUE),
('King Legacy', 'king-legacy', 'Game One Piece với nhiều trái cây mạnh mẽ', '👑', TRUE),
('The Strongest Battlegrounds', 'strongest-battlegrounds', 'Game chiến đấu PvP cực kỳ hấp dẫn', '💪', TRUE),
('Code Roblox', 'code-roblox', 'Nạp code và nhận Prime Gaming benefits', '🎮', TRUE),
('Sol''s RNG', 'sols-rng', 'Game may rủi với hệ thống aura độc đáo', '🎰', TRUE),
('Heroes Battlegrounds', 'heroes-battlegrounds', 'Game siêu anh hùng chiến đấu', '🦸', TRUE),
('RIVALS', 'rivals', 'Game FPS cạnh tranh đỉnh cao', '🔫', TRUE),
('Jujutsu Shenanigans', 'jujutsu-shenanigans', 'Game dựa trên anime Jujutsu Kaisen', '⚡', TRUE),
('Blue Lock: Rivals', 'blue-lock-rivals', 'Game bóng đá Blue Lock chính thức', '⚽', TRUE),
('[🗡] Forsaken', 'forsaken', 'Game nhập vai phiêu lưu thế giới mở', '🗡️', TRUE),
('Fish It! 🐟', 'fish-it', 'Game câu cá thư giãn và vui vẻ', '🐟', TRUE);

-- Lấy ID của các games vừa tạo và tạo categories
-- BloxFruits categories
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Trái Ác Quỷ', 'Các loại trái ác quỷ mạnh mẽ trong BloxFruits' 
FROM games WHERE slug = 'bloxfruits';

INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass đặc biệt cho BloxFruits' 
FROM games WHERE slug = 'bloxfruits';

-- King Legacy categories
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Trái Cây', 'Trái cây Devil Fruit trong King Legacy' 
FROM games WHERE slug = 'king-legacy';

INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass cho King Legacy' 
FROM games WHERE slug = 'king-legacy';

-- The Strongest Battlegrounds
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass tăng sức mạnh trong TSB' 
FROM games WHERE slug = 'strongest-battlegrounds';

-- Code Roblox
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Prime Gaming', 'Gói Prime Gaming và codes đặc biệt' 
FROM games WHERE slug = 'code-roblox';

-- Sol's RNG
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass tăng may mắn trong Sol''s RNG' 
FROM games WHERE slug = 'sols-rng';

-- Heroes Battlegrounds
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass mở khóa nhân vật Heroes' 
FROM games WHERE slug = 'heroes-battlegrounds';

-- RIVALS
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass nâng cấp trong RIVALS' 
FROM games WHERE slug = 'rivals';

INSERT INTO categories (game_id, name, description) 
SELECT id, 'Key Bundle', 'Gói key và bundle đặc biệt' 
FROM games WHERE slug = 'rivals';

-- Jujutsu Shenanigans
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass sức mạnh Jujutsu' 
FROM games WHERE slug = 'jujutsu-shenanigans';

-- Blue Lock: Rivals
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass kỹ năng đặc biệt' 
FROM games WHERE slug = 'blue-lock-rivals';

INSERT INTO categories (game_id, name, description) 
SELECT id, 'Spins', 'Lượt quay may mắn' 
FROM games WHERE slug = 'blue-lock-rivals';

INSERT INTO categories (game_id, name, description) 
SELECT id, 'Limiteds', 'Vật phẩm giới hạn đặc biệt' 
FROM games WHERE slug = 'blue-lock-rivals';

-- Forsaken
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass tăng sức mạnh trong Forsaken' 
FROM games WHERE slug = 'forsaken';

-- Fish It!
INSERT INTO categories (game_id, name, description) 
SELECT id, 'Gamepass', 'Gamepass câu cá nhanh hơn' 
FROM games WHERE slug = 'fish-it';

-- Insert sản phẩm mẫu cho một số games (có thể bổ sung thêm)

-- BloxFruits products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Leopard Fruit', 
    'Trái ác quỷ Leopard - hiếm và mạnh nhất', 
    450000, 
    'trái', 
    '🐆', 
    TRUE, 
    50
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'bloxfruits' AND c.name = 'Trái Ác Quỷ';

INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Dragon Fruit', 
    'Trái ác quỷ Dragon - sức mạnh rồng', 
    380000, 
    'trái', 
    '🐉', 
    TRUE, 
    50
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'bloxfruits' AND c.name = 'Trái Ác Quỷ';

INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    '2x Mastery Gamepass', 
    'Tăng gấp đôi kinh nghiệm mastery', 
    120000, 
    'gói', 
    '⚡', 
    TRUE, 
    999
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'bloxfruits' AND c.name = 'Gamepass';

-- King Legacy products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Dragon Fruit KL', 
    'Trái cây Dragon mạnh mẽ', 
    350000, 
    'trái', 
    '🔥', 
    TRUE, 
    40
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'king-legacy' AND c.name = 'Trái Cây';

INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Fast Boat Gamepass', 
    'Thuyền di chuyển nhanh gấp 2 lần', 
    99000, 
    'gói', 
    '⛵', 
    FALSE, 
    999
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'king-legacy' AND c.name = 'Gamepass';

-- TSB products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Hero Hunter Gamepass', 
    'Mở khóa nhân vật Garou', 
    199000, 
    'gói', 
    '🥊', 
    TRUE, 
    999
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'strongest-battlegrounds' AND c.name = 'Gamepass';

-- RIVALS products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'VIP Gamepass', 
    'Quyền lợi VIP đặc biệt', 
    149000, 
    'gói', 
    '👑', 
    TRUE, 
    999
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'rivals' AND c.name = 'Gamepass';

INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Weapon Bundle Pro', 
    'Bộ vũ khí chuyên nghiệp', 
    249000, 
    'bundle', 
    '🎯', 
    TRUE, 
    100
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'rivals' AND c.name = 'Key Bundle';

-- Blue Lock products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Premium Spin x10', 
    'Gói 10 lượt quay cao cấp', 
    89000, 
    'gói', 
    '🎲', 
    TRUE, 
    999
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'blue-lock-rivals' AND c.name = 'Spins';

INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Legendary Skin Limited', 
    'Skin giới hạn cực hiếm', 
    499000, 
    'skin', 
    '✨', 
    TRUE, 
    20
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'blue-lock-rivals' AND c.name = 'Limiteds';

-- Fish It products
INSERT INTO products (game_id, category_id, name, description, price, unit, image_url, is_featured, stock) 
SELECT 
    g.id, 
    c.id, 
    'Auto Fish Gamepass', 
    'Tự động câu cá khi AFK', 
    79000, 
    'gói', 
    '🎣', 
    FALSE, 
    999
FROM games g 
JOIN categories c ON g.id = c.game_id 
WHERE g.slug = 'fish-it' AND c.name = 'Gamepass';

-- Kiểm tra kết quả
SELECT 'Games' as Type, COUNT(*) as Count FROM games WHERE is_active = TRUE
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products WHERE is_active = TRUE;

-- Xem danh sách games và categories
SELECT 
    g.name as Game, 
    g.slug,
    COUNT(c.id) as Total_Categories,
    (SELECT COUNT(*) FROM products p WHERE p.game_id = g.id) as Total_Products
FROM games g
LEFT JOIN categories c ON g.id = c.game_id
WHERE g.is_active = TRUE
GROUP BY g.id, g.name, g.slug
ORDER BY g.id;
