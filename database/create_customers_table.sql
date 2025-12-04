-- Tạo bảng customers cho tài khoản khách hàng
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    avatar VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm cột customer_id vào bảng orders
ALTER TABLE orders 
ADD COLUMN customer_id INT DEFAULT NULL AFTER order_id,
ADD CONSTRAINT fk_orders_customer 
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) 
    ON DELETE SET NULL;

-- Tạo index cho customer_id
CREATE INDEX idx_customer_orders ON orders(customer_id);
