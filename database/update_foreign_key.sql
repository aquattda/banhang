-- Script để cập nhật foreign key constraint trong order_items
-- Chạy script này trong MySQL để cho phép xóa sản phẩm đã ngừng bán

USE banhang_game;

-- Xóa constraint cũ
ALTER TABLE order_items 
DROP FOREIGN KEY order_items_ibfk_2;

-- Thêm constraint mới với ON DELETE SET NULL
-- Và cho phép product_id NULL
ALTER TABLE order_items 
MODIFY COLUMN product_id INT NULL;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_ibfk_2 
FOREIGN KEY (product_id) 
REFERENCES products(product_id) 
ON DELETE SET NULL;

-- Giải thích:
-- - Khi xóa sản phẩm, product_id trong order_items sẽ được set thành NULL
-- - product_name vẫn được giữ nguyên để lưu lịch sử
-- - Admin có thể xóa sản phẩm đã ngừng bán mà không lo mất dữ liệu đơn hàng
