#!/bin/bash
echo "Starting Survey Paper Classification System..."
echo
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..
echo
echo "Starting backend server..."
cd backend && python main.py &
BACKEND_PID=$!
cd ..
echo
echo "Waiting for backend to start..."
sleep 5
echo
echo "Starting frontend..."
npm run dev

