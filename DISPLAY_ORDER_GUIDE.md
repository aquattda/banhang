# Hướng dẫn sử dụng Thứ tự hiển thị Game

## 📌 Tổng quan

Tính năng **Thứ tự hiển thị** (Display Order) cho phép Admin quản lý vị trí hiển thị của các game trên trang chủ. Game có số thứ tự nhỏ hơn sẽ hiển thị trước (ở trên cùng).

## ✨ Tính năng

### 1. **Quản lý thứ tự trong Admin**
- Truy cập: `/admin/categories.html` → Click "🎮 Quản lý Game"
- Bảng hiển thị có cột **THỨ TỰ** cho biết vị trí hiển thị
- Số thứ tự càng nhỏ → Hiển thị càng cao trên trang chủ

### 2. **Thêm Game mới**
- Click "➕ Thêm Game Mới"
- Nhập thông tin:
  - **Tên Game**: Tên hiển thị (VD: BloxFruits)
  - **Slug**: URL-friendly (VD: bloxfruits)
  - **Thứ tự**: Số nguyên (VD: 10, 20, 30...)
  - **Mô tả**: Mô tả ngắn về game

💡 **Mẹo**: Dùng bội số của 10 (10, 20, 30...) để dễ chèn game mới vào giữa sau này

### 3. **Chỉnh sửa thứ tự Game**
- Click nút **✏️ Sửa** ở game muốn điều chỉnh
- Thay đổi số **Thứ tự**:
  - Game nổi bật → Đặt số nhỏ (VD: 5, 10)
  - Game ít người chơi → Đặt số lớn (VD: 90, 100)
- Click **💾 Lưu**

### 4. **Hiển thị trên trang chủ**
Sau khi lưu thay đổi:
- Reload trang chủ `/index.html`
- Games sẽ hiển thị theo thứ tự từ nhỏ đến lớn
- Tối đa 5 games + nút "Xem Thêm"

## 🎯 Ví dụ thực tế

### Kịch bản: Đẩy "BloxFruits" lên đầu trang

**Bước 1**: Kiểm tra thứ tự hiện tại
```
BloxFruits: 10
King Legacy: 20
RIVALS: 70
```

**Bước 2**: Chỉnh sửa thứ tự
- BloxFruits → Giữ nguyên: `10` (hoặc giảm xuống `5`)
- King Legacy → Giữ nguyên: `20`
- RIVALS → Tăng lên: `80` (nếu muốn xuống thấp hơn)

**Kết quả trên trang chủ**:
1. BloxFruits (10) ← Hiển thị đầu tiên
2. King Legacy (20)
3. ...
4. RIVALS (80) ← Hiển thị sau cùng

### Kịch bản: Thêm game mới "Anime Adventures" vào vị trí thứ 2

**Bước 1**: Kiểm tra games hiện tại
```
BloxFruits: 10
King Legacy: 20
The Strongest Battlegrounds: 30
```

**Bước 2**: Thêm game mới
- Tên: `Anime Adventures`
- Slug: `anime-adventures`
- **Thứ tự: `15`** ← Nằm giữa 10 và 20
- Mô tả: `Game thu thập nhân vật anime`

**Kết quả**:
1. BloxFruits (10)
2. **Anime Adventures (15)** ← Game mới vừa thêm
3. King Legacy (20)
4. The Strongest Battlegrounds (30)

## 📊 Database Structure

### Bảng `games`
```sql
CREATE TABLE games (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,  -- ← Cột mới
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order)
);
```

### Query lấy games theo thứ tự
```sql
SELECT * FROM games 
WHERE is_active = TRUE 
ORDER BY display_order ASC, name ASC;
```

## 🔧 Technical Details

### Backend Controller
**File**: `backend/controllers/gameController.js`

```javascript
// Lấy games đã sắp xếp theo display_order
const getAllGames = async (req, res) => {
    const [games] = await db.query(
        'SELECT * FROM games WHERE is_active = TRUE ORDER BY display_order ASC, name ASC'
    );
    res.json({ success: true, data: games });
};

// Tạo game mới với display_order
const createGame = async (req, res) => {
    const { name, slug, description, display_order } = req.body;
    await db.query(
        'INSERT INTO games (name, slug, description, display_order) VALUES (?, ?, ?, ?)',
        [name, slug, description, display_order || 0]
    );
};
```

### Frontend Display
**File**: `frontend/index.html`

```javascript
// Load games đã được sắp xếp từ backend
const gamesResult = await API.getGames();
// Backend đã sort theo display_order, không cần sort thêm
const displayGames = gamesResult.data.slice(0, 5); // 5 games đầu tiên
```

## ⚠️ Lưu ý quan trọng

1. **Không trùng số thứ tự**: Tránh 2 games có cùng display_order. Nếu trùng, hệ thống sẽ sắp xếp theo tên.

2. **Dùng khoảng cách hợp lý**: Đặt khoảng cách 10 giữa các games (10, 20, 30...) để dễ chèn game mới vào giữa.

3. **Reload cache**: Sau khi thay đổi, người dùng cần reload trang chủ (F5) để thấy thay đổi.

4. **Cột "Thứ tự" trong Danh mục**: 
   - ❌ KHÔNG dùng để sắp xếp game
   - ✅ Chỉ dùng để sắp xếp danh mục TRONG một game cụ thể

5. **Test trước khi deploy**: Kiểm tra thứ tự trên trang chủ sau mỗi lần thay đổi.

## 🚀 Quick Actions

### Đẩy game lên đầu nhanh
```sql
UPDATE games SET display_order = 1 WHERE game_id = 1; -- BloxFruits lên đầu
```

### Reset về thứ tự mặc định
```sql
UPDATE games SET display_order = game_id * 10;
```

### Đẩy game nổi bật lên top 3
```sql
UPDATE games SET display_order = 5 WHERE name = 'BloxFruits';
UPDATE games SET display_order = 10 WHERE name = 'King Legacy';
UPDATE games SET display_order = 15 WHERE name = 'RIVALS';
```

## ✅ Checklist sau khi cập nhật

- [ ] Thay đổi display_order trong Admin
- [ ] Click "💾 Lưu" để lưu thay đổi
- [ ] Mở trang chủ `/index.html`
- [ ] Reload trang (Ctrl+F5)
- [ ] Kiểm tra games hiển thị đúng thứ tự
- [ ] Kiểm tra responsive trên mobile

---

**📞 Hỗ trợ**: Nếu có vấn đề, kiểm tra:
1. Database có cột `display_order` chưa?
2. Server đã restart chưa?
3. Browser cache đã clear chưa?
