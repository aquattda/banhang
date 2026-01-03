-- Thêm cột display_order vào bảng games để quản lý thứ tự hiển thị
USE banhang_game;

-- Thêm cột display_order
ALTER TABLE games ADD COLUMN display_order INT DEFAULT 0 AFTER is_active;

-- Thêm index cho display_order
ALTER TABLE games ADD INDEX idx_display_order (display_order);

-- Cập nhật display_order cho các game hiện có (theo thứ tự ID)
UPDATE games SET display_order = game_id * 10 WHERE display_order = 0;

-- Hiển thị kết quả
SELECT game_id, name, display_order, is_active FROM games ORDER BY display_order ASC;
