-- Script sửa lỗi đăng nhập admin
-- Chạy script này trong phpMyAdmin hoặc MySQL command line

USE banhang_game;

-- Cập nhật password hash đúng cho admin (password: admin123)
UPDATE users 
SET password_hash = '$2a$10$2bDK6a3j8e5O2PkgQjn0ju9A46PSd2foRQzFSSvPHgswesUdBeEzW' 
WHERE email = 'admin@banhang.com';

-- Kiểm tra kết quả
SELECT id, name, email, role, password_hash 
FROM users 
WHERE email = 'admin@banhang.com';
