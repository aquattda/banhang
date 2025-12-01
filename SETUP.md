# Hướng Dẫn Cài Đặt và Chạy Website

## Bước 1: Cài đặt dependencies

```bash
npm install
```

## Bước 2: Cấu hình Database

1. Tạo database MySQL:
   - Mở MySQL Workbench hoặc phpMyAdmin
   - Import file `database/schema.sql`

2. Hoặc chạy lệnh:
```bash
mysql -u root -p < database/schema.sql
```

3. Cập nhật thông tin database trong file `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banhang_game
```

## Bước 3: Hash password admin

Password mặc định trong schema.sql đã được hash sẵn cho `admin123`.

Nếu muốn đổi password, chạy script:
```bash
node tools/hash-password.js your_new_password
```

Sau đó cập nhật vào database:
```sql
UPDATE users SET password_hash = 'your_hashed_password' WHERE email = 'admin@banhang.com';
```

## Bước 4: Chạy server

### Development (với auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server sẽ chạy tại: http://localhost:3000

## Bước 5: Truy cập

- **Trang chủ**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login.html
  - Email: admin@banhang.com
  - Password: admin123

## Cấu trúc Database

Website sử dụng các bảng chính:
- `users` - Người dùng và admin
- `games` - Danh sách games
- `categories` - Loại vật phẩm
- `products` - Sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `contact_messages` - Tin nhắn liên hệ
- `banners` - Banner trang chủ

## Tính năng chính

### Khách hàng:
✅ Xem danh sách game và vật phẩm
✅ Lọc, sắp xếp sản phẩm
✅ Thêm vào giỏ hàng (localStorage)
✅ Đặt hàng không cần đăng ký
✅ Nhận mã đơn hàng
✅ Liên hệ hỗ trợ

### Admin:
✅ Đăng nhập bảo mật
✅ Dashboard thống kê
✅ Quản lý đơn hàng (xem, cập nhật trạng thái)
✅ Quản lý games (CRUD)
✅ Quản lý sản phẩm (CRUD)
✅ Xem tin nhắn liên hệ

## Lưu ý

1. **Database**: Đảm bảo MySQL đã chạy trước khi start server
2. **Port**: Mặc định là 3000, có thể đổi trong `.env`
3. **Images**: Hiện tại dùng emoji làm placeholder, bạn có thể thêm ảnh thật vào `frontend/images/`
4. **Security**: Đổi JWT_SECRET trong `.env` cho môi trường production

## Troubleshooting

### Lỗi kết nối database:
- Kiểm tra MySQL đã chạy
- Kiểm tra thông tin trong `.env`
- Kiểm tra database đã được tạo

### Lỗi port đã được sử dụng:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
```

### Lỗi admin không đăng nhập được:
- Kiểm tra user đã được tạo trong database
- Kiểm tra password hash đúng
- Clear localStorage trong browser

## Mở rộng trong tương lai

- [ ] Upload ảnh sản phẩm
- [ ] Payment gateway thực (VNPay, MoMo API)
- [ ] Email notification
- [ ] SMS notification
- [ ] Review & rating sản phẩm
- [ ] User account và lịch sử đơn hàng
- [ ] Mã giảm giá / voucher
- [ ] Báo cáo doanh thu admin
- [ ] Real-time notification

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ qua email.
