@echo off
echo Restarting frontend dev server...
cd src\frontend
echo.
echo Please press Ctrl+C in the terminal running "npm run dev" first
echo Then run: npm run dev
echo.
echo Or kill the process manually:
taskkill /F /PID 16064
timeout /t 2
npm run dev
