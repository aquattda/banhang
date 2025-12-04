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
