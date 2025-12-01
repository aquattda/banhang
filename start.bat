@echo off
echo ============================================
echo   GAME SHOP - Quick Start Script
echo ============================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Checking .env file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please update .env with your database credentials!
    echo Press any key to continue after updating .env...
    pause
)

echo.
echo [3/4] Database Setup
echo Please make sure:
echo - MySQL is running
echo - Database 'banhang_game' is created
echo - Run: mysql -u root -p ^< database/schema.sql
echo.
echo Press any key when ready...
pause

echo.
echo [4/4] Starting server...
echo.
echo Server will start at http://localhost:3000
echo Admin panel: http://localhost:3000/admin/login.html
echo.
echo Default admin credentials:
echo Email: admin@banhang.com
echo Password: admin123
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak > nul

npm run dev
