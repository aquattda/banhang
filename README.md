# 🎮 Website Bán Vật Phẩm Game - GameShop

Website thương mại điện tử chuyên bán vật phẩm game như Robux (Roblox), Liên Quân, Free Fire, Genshin Impact...

## ✨ Tính Năng Chính

### 👥 Dành cho Khách Hàng:
- ✅ Xem danh sách game và vật phẩm
- ✅ Lọc sản phẩm theo loại, giá
- ✅ Sắp xếp sản phẩm (giá, tên, mới nhất)
- ✅ Chi tiết sản phẩm với đầy đủ thông tin
- ✅ Giỏ hàng (lưu trên localStorage)
- ✅ Đặt hàng không cần đăng ký
- ✅ Nhiều phương thức thanh toán (Bank, MoMo)
- ✅ Nhận mã đơn hàng ngay lập tức
- ✅ Trang liên hệ với FAQ
- ✅ Giao diện thân thiện, responsive

### 🔐 Dành cho Admin:
- ✅ Đăng nhập bảo mật với JWT
- ✅ Dashboard thống kê tổng quan
- ✅ Quản lý đơn hàng (xem, cập nhật trạng thái)
- ✅ Quản lý Games (CRUD)
- ✅ Quản lý Sản phẩm (CRUD)
- ✅ Quản lý Categories (CRUD)
- ✅ Xem tin nhắn liên hệ

## 🚀 Hướng Dẫn Cài Đặt Nhanh

### Yêu cầu:
- Node.js >= 14
- MySQL >= 5.7
- npm

### Các bước cài đặt:

#### 1. Cài đặt dependencies
```bash
npm install
```

#### 2. Cấu hình database
Tạo database MySQL:
```sql
CREATE DATABASE banhang_game;
```

Import schema:
```bash
mysql -u root -p banhang_game < database/schema.sql
```

#### 3. Cấu hình môi trường
Cập nhật file `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banhang_game
PORT=3000
```

#### 4. Chạy server
```bash
c
```

Hoặc chạy file `start.bat` (Windows)

#### 5. Truy cập website
- **Trang chủ**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login.html

## 🔑 Tài Khoản Mặc Định

### Admin:
- **Email**: admin@banhang.com
- **Password**: admin123

## 📁 Cấu Trúc Project

```
banhang/
├── backend/                # Backend API
│   ├── config/            # Database config
│   ├── controllers/       # Controllers (logic)
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication
│   └── server.js          # Main server
├── frontend/              # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript
│   ├── admin/             # Admin panel
│   └── *.html             # Pages
├── database/              # Database
│   └── schema.sql         # Schema
├── tools/                 # Utilities
└── package.json
```

## 🛠️ Công Nghệ Sử Dụng

### Backend:
- Node.js + Express.js
- MySQL2
- JWT Authentication
- bcryptjs

### Frontend:
- HTML5, CSS3
- Vanilla JavaScript
- Responsive Design
- localStorage

## 🔒 Bảo Mật

- Password hash với bcrypt
- JWT authentication
- SQL injection prevention
- CORS enabled
- Input validation

## 📝 Xem Thêm

Xem file `SETUP.md` để biết hướng dẫn chi tiết và troubleshooting.

---

**Made with ❤️ for Game Shop**
