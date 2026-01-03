const crypto = require('crypto');

// Cấu hình TheSieuRe API (placeholder - sẽ cập nhật sau khi có Partner ID và Key)
const THESIEURE_CONFIG = {
    PARTNER_ID: 'YOUR_PARTNER_ID',  // TODO: Thay bằng Partner ID thật
    PARTNER_KEY: 'YOUR_PARTNER_KEY', // TODO: Thay bằng Partner Key thật
    API_ENDPOINT: 'https://thesieure.com/chargingws/v2',
    CALLBACK_URL: 'http://localhost:3000/api/recharge/callback/card' // TODO: Thay bằng domain thật
};

// Mapping loại thẻ
const CARD_TYPE_MAPPING = {
    'VIETTEL': 'VIETTEL',
    'VINAPHONE': 'VINAPHONE',
    'MOBIFONE': 'MOBIFONE',
    'VIETNAMOBILE': 'VIETNAMOBILE',
    'ZING': 'ZING',
    'GATE': 'GATE'
};

// Tạo chữ ký MD5 cho request
function generateSignature(partnerKey, cardCode, cardSerial) {
    const signString = partnerKey + cardCode + cardSerial;
    return crypto.createHash('md5').update(signString).digest('hex');
}

// Gửi thẻ cào lên TheSieuRe API
async function submitCard(cardData) {
    try {
        const { request_id, card_type, card_serial, card_code, card_amount } = cardData;

        // Kiểm tra cấu hình
        if (THESIEURE_CONFIG.PARTNER_ID === 'YOUR_PARTNER_ID') {
            console.warn('WARNING: Using placeholder Partner ID. Card will not be processed by real API.');
            // Trả về kết quả giả để test
            return {
                code: '99',
                message: 'Đang chờ xử lý (API chưa được cấu hình)',
                request_id: request_id,
                declared_value: card_amount,
                value: 0,
                amount: 0,
                status: 'pending'
            };
        }

        // Tạo chữ ký
        const sign = generateSignature(THESIEURE_CONFIG.PARTNER_KEY, card_code, card_serial);

        // Chuẩn bị payload
        const payload = {
            telco: CARD_TYPE_MAPPING[card_type] || card_type,
            code: card_code,
            serial: card_serial,
            amount: card_amount,
            request_id: request_id,
            partner_id: THESIEURE_CONFIG.PARTNER_ID,
            sign: sign,
            command: 'charging'
        };

        console.log('Sending card to TheSieuRe:', {
            request_id,
            telco: payload.telco,
            amount: card_amount
        });

        // Gọi API TheSieuRe
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(THESIEURE_CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('TheSieuRe API Response:', result);

        return result;

    } catch (error) {
        console.error('Submit card error:', error);
        return {
            code: '0',
            message: 'Lỗi kết nối với cổng nạp thẻ: ' + error.message,
            request_id: cardData.request_id,
            status: 'failed'
        };
    }
}

// Validate callback từ TheSieuRe
function validateCallback(callbackData) {
    try {
        // Kiểm tra chữ ký callback (nếu TheSieuRe có gửi)
        // Format: md5(partner_key + code + serial)
        const { sign, code, serial } = callbackData;
        
        if (!sign) {
            console.warn('Callback without signature - accepting in development mode');
            return true; // Chấp nhận trong môi trường dev
        }

        if (THESIEURE_CONFIG.PARTNER_KEY === 'YOUR_PARTNER_KEY') {
            console.warn('Accepting callback without validation (placeholder config)');
            return true;
        }

        const expectedSign = crypto
            .createHash('md5')
            .update(THESIEURE_CONFIG.PARTNER_KEY + code + serial)
            .digest('hex');

        const isValid = sign === expectedSign;
        
        if (!isValid) {
            console.error('Invalid callback signature:', {
                received: sign,
                expected: expectedSign
            });
        }

        return isValid;

    } catch (error) {
        console.error('Validate callback error:', error);
        return false;
    }
}

// Kiểm tra trạng thái giao dịch từ TheSieuRe
async function checkTransactionStatus(requestId) {
    try {
        if (THESIEURE_CONFIG.PARTNER_ID === 'YOUR_PARTNER_ID') {
            console.warn('Cannot check transaction status - placeholder config');
            return null;
        }

        const payload = {
            request_id: requestId,
            partner_id: THESIEURE_CONFIG.PARTNER_ID,
            command: 'check'
        };

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(THESIEURE_CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Check transaction status error:', error);
        return null;
    }
}

// Export các hàm
module.exports = {
    THESIEURE_CONFIG,
    submitCard,
    validateCallback,
    checkTransactionStatus,
    generateSignature
};
