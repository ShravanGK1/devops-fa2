@echo off
title Launch FinTech Microservices Stack via Docker Compose
echo ======================================================================
echo 🐳 STARTING FULL CONTAINERIZED STACK (MICROSERVICES + PROMETHEUS + GRAFANA)
echo ======================================================================
echo.
echo Make sure Docker Desktop is running before proceeding!
echo.

docker compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Docker is not running or failed to start.
    echo Please open Docker Desktop and try again, or run 'run_local.bat'.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ======================================================================
echo 🚀 ALL CONTAINERS ARE UP AND RUNNING!
echo.
echo 🌐 Open Dashboards in your browser:
echo • Web Portal & Chaos UI:    http://localhost:8080
echo • Grafana SRE Dashboards:   http://localhost:3000 (admin / admin)
echo • Prometheus Metrics:       http://localhost:9090
echo • Alertmanager:             http://localhost:9093
echo • Payment Gateway Docs:     http://localhost:8000/docs
echo • Fraud Engine Docs:        http://localhost:8001/docs
echo ======================================================================
echo.
start http://localhost:8080
start http://localhost:3000
pause
