const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Đảm bảo thư mục upload tồn tại
const uploadDir = path.join(__dirname, '../../frontend/images/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique: timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
});

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
    }
};

// Khởi tạo multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter
});

// POST /api/upload-image - Upload single image
router.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Không có file nào được upload' 
            });
        }

        // Trả về URL của ảnh đã upload
        const imageUrl = `/images/products/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Upload ảnh thành công',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi khi upload ảnh',
            message: error.message 
        });
    }
});

// DELETE /api/delete-image/:filename - Xóa ảnh (optional)
router.delete('/delete-image/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ 
                success: true, 
                message: 'Đã xóa ảnh thành công' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                error: 'Không tìm thấy file' 
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi khi xóa ảnh' 
        });
    }
});

// Error handling cho multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File quá lớn. Kích thước tối đa là 5MB'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        error: error.message
    });
});

module.exports = router;
