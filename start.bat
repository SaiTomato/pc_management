@echo off
echo Starting PC Management System (Fully Dockerized)...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Start all services
echo Starting all services...
docker-compose up -d

echo ==========================================
echo PC Management System is starting...
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo Keycloak: http://localhost:8080
echo ==========================================
echo Logs are running in the background.
echo Use "docker-compose logs -f" to see logs.
echo Press any key to stop all containers...
pause >nul

docker-compose down
