# 🎮 GAME SHOP - Website Bán Vật Phẩm Game

Website bán vật phẩm game chuyên nghiệp với 11+ games Roblox phổ biến.

## 📋 Tính Năng Chính

### 👥 Khách Hàng:
- ✅ Xem danh sách 11+ games Roblox
- ✅ Duyệt sản phẩm nổi bật và mới nhất
- ✅ Lọc sản phẩm theo game và category
- ✅ Thêm vào giỏ hàng (localStorage)
- ✅ Đặt hàng không cần đăng ký
- ✅ Nhận mã đơn hàng
- ✅ Gửi tin nhắn liên hệ

### 🔐 Admin:
- ✅ Dashboard thống kê đẹp mắt
- ✅ Quản lý đơn hàng (xem, cập nhật)
- ✅ Xem tin nhắn liên hệ
- ✅ Giao diện hiện đại với gradient

## 🎮 Danh Sách Games

1. **BloxFruits** 🍇 - Trái Ác Quỷ, Gamepass
2. **King Legacy** 👑 - Trái Cây, Gamepass
3. **The Strongest Battlegrounds** 💪 - Gamepass
4. **Code Roblox** 🎮 - Prime Gaming
5. **Sol's RNG** 🎰 - Gamepass
6. **Heroes Battlegrounds** 🦸 - Gamepass
7. **RIVALS** 🔫 - Gamepass, Key Bundle
8. **Jujutsu Shenanigans** ⚡ - Gamepass
9. **Blue Lock: Rivals** ⚽ - Gamepass, Spins, Limiteds
10. **[🗡] Forsaken** 🗡️ - Gamepass
11. **Fish It! 🐟** 🐟 - Gamepass

## 🚀 Cài Đặt Nhanh

### Yêu Cầu:
- XAMPP (MySQL)
- Node.js & npm

### Các Bước:

**1. Start MySQL trong XAMPP**

**2. Tạo Database:**
```cmd
mysql -u root -p < database/schema.sql
```

**3. Import Games Mới:**
```cmd
mysql -u root -p banhang_game < database/update_new_games.sql
```

**4. Cấu hình `.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=banhang_game
PORT=3000
JWT_SECRET=your_secret_key
```

**5. Cài Dependencies:**
```cmd
npm install
```

**6. Start Server:**
```cmd
npm run dev
```

**7. Truy Cập:**
- Website: http://localhost:3000
- Admin: http://localhost:3000/admin/login.html
  - Email: `admin@banhang.com`
  - Password: `admin123`

## 📁 Cấu Trúc Project

```
banhang/
├── backend/              # Server & API
│   ├── server.js
│   ├── config/          # Database config
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   └── routes/          # API routes
├── frontend/            # Client-side
│   ├── index.html      # Trang chủ
│   ├── game.html       # Danh sách games
│   ├── product.html    # Chi tiết sản phẩm
│   ├── cart.html       # Giỏ hàng
│   ├── admin/          # Admin panel
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript
├── database/           # SQL files
│   ├── schema.sql      # Database schema
│   └── update_new_games.sql  # Games update
└── package.json
```

## 🔧 Scripts Có Sẵn

- `npm start` - Chạy production mode
- `npm run dev` - Chạy development mode (auto-reload)
- `start.bat` - Quick start script (Windows)
- `update_and_start.bat` - Update DB & start

## 📚 Tài Liệu

- `SETUP.md` - Hướng dẫn cài đặt chi tiết
- `XAMPP_SETUP.md` - Hướng dẫn setup với XAMPP
- `UPDATE_NOTES.md` - Changelog và updates
- `FIX_ADMIN_LOGIN.sql` - Fix lỗi đăng nhập admin

## 🎨 Công Nghệ

### Frontend:
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive Design
- Local Storage for Cart

### Backend:
- Node.js
- Express.js
- MySQL2
- JWT Authentication
- bcryptjs for password hashing

## 🔐 Bảo Mật

- Passwords được hash với bcrypt
- JWT tokens cho authentication
- Input validation
- SQL injection prevention
- XSS protection

## 📊 API Endpoints

### Public:
- `GET /api/games` - Danh sách games
- `GET /api/games/:slug` - Chi tiết game
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/latest` - Sản phẩm mới nhất
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/orders` - Tạo đơn hàng
- `POST /api/contacts` - Gửi liên hệ

### Admin (Requires Auth):
- `GET /api/orders` - Quản lý đơn hàng
- `PATCH /api/orders/:id` - Cập nhật đơn hàng
- `GET /api/contacts` - Xem tin nhắn

## 🎯 Tính Năng Nổi Bật

### Giao Diện:
- ✨ Modern gradient design
- 🎨 Smooth animations & transitions
- 📱 Mobile responsive
- 🌈 Beautiful color scheme

### User Experience:
- ⚡ Fast loading
- 🛒 Easy cart management
- 💳 Simple checkout process
- 📧 Order tracking

### Admin Panel:
- 📊 Beautiful dashboard
- 📈 Statistics overview
- 🔍 Order filtering
- ✏️ Status updates

## 🐛 Troubleshooting

### Lỗi Database Connection:
```bash
# Kiểm tra MySQL đã chạy
# Kiểm tra credentials trong .env
```

### Lỗi Admin Login:
```sql
-- Chạy file FIX_ADMIN_LOGIN.sql
UPDATE users 
SET password_hash = '$2a$10$2bDK6a3j8e5O2PkgQjn0ju9A46PSd2foRQzFSSvPHgswesUdBeEzW' 
WHERE email = 'admin@banhang.com';
```

### Port đã được dùng:
```cmd
# Tìm và kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📞 Hỗ Trợ

- 📧 Email: support@gameshop.vn
- 💬 Zalo: 0123-456-789
- 🕐 Hỗ trợ: 8:00 - 22:00

## 📝 License

MIT License - Free to use and modify

## 🎊 Credits

Developed with ❤️ for game lovers

---

**Happy Coding! 🚀**
