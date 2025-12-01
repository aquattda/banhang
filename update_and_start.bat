@echo off
echo ================================================
echo   GAME SHOP - CAP NHAT DATABASE & START SERVER
echo ================================================
echo.

echo [BUOC 1] Kiem tra MySQL...
echo Ban da BAT MySQL trong XAMPP chua? (Ctrl+C de huy)
pause

echo.
echo [BUOC 2] Cap nhat database voi games moi...
echo.
echo Chay lenh sau trong phpMyAdmin hoac MySQL:
echo.
echo    File: database/update_new_games.sql
echo.
echo Hoac chay command:
echo    mysql -u root -p banhang_game ^< database/update_new_games.sql
echo.
echo Nhan phim bat ky sau khi da chay SQL...
pause

echo.
echo [BUOC 3] Khoi dong server...
echo.
echo Server se chay tai: http://localhost:3000
echo Admin panel: http://localhost:3000/admin/login.html
echo.
echo Login admin:
echo   Email: admin@banhang.com
echo   Password: admin123
echo.
echo Nhan Ctrl+C de dung server
echo.

npm run dev
