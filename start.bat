@echo off
echo Starting Survey Paper Classification System...
echo.
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..
echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python main.py"
echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul
echo.
echo Starting frontend...
npm run dev

