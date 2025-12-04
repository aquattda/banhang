# Hướng Dẫn Hoàn Thiện Hệ Thống Đăng Nhập Khách Hàng

## Các Bước Đã Hoàn Thành:

### 1. Database ✅
- Tạo bảng `customers` với các trường: customer_id, email, password_hash, name, phone, address
- Thêm cột `customer_id` vào bảng `orders`
- **Chạy file SQL**: `database/create_customers_table.sql`

### 2. Backend API ✅
- Controller: `backend/controllers/customerAuthController.js`
  - `/api/customer-auth/register` - Đăng ký
  - `/api/customer-auth/login` - Đăng nhập
  - `/api/customer-auth/profile` - Lấy/cập nhật thông tin
  - `/api/customer-auth/change-password` - Đổi mật khẩu
  - `/api/customer-auth/orders` - Lịch sử đơn hàng
  
- Middleware: `customerAuthMiddleware` trong `backend/middleware/auth.js`
- Routes: `backend/routes/customer-auth.js`
- Đã tích hợp vào `server.js`

### 3. Frontend Pages ✅
- `login.html` - Trang đăng nhập
- `register.html` - Trang đăng ký  
- `account.html` - Quản lý tài khoản với 3 tabs:
  - Thông tin cá nhân (có thể chỉnh sửa)
  - Lịch sử đơn hàng
  - Đổi mật khẩu

### 4. Auth Helper ✅
- `js/customer-auth.js` - Utility functions cho authentication
  - `CustomerAuth.isLoggedIn()` - Kiểm tra đăng nhập
  - `CustomerAuth.getCustomer()` - Lấy thông tin user
  - `CustomerAuth.updateHeader()` - Cập nhật header với user menu
  - User dropdown menu với CSS

## Các Bước Cần Làm Tiếp:

### Bước 1: Chạy SQL Script
```bash
# Trong phpMyAdmin hoặc MySQL client:
source database/create_customers_table.sql
```

### Bước 2: Cài Đặt Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### Bước 3: Cập Nhật Header Các Trang Còn Lại

Thêm vào phần `<div class="nav-actions">` của các file:
- games.html
- game-detail.html
- contact.html
- product.html
- cart.html

```html
<div class="nav-actions">
    <a href="/cart.html" class="cart-btn">
        🛒 Giỏ hàng
        <span class="cart-count" id="cart-count">0</span>
    </a>
    <div id="auth-btn"></div>
</div>
```

Và thêm script trước `</body>`:
```html
<script src="/js/customer-auth.js"></script>
```

### Bước 4: Tích Hợp Vào Cart Checkout

Trong file `cart.html`, cập nhật form checkout để:

1. **Auto-fill thông tin nếu đã đăng nhập**:
```javascript
// Thêm vào DOMContentLoaded
if (CustomerAuth.isLoggedIn()) {
    const customer = CustomerAuth.getCustomer();
    document.getElementById('buyer_name').value = customer.name || '';
    document.getElementById('buyer_phone').value = customer.phone || '';
    document.getElementById('buyer_email').value = customer.email || '';
}
```

2. **Gửi customer_id khi tạo đơn hàng**:
```javascript
// Trong hàm checkout
const orderData = {
    buyer_name,
    buyer_phone,
    buyer_email,
    payment_method,
    note,
    customer_id: CustomerAuth.isLoggedIn() ? CustomerAuth.getCustomer().customer_id : null,
    items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }))
};
```

## Tính Năng Đã Có:

✅ Đăng ký tài khoản mới với validation
✅ Đăng nhập với JWT token (30 ngày)
✅ Tự động điền thông tin khi checkout
✅ Xem lịch sử đơn hàng
✅ Cập nhật thông tin cá nhân
✅ Đổi mật khẩu
✅ User menu dropdown ở header
✅ Logout
✅ Protected routes với authentication
✅ Auto-redirect nếu chưa đăng nhập khi vào /account.html

## Cách Kiểm Tra:

1. **Đăng ký tài khoản mới**: Truy cập `/register.html`
2. **Đăng nhập**: Truy cập `/login.html`
3. **Xem tài khoản**: Sau khi đăng nhập, click vào tên user ở header → chọn "Tài khoản của tôi"
4. **Mua hàng**: Thêm sản phẩm vào giỏ → Checkout → Thông tin tự động điền
5. **Xem lịch sử**: Vào account.html → tab "Lịch sử đơn hàng"

## Lưu Ý:

- Token được lưu trong localStorage với key `customer_token`
- Thông tin khách hàng lưu trong `customer_info`
- Password được hash với bcrypt (10 rounds)
- JWT secret nên thay đổi trong production (file `.env`)

## Security Notes:

- Mật khẩu được hash trước khi lưu database
- JWT token hết hạn sau 30 ngày
- Protected routes kiểm tra token hợp lệ
- Không trả về password_hash từ API
