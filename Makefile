.PHONY: help build up down test lint security chaos report

help:
	@echo "FinTech SRE & Microservices Platform Management Commands:"
	@echo "  make up         - Start all microservices, Prometheus, Grafana, Alertmanager"
	@echo "  make down       - Stop and remove all containers"
	@echo "  make test       - Run automated PyTest unit test suite"
	@echo "  make security   - Run DevSecOps SAST security and secret scanner"
	@echo "  make chaos      - Run SRE Chaos Fault Injection demo"
	@echo "  make report     - Generate SRE SLI/SLO Compliance Audit Report"

build:
	docker compose build

up:
	docker compose up -d
	@echo "All services online!"
	@echo "Frontend Portal:   http://localhost:8080"
	@echo "Payment Gateway:   http://localhost:8000"
	@echo "Fraud Service:     http://localhost:8001"
	@echo "Prometheus:        http://localhost:9090"
	@echo "Grafana (admin):   http://localhost:3000"
	@echo "Alertmanager:      http://localhost:9093"

down:
	docker compose down

test:
	pytest services/payment_service/tests/ services/fraud_service/tests/ -v

security:
	python cicd/scripts/security_scan.py

chaos:
	python sre_chaos_suite/chaos_simulator.py --latency 400 --failure-rate 0.35 --duration 20

report:
	python sre_chaos_suite/slo_calculator.py
