@echo off
title FinTech SRE Chaos & Incident Response Demo
echo ======================================================================
echo 🚀 SRE RELIABILITY & CHAOS INJECTION DEMO FOR FA-2 EVALUATION
echo ======================================================================
echo.
echo 1. Starting rapid background traffic generator (20 seconds)...
start /B python sre_chaos_suite\traffic_generator.py --runtime 30

timeout /t 3 >nul

echo.
echo 2. Injecting Chaos Faults (Latency + 40%% Error Spike)...
python sre_chaos_suite\chaos_simulator.py --latency 500 --failure-rate 0.4 --duration 15

echo.
echo 3. Generating Live SRE SLI/SLO Compliance Audit Report...
python sre_chaos_suite\slo_calculator.py

echo.
echo ======================================================================
echo Demo Finished. Check Grafana (http://localhost:3000) for visual curves!
echo ======================================================================
pause
