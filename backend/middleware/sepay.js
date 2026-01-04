const crypto = require('crypto');

// Cấu hình SePay (sẽ lấy từ .env)
const SEPAY_CONFIG = {
    env: process.env.SEPAY_ENV || 'sandbox',
    merchant_id: process.env.SEPAY_MERCHANT_ID || 'YOUR_MERCHANT_ID',
    secret_key: process.env.SEPAY_SECRET_KEY || 'YOUR_SECRET_KEY',
    // Thông tin tài khoản ngân hàng để tạo QR
    bank_code: process.env.SEPAY_BANK_CODE || 'VCB', // Mã ngân hàng
    account_number: process.env.SEPAY_ACCOUNT_NUMBER || '', // Số tài khoản
    account_name: process.env.SEPAY_ACCOUNT_NAME || '', // Tên chủ tài khoản
};

/**
 * Tạo QR Code VietQR
 * Spec: https://www.vietqr.io/danh-sach-api
 */
function generateVietQR(orderData) {
    const {
        order_id,
        amount,
        description
    } = orderData;

    // Log để debug
    console.log('🔍 Generating VietQR:', {
        bank_code: SEPAY_CONFIG.bank_code,
        account_number: SEPAY_CONFIG.account_number,
        account_name: SEPAY_CONFIG.account_name,
        order_id,
        amount
    });

    // Tạo nội dung chuyển khoản (addInfo)
    // Format: NAPTHE [ORDER_ID]
    const transferContent = `NAPTHE ${order_id}`;

    // Tạo URL VietQR
    // API: https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.jpg?amount={AMOUNT}&addInfo={CONTENT}
    const qrUrl = `https://img.vietqr.io/image/${SEPAY_CONFIG.bank_code}-${SEPAY_CONFIG.account_number}-compact.jpg?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(SEPAY_CONFIG.account_name)}`;

    return {
        qr_url: qrUrl,
        qr_data_url: qrUrl, // Có thể dùng trực tiếp làm src của img tag
        bank_code: SEPAY_CONFIG.bank_code,
        account_number: SEPAY_CONFIG.account_number,
        account_name: SEPAY_CONFIG.account_name,
        amount: amount,
        transfer_content: transferContent,
        order_id: order_id
    };
}

/**
 * Tạo chữ ký bảo mật cho request
 */
function generateSignature(data) {
    // Sắp xếp các key theo alphabet
    const sortedKeys = Object.keys(data).sort();
    
    // Tạo string để hash
    let signString = '';
    sortedKeys.forEach(key => {
        if (key !== 'signature') {
            signString += `${key}=${data[key]}&`;
        }
    });
    
    // Thêm secret key
    signString += `secret_key=${SEPAY_CONFIG.secret_key}`;
    
    // Hash với SHA256
    return crypto.createHash('sha256').update(signString).digest('hex');
}

/**
 * Validate callback từ SePay
 */
function validateCallback(callbackData) {
    // Trong sandbox, SePay có thể không gửi signature hoặc format khác
    // Skip validation trong sandbox mode
    if (SEPAY_CONFIG.env === 'sandbox') {
        console.log('⚠️ Sandbox mode: Skipping signature validation');
        return true;
    }
    
    const receivedSignature = callbackData.signature;
    
    if (!receivedSignature) {
        console.error('No signature in callback data');
        return false;
    }
    
    // Tạo lại signature để so sánh
    const calculatedSignature = generateSignature(callbackData);
    
    const isValid = receivedSignature === calculatedSignature;
    if (!isValid) {
        console.error('Signature mismatch:', {
            received: receivedSignature,
            calculated: calculatedSignature
        });
    }
    
    return isValid;
}

/**
 * Parse callback data từ SePay
 */
function parseCallback(callbackData) {
    // SePay gửi data dạng nested objects
    const order = callbackData.order || {};
    const transaction = callbackData.transaction || {};
    
    return {
        order_invoice_number: order.order_invoice_number || order.order_id,
        transaction_id: transaction.transaction_id || transaction.id,
        amount: parseFloat(order.order_amount || 0),
        status: transaction.transaction_status === 'APPROVED' ? 'success' : 'failed',
        payment_method: transaction.payment_method,
        bank_code: transaction.card_brand || '',
        transaction_time: transaction.transaction_date,
        message: callbackData.notification_type || 'Payment notification'
    };
}

module.exports = {
    SEPAY_CONFIG,
    generateVietQR,
    validateCallback,
    parseCallback
};
