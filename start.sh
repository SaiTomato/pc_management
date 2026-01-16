#!/bin/bash

echo "Starting PC Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Start backend
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "=========================================="
echo "PC Management System is starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo "=========================================="
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT TERM
wait
