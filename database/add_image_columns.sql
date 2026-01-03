-- Thêm cột image_url cho bảng categories và games

-- Thêm image_url cho categories
ALTER TABLE categories 
ADD COLUMN image_url VARCHAR(500) NULL AFTER description;

-- Thêm image_url cho games (nếu chưa có)
-- Kiểm tra xem cột đã tồn tại chưa
ALTER TABLE games 
MODIFY COLUMN thumbnail_url VARCHAR(500) NULL,
ADD COLUMN image_url VARCHAR(500) NULL AFTER thumbnail_url;
