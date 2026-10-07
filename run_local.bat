@echo off
title Launch FinTech Microservices & React UI
echo ======================================================================
echo 🚀 STARTING FINTECH MICROSERVICES & REACT SRE PORTAL
echo ======================================================================
echo.

echo 1. Starting Fraud Detection Engine on port 8001...
start "Fraud Engine (Port 8001)" /min python -m uvicorn services.fraud_service.app.main:app --host 0.0.0.0 --port 8001

timeout /t 2 >nul

echo 2. Starting Payment Gateway Service on port 8000...
set FRAUD_SERVICE_URL=http://localhost:8001
start "Payment Gateway (Port 8000)" /min python -m uvicorn services.payment_service.app.main:app --host 0.0.0.0 --port 8000

timeout /t 2 >nul

echo 3. Starting React 18 / Vite Frontend Server on port 5173...
cd frontend
start "React Dev Server (Port 5173)" /min npm run dev -- --host 0.0.0.0 --port 5173
cd ..

timeout /t 3 >nul

echo 4. Launching React Application in your browser...
start http://localhost:5173
start http://localhost:8000/docs
start http://localhost:8001/docs

echo.
echo ======================================================================
echo ✅ All services and React Dashboard are running!
echo • React Web Application:   http://localhost:5173
echo • Payment Gateway API:     http://localhost:8000/docs
echo • Fraud Detection API:     http://localhost:8001/docs
echo • Prometheus Metrics:      http://localhost:8000/metrics
echo ======================================================================
pause
