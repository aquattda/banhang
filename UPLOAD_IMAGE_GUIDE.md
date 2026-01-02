# Hướng dẫn kiểm tra Upload Ảnh

## Vấn đề phát hiện:
1. ✅ Tất cả sản phẩm trong database có `image_url = NULL`
2. ✅ Thư mục `/frontend/images/products/` tồn tại nhưng trống
3. ✅ Code upload đã được sửa và thêm logging

## Các thay đổi đã thực hiện:

### 1. Frontend (products.html)
- Bỏ required cho input file (cho phép edit sản phẩm mà không đổi ảnh)
- Sửa placeholder image từ `../images/placeholder.jpg` → `/images/logo/roblox-app-icon-hd-removebg-preview.png`
- Thêm `onerror` fallback cho thẻ img
- Thêm console.log để debug upload process

### 2. Luồng Upload hoạt động:
```
1. Admin chọn file ảnh
   ↓
2. handleImageUpload() được trigger
   ↓
3. Validate file type (jpg, png, gif, webp)
   ↓
4. Validate file size (max 5MB)
   ↓
5. Show preview ngay lập tức (FileReader)
   ↓
6. Upload lên server qua POST /api/upload-image
   ↓
7. Server lưu file vào /frontend/images/products/
   ↓
8. Server trả về imageUrl: "/images/products/filename-123456.jpg"
   ↓
9. Frontend lưu imageUrl vào hidden input #form-image
   ↓
10. Khi submit form, imageUrl được gửi lên database
```

## Cách test:

### Bước 1: Khởi động server
```bash
cd c:\xampp\htdocs\WebBanHang\banhang
npm start
```

### Bước 2: Mở trang admin
```
http://localhost:3000/admin/products.html
```

### Bước 3: Thêm sản phẩm mới
1. Click "➕ Thêm sản phẩm"
2. Điền thông tin (Game, Danh mục, Tên, Giá bán, Giá nhập)
3. Click vào "Hình ảnh sản phẩm" và chọn file ảnh từ máy
4. Kiểm tra:
   - Preview ảnh hiện ra ngay
   - Status hiển thị "⏳ Đang upload..." → "✅ Upload thành công!"
   - Mở Console (F12) xem log:
     ```
     Uploading image to /api/upload-image...
     Response status: 200
     Upload result: {success: true, imageUrl: "/images/products/...", ...}
     Image URL saved: /images/products/...
     ```
5. Click "💾 Lưu"

### Bước 4: Kiểm tra kết quả
1. **Trong bảng admin**: Ảnh phải hiển thị ở cột "HÌNH ẢNH"
2. **Trong thư mục**: Check `frontend/images/products/` có file ảnh mới
3. **Trong database**: 
   ```sql
   SELECT product_id, name, image_url FROM products ORDER BY product_id DESC LIMIT 1;
   ```
   → `image_url` phải có giá trị `/images/products/filename-...`
4. **Trang khách hàng**: Mở http://localhost:3000/product.html - ảnh phải hiển thị

## Nếu vẫn không hiển thị:

### Kiểm tra Console (F12):
- Có lỗi 404 khi load ảnh?
- Upload response có success: true không?
- imageUrl có đúng format không?

### Kiểm tra file system:
```powershell
Get-ChildItem "c:\xampp\htdocs\WebBanHang\banhang\frontend\images\products"
```

### Kiểm tra server log:
- Xem terminal đang chạy `npm start`
- Có lỗi khi upload không?

### Kiểm tra quyền thư mục:
- Đảm bảo thư mục `frontend/images/products/` có quyền ghi

## Test nhanh với CURL:
```bash
# Upload test image
curl -X POST -F "image=@path/to/test.jpg" http://localhost:3000/api/upload-image
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "imageUrl": "/images/products/test-1234567890.jpg",
  "filename": "test-1234567890.jpg"
}
```
