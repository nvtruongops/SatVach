@echo off
echo ========================================
echo Trang thai he thong SatVach
echo ========================================
echo.

REM Kiem tra Docker
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker Desktop: KHONG CHAY
    echo.
    goto :end
) else (
    echo [OK] Docker Desktop: DANG CHAY
)

echo.
echo ========================================
echo Trang thai containers:
echo ========================================
docker-compose ps

echo.
echo ========================================
echo Kiem tra ket noi:
echo ========================================

REM Kiem tra Backend
curl -s http://localhost:8000/docs >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API: http://localhost:8000
) else (
    echo [X] Backend API: KHONG KET NOI DUOC
)

REM Kiem tra Frontend
curl -s http://localhost >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend: http://localhost
) else (
    echo [X] Frontend: KHONG KET NOI DUOC
)

REM Kiem tra MinIO
curl -s http://localhost:9001 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MinIO Console: http://localhost:9001
) else (
    echo [X] MinIO Console: KHONG KET NOI DUOC
)

echo.
echo ========================================
echo Logs gan day (20 dong cuoi):
echo ========================================
docker-compose logs --tail=20 backend

:end
echo.
echo ========================================
pause
