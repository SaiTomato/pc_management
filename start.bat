@echo off
echo Starting PC Management System...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Start Docker containers
echo Starting Docker containers...
docker-compose up -d

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul

REM Start backend
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo ==========================================
echo PC Management System is starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ==========================================
echo Press any key to stop Docker containers...
pause >nul

docker-compose down
