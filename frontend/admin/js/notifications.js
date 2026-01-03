// Custom notification system for admin panel

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto close
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Custom confirmation dialog
function showConfirm(message, title = 'Xác nhận') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.innerHTML = `
            <div class="custom-confirm-overlay"></div>
            <div class="custom-confirm-dialog">
                <div class="custom-confirm-header">
                    <h3>${title}</h3>
                </div>
                <div class="custom-confirm-body">
                    <p>${message}</p>
                </div>
                <div class="custom-confirm-footer">
                    <button class="confirm-btn confirm-cancel">Hủy</button>
                    <button class="confirm-btn confirm-ok">Xác nhận</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => modal.classList.add('show'), 10);
        
        const okBtn = modal.querySelector('.confirm-ok');
        const cancelBtn = modal.querySelector('.confirm-cancel');
        const overlay = modal.querySelector('.custom-confirm-overlay');
        
        const closeModal = (result) => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                resolve(result);
            }, 300);
        };
        
        okBtn.addEventListener('click', () => closeModal(true));
        cancelBtn.addEventListener('click', () => closeModal(false));
        overlay.addEventListener('click', () => closeModal(false));
        
        // Focus OK button
        okBtn.focus();
    });
}

// Custom alert dialog
function showAlert(message, title = 'Thông báo', type = 'info') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = `custom-alert-modal ${type}`;
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        modal.innerHTML = `
            <div class="custom-alert-overlay"></div>
            <div class="custom-alert-dialog">
                <div class="custom-alert-icon ${type}">
                    ${icons[type] || icons.info}
                </div>
                <div class="custom-alert-header">
                    <h3>${title}</h3>
                </div>
                <div class="custom-alert-body">
                    <p>${message}</p>
                </div>
                <div class="custom-alert-footer">
                    <button class="alert-btn alert-ok">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => modal.classList.add('show'), 10);
        
        const okBtn = modal.querySelector('.alert-ok');
        const overlay = modal.querySelector('.custom-alert-overlay');
        
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                resolve();
            }, 300);
        };
        
        okBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Focus OK button
        okBtn.focus();
    });
}

// ========== THÔNG BÁO ĐƠN HÀNG MỚI ==========

// Sử dụng window để tránh redeclaration nếu file load nhiều lần
if (typeof window.orderNotificationVars === 'undefined') {
    window.orderNotificationVars = {
        lastOrderCount: 0,
        isFirstCheck: true,
        notificationCheckInterval: null,
        originalTitle: document.title,
        titleBlinkInterval: null
    };
}

// Cập nhật title với số đơn hàng pending
function updateTitleWithOrders(pendingCount) {
    if (pendingCount > 0) {
        document.title = `(${pendingCount}) ${window.orderNotificationVars.originalTitle}`;
    } else {
        document.title = window.orderNotificationVars.originalTitle;
    }
}

// Làm nháy title khi có đơn mới
function blinkTitle(pendingCount) {
    // Dừng blink cũ nếu có
    if (window.orderNotificationVars.titleBlinkInterval) {
        clearInterval(window.orderNotificationVars.titleBlinkInterval);
    }
    
    let isOriginal = false;
    let blinkCount = 0;
    const maxBlinks = 6; // Nháy 6 lần (3 giây)
    
    window.orderNotificationVars.titleBlinkInterval = setInterval(() => {
        if (blinkCount >= maxBlinks) {
            clearInterval(window.orderNotificationVars.titleBlinkInterval);
            window.orderNotificationVars.titleBlinkInterval = null;
            updateTitleWithOrders(pendingCount);
            return;
        }
        
        if (isOriginal) {
            document.title = window.orderNotificationVars.originalTitle;
        } else {
            document.title = `🔔 ${pendingCount} ĐƠN MỚI! 🔔`;
        }
        
        isOriginal = !isOriginal;
        blinkCount++;
    }, 500);
}

// Kiểm tra đơn hàng mới
async function checkNewOrders() {
    try {
        // Kiểm tra xem có phải trang admin không
        const token = localStorage.getItem('admin_token');
        if (!token) {
            console.log('⚠️ No admin token found, skipping order check');
            return;
        }

        console.log('🔍 Checking for new orders...');

        const response = await fetch('/api/orders/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('❌ Order check failed:', response.status, response.statusText);
            // Nếu 401/403 có thể token hết hạn
            if (response.status === 401 || response.status === 403) {
                console.log('⚠️ Authentication failed, stopping notifications');
                if (window.orderNotificationVars.notificationCheckInterval) {
                    clearInterval(window.orderNotificationVars.notificationCheckInterval);
                    window.orderNotificationVars.notificationCheckInterval = null;
                }
            }
            return;
        }

        // Kiểm tra content type trước khi parse JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Response is not JSON:', contentType);
            const text = await response.text();
            console.error('Response text:', text.substring(0, 200));
            return;
        }

        const result = await response.json();
        if (!result.success || !result.data) {
            console.log('⚠️ Invalid order response:', result);
            return;
        }

        const orders = result.data;
        const currentOrderCount = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending');

        console.log(`📊 Current: ${currentOrderCount} orders, Last: ${window.orderNotificationVars.lastOrderCount} orders, Pending: ${pendingOrders.length}`);

        // Lần đầu tiên chỉ lưu số lượng, không hiển thị thông báo
        if (window.orderNotificationVars.isFirstCheck) {
            window.orderNotificationVars.lastOrderCount = currentOrderCount;
            window.orderNotificationVars.isFirstCheck = false;
            console.log('✅ Initial order count set:', currentOrderCount);
            // Cập nhật title với số đơn pending hiện tại
            updateTitleWithOrders(pendingOrders.length);
            return;
        }

        // Cập nhật title với số đơn pending
        updateTitleWithOrders(pendingOrders.length);

        // Có đơn hàng mới
        if (currentOrderCount > window.orderNotificationVars.lastOrderCount) {
            const newOrdersCount = currentOrderCount - window.orderNotificationVars.lastOrderCount;
            
            console.log(`🔔 NEW ORDER DETECTED! Count: ${newOrdersCount}`);
            
            // Làm nháy title
            blinkTitle(pendingOrders.length);
            
            // Hiển thị thông báo nổi
            showOrderNotification(newOrdersCount, pendingOrders.length);
            
            // Phát âm thanh thông báo (nếu có)
            playNotificationSound();
            
            // Cập nhật số lượng
            window.orderNotificationVars.lastOrderCount = currentOrderCount;
            
            // Log để debug
            console.log(`🔔 ${newOrdersCount} đơn hàng mới! Tổng đơn chờ: ${pendingOrders.length}`);
            
            // Tự động reload nếu đang ở trang orders hoặc dashboard
            const currentPath = window.location.pathname;
            if (currentPath.includes('orders.html') && typeof loadOrders === 'function') {
                console.log('🔄 Reloading orders page...');
                loadOrders();
            } else if (currentPath.includes('dashboard.html') && typeof loadDashboard === 'function') {
                console.log('🔄 Reloading dashboard...');
                loadDashboard();
            }
        } else {
            console.log('✓ No new orders');
        }

    } catch (error) {
        console.error('❌ Check new orders error:', error);
        console.error('Error details:', error.message, error.stack);
    }
}

// Hiển thị thông báo đơn hàng mới (có thể click để đi tới trang orders)
function showOrderNotification(newCount, pendingCount) {
    console.log('📢 Showing order notification:', newCount, 'new orders');
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification success order-notification';
    notification.style.cssText = 'cursor: pointer; z-index: 10000;';
    
    notification.innerHTML = `
        <div class="notification-icon">🔔</div>
        <div class="notification-content">
            <div class="notification-message">
                <strong>${newCount} đơn hàng mới!</strong><br>
                <small>Hiện có ${pendingCount} đơn chờ xử lý</small>
            </div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    console.log('✅ Notification added to DOM');
    
    // Click để đi tới trang orders
    notification.addEventListener('click', (e) => {
        if (!e.target.classList.contains('notification-close')) {
            window.location.href = '/admin/orders.html';
        }
    });
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
        console.log('✅ Notification animation triggered');
    }, 10);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto close sau 10 giây (lâu hơn notification thường)
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

// Phát âm thanh thông báo
function playNotificationSound() {
    try {
        // Tạo âm thanh đơn giản bằng Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Cannot play notification sound:', error);
    }
}

// Bắt đầu kiểm tra đơn hàng mới mỗi 10 giây
function startOrderNotifications() {
    console.log('🚀 Starting order notification system...');
    
    // Kiểm tra token
    const token = localStorage.getItem('admin_token');
    if (!token) {
        console.warn('⚠️ Cannot start notifications: No admin token');
        return;
    }
    
    // Tránh khởi động nhiều lần
    if (window.orderNotificationVars.notificationCheckInterval) {
        console.log('⚠️ Notification system already running');
        return;
    }
    
    // Lưu title gốc của trang hiện tại
    window.orderNotificationVars.originalTitle = document.title;
    console.log('📄 Original title saved:', window.orderNotificationVars.originalTitle);
    
    // Kiểm tra ngay lập tức
    checkNewOrders();
    
    // Sau đó kiểm tra mỗi 10 giây
    window.orderNotificationVars.notificationCheckInterval = setInterval(checkNewOrders, 10000);
    
    console.log('✅ Order notification system started (checking every 10 seconds)');
}

// Tự động khởi động khi load trang admin
if (window.location.pathname.includes('/admin/')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔍 Admin page detected, initializing notifications...');
        const token = localStorage.getItem('admin_token');
        if (token) {
            console.log('✅ Admin token found, starting notifications');
            // Đợi 1 giây để đảm bảo trang load xong
            setTimeout(startOrderNotifications, 1000);
        } else {
            console.log('⚠️ No admin token found');
        }
    });
}
