// API endpoints
const API_BASE = 'http://localhost:3000/api';

// Các phí thẻ cào
const CARD_FEES = {
    'VIETTEL': 11,
    'VINAPHONE': 14,
    'MOBIFONE': 15,
    'VIETNAMOBILE': 16,
    'ZING': 14,
    'GATE': 16
};

// Selected card amount
let selectedAmount = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Kiểm tra đăng nhập
    const customer = CustomerAuth.getCustomer();
    if (!customer) {
        showNotification('Vui lòng đăng nhập để nạp tiền', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=recharge.html';
        }, 2000);
        return;
    }

    // Load wallet balance
    await loadWalletBalance();

    // Setup tabs
    setupTabs();

    // Setup card amount selection
    setupCardAmounts();

    // Setup forms
    setupCardForm();
    setupBankForm();

    // Card type change listener
    document.getElementById('cardType').addEventListener('change', updateFeeInfo);
});

// Load wallet balance
async function loadWalletBalance() {
    try {
        const token = localStorage.getItem('customer_token');
        const response = await fetch(`${API_BASE}/recharge/wallet`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('walletBalance').textContent = formatCurrency(data.balance);
        }
    } catch (error) {
        console.error('Load wallet error:', error);
    }
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Remove active class from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked
            button.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
}

// Setup card amount buttons
function setupCardAmounts() {
    const amountButtons = document.querySelectorAll('.amount-btn');

    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected from all
            amountButtons.forEach(btn => btn.classList.remove('selected'));

            // Add selected to clicked
            button.classList.add('selected');
            selectedAmount = parseInt(button.dataset.amount);

            // Update fee info
            updateFeeInfo();
        });
    });
}

// Update fee info
function updateFeeInfo() {
    const cardType = document.getElementById('cardType').value;
    const feeInfo = document.getElementById('feeInfo');

    if (!cardType || !selectedAmount) {
        feeInfo.style.display = 'none';
        return;
    }

    const feePercent = CARD_FEES[cardType] || 0;
    const feeAmount = (selectedAmount * feePercent) / 100;
    const actualAmount = selectedAmount - feeAmount;

    document.getElementById('feePercent').textContent = feePercent;
    document.getElementById('actualAmount').textContent = formatCurrency(actualAmount);

    feeInfo.style.display = 'block';
}

// Setup card form
function setupCardForm() {
    const form = document.getElementById('cardForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cardType = document.getElementById('cardType').value;
        const cardSerial = document.getElementById('cardSerial').value.trim();
        const cardCode = document.getElementById('cardCode').value.trim();

        // Validate
        if (!cardType || !selectedAmount || !cardSerial || !cardCode) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = document.getElementById('cardSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';

        try {
            const token = localStorage.getItem('customer_token');
            const response = await fetch(`${API_BASE}/recharge/card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    card_type: cardType,
                    card_serial: cardSerial,
                    card_code: cardCode,
                    card_amount: selectedAmount
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showNotification('Đã gửi yêu cầu nạp thẻ thành công! Vui lòng đợi xác nhận.', 'success');
                
                // Reset form
                form.reset();
                selectedAmount = null;
                document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
                document.getElementById('feeInfo').style.display = 'none';

                // Reload balance after 2 seconds
                setTimeout(() => {
                    loadWalletBalance();
                    window.location.href = 'wallet-history.html';
                }, 2000);
            } else {
                showNotification(data.message || 'Lỗi nạp thẻ', 'error');
            }
        } catch (error) {
            console.error('Card recharge error:', error);
            showNotification('Lỗi kết nối. Vui lòng thử lại.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Nạp thẻ ngay';
        }
    });
}

// Setup bank form
function setupBankForm() {
    const form = document.getElementById('bankForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bankName = document.getElementById('bankName').value.trim();
        const bankAccount = document.getElementById('bankAccount').value.trim();
        const bankTransactionCode = document.getElementById('bankTransactionCode').value.trim();
        const bankAmount = parseInt(document.getElementById('bankAmount').value);

        // Validate
        if (!bankName || !bankAmount || bankAmount < 10000) {
            showNotification('Vui lòng điền đầy đủ thông tin và số tiền tối thiểu 10,000 ₫', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = document.getElementById('bankSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';

        try {
            const token = localStorage.getItem('customer_token');
            const response = await fetch(`${API_BASE}/recharge/bank`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bank_name: bankName,
                    bank_account: bankAccount,
                    bank_transaction_code: bankTransactionCode,
                    amount: bankAmount
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showNotification('Đã ghi nhận yêu cầu nạp tiền! Admin sẽ xác nhận trong 24h.', 'success');
                
                // Reset form
                form.reset();

                // Redirect to history after 2 seconds
                setTimeout(() => {
                    window.location.href = 'wallet-history.html';
                }, 2000);
            } else {
                showNotification(data.message || 'Lỗi ghi nhận yêu cầu', 'error');
            }
        } catch (error) {
            console.error('Bank recharge error:', error);
            showNotification('Lỗi kết nối. Vui lòng thử lại.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Xác nhận đã chuyển khoản';
        }
    });
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã copy!', 'success');
    }).catch(() => {
        showNotification('Lỗi copy', 'error');
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
