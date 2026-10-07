# 💳 FinTech Microservices Observability & SRE Reliability Platform
### DevOps FA-2 Group Project (4-Member Team Architecture)

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20%26%20Jenkins-blue)](./cicd/)
[![Observability](https://img.shields.io/badge/Observability-Prometheus%20%26%20Grafana-orange)](./monitoring/)
[![SRE](https://img.shields.io/badge/SRE-SLI%2FSLO%20%26%20Error%20Budget-green)](./sre_chaos_suite/)
[![Containers](https://img.shields.io/badge/Docker-Multi--Stage%20Builds-informational)](./docker-compose.yml)

---

## 📖 Quick Navigation
- 👥 **[FA-2 Group Roles & Viva Guide](./FA2_GROUP_PRESENTATION_AND_VIVA_GUIDE.md)** (Full 4-Student Breakdown, Presentation Script & Viva Q&A)
- 🏛️ **[System Architecture & SRE Mathematical Model](./ARCHITECTURE.md)**

---

## ⚡ Quick Start (Run Locally with Docker Compose)

### 1. Launch the Full Microservices & Observability Stack
```bash
docker compose up -d --build
```

### 2. Access the Live Dashboards & Endpoints
| Interface | URL | Credentials / Notes |
| :--- | :--- | :--- |
| **FinTech SRE & Payment Portal** | [http://localhost:8080](http://localhost:8080) | Interactive GUI for payments & chaos injection |
| **Payment Gateway API (FastAPI)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for Payment Gateway |
| **Fraud Detection Engine API** | [http://localhost:8001/docs](http://localhost:8001/docs) | Swagger UI for Fraud Engine |
| **Prometheus Metrics Engine** | [http://localhost:9090](http://localhost:9090) | Scrape metrics & raw PromQL queries |
| **Grafana Dashboards** | [http://localhost:3000](http://localhost:3000) | User: `admin` / Password: `admin` |
| **Alertmanager** | [http://localhost:9093](http://localhost:9093) | SRE Alert routing & incident triage |

---

## 🧪 Testing & Execution Commands

### 1. Run Automated Unit Tests (Student 2)
```powershell
$env:PYTHONPATH="."; python -m pytest services/payment_service/tests/ services/fraud_service/tests/ -v
```

### 2. Run DevSecOps SAST Security & Secret Scan (Student 2)
```powershell
python cicd/scripts/security_scan.py
```

### 3. Run Post-Deployment Smoke Test (Student 2)
```powershell
python cicd/scripts/smoke_test.py
```

### 4. Continuous Traffic Generator (Student 4)
```powershell
python sre_chaos_suite/traffic_generator.py --concurrency 3 --delay 0.4
```

### 5. SRE Chaos Experiment & Error Budget Burn (Student 4)
```powershell
python sre_chaos_suite/chaos_simulator.py --latency 450 --failure-rate 0.4 --duration 20
```

### 6. Generate SRE SLI/SLO Compliance Audit Report (Student 4)
```powershell
python sre_chaos_suite/slo_calculator.py
```

---

## 📂 Repository Structure

```
dopsfa-2/
├── services/
│   ├── payment_service/         # Student 1: Payment Gateway API (FastAPI, RED metrics, Circuit Breaker)
│   ├── fraud_service/           # Student 1: Real-time Fraud Detection & Risk Scoring API
│   └── frontend_portal/         # Student 1 & 4: Modern Web Portal & SRE Control Console
├── cicd/
│   ├── .github/workflows/       # Student 2: GitHub Actions multi-stage CI/CD workflow
│   ├── Jenkinsfile              # Student 2: Jenkins Declarative Pipeline script
│   └── scripts/                 # Student 2: DevSecOps scanner & post-deployment smoke tests
├── monitoring/
│   ├── prometheus/              # Student 3: Scrape configuration & SRE Alerting rules
│   ├── alertmanager/            # Student 3: Alert routing & notification rules
│   └── grafana/                 # Student 3 & 4: Pre-provisioned Golden Signals & SRE dashboards
├── sre_chaos_suite/             # Student 4: Chaos injector, load generator, SLO calculator
├── docker-compose.yml           # Unified multi-container composition
├── Makefile                     # Quick command shortcuts
├── ARCHITECTURE.md              # System design & SRE mathematical formulas
├── FA2_GROUP_PRESENTATION_AND_VIVA_GUIDE.md # 4-Student presentation script & Viva answers
└── README.md
```
