-- Thêm cột cost_price (giá nhập) vào bảng products
USE banhang_game;

ALTER TABLE products 
ADD COLUMN cost_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Giá nhập hàng' AFTER price;

-- Cập nhật một số giá nhập mẫu (có thể tùy chỉnh sau)
UPDATE products SET cost_price = price * 0.7 WHERE cost_price = 0;

-- Hiển thị cấu trúc bảng sau khi thêm
DESCRIBE products;
