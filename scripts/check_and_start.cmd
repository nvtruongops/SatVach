@echo off
echo ========================================
echo Kiem tra va khoi dong SatVach
echo ========================================
echo.

REM Kiem tra Docker Desktop
echo [1/4] Kiem tra Docker Desktop...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop khong chay!
    echo.
    echo Vui long:
    echo 1. Mo Docker Desktop
    echo 2. Doi Docker Desktop khoi dong xong
    echo 3. Chay lai script nay
    pause
    exit /b 1
)
echo [OK] Docker Desktop dang chay

echo.
echo [2/4] Dung cac container cu (neu co)...
docker-compose down

echo.
echo [3/4] Khoi dong cac services...
docker-compose up -d

echo.
echo [4/4] Cho cac services khoi dong...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Kiem tra trang thai services:
echo ========================================
docker-compose ps

echo.
echo ========================================
echo Kiem tra logs (5 giay cuoi):
echo ========================================
docker-compose logs --tail=20

echo.
echo ========================================
echo Cac URL quan trong:
echo ========================================
echo - Frontend:  http://localhost
echo - Backend:   http://localhost:8000
echo - API Docs:  http://localhost:8000/docs
echo - MinIO:     http://localhost:9001
echo - Database:  localhost:5432
echo ========================================
echo.
echo Nhan phim bat ky de dong...
pause >nul
