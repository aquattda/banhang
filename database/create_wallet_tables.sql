-- Tạo bảng ví điện tử cho khách hàng
CREATE TABLE IF NOT EXISTS customer_wallets (
    wallet_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo bảng lịch sử nạp tiền
CREATE TABLE IF NOT EXISTS recharge_history (
    recharge_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    request_id VARCHAR(100) UNIQUE,
    
    -- Loại nạp tiền: 'card' hoặc 'bank'
    recharge_type ENUM('card', 'bank') NOT NULL,
    
    -- Thông tin thẻ cào
    card_type VARCHAR(50) NULL COMMENT 'Viettel, Vinaphone, Mobifone, etc.',
    card_serial VARCHAR(100) NULL,
    card_code VARCHAR(100) NULL,
    card_amount DECIMAL(15,2) NULL COMMENT 'Mệnh giá thẻ',
    
    -- Thông tin chuyển khoản ngân hàng
    bank_name VARCHAR(100) NULL,
    bank_account VARCHAR(100) NULL,
    bank_transaction_code VARCHAR(100) NULL,
    bank_transfer_proof VARCHAR(255) NULL COMMENT 'Link ảnh chứng từ',
    
    -- Số tiền và phí
    declared_amount DECIMAL(15,2) NOT NULL COMMENT 'Số tiền khách khai báo',
    actual_amount DECIMAL(15,2) NULL COMMENT 'Số tiền thực tế nhận được',
    fee_amount DECIMAL(15,2) NULL COMMENT 'Phí giao dịch',
    fee_percent DECIMAL(5,2) NULL COMMENT 'Phần trăm phí',
    
    -- Trạng thái: pending, success, failed, wrong_amount
    status ENUM('pending', 'success', 'failed', 'wrong_amount', 'invalid_card', 'maintenance') DEFAULT 'pending',
    
    -- Phản hồi từ TheSieuRe
    response_code VARCHAR(10) NULL,
    response_message TEXT NULL,
    response_data JSON NULL COMMENT 'Full response từ API',
    
    -- Thời gian
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_recharge_type (recharge_type),
    INDEX idx_created_at (created_at),
    INDEX idx_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo bảng cấu hình phí theo loại thẻ
CREATE TABLE IF NOT EXISTS card_fee_config (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    card_type VARCHAR(50) NOT NULL UNIQUE,
    fee_percent DECIMAL(5,2) NOT NULL COMMENT 'Phần trăm phí (11 = 11%)',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_card_type (card_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu cho phí thẻ cào (theo TheSieuRe)
INSERT INTO card_fee_config (card_type, fee_percent, is_active) VALUES
('VIETTEL', 11.00, 1),
('VINAPHONE', 14.00, 1),
('MOBIFONE', 15.00, 1),
('VIETNAMOBILE', 16.00, 1),
('ZING', 14.00, 1),
('GATE', 16.00, 1)
ON DUPLICATE KEY UPDATE fee_percent = VALUES(fee_percent);
