# 🏛️ FinTech Microservices & SRE Observability Architecture

## System Architecture Diagram

```
                              [ HTTP Clients / Browsers ]
                                          |
                                          v
                         +---------------------------------+
                         |   Frontend Portal & SRE Console |
                         |           (Port 8080)           |
                         +---------------------------------+
                                          |
                                          v
                         +---------------------------------+
                         |     Payment Gateway Service     | <----+ (SRE Chaos Injection)
                         |           (Port 8000)           |
                         +---------------------------------+
                                          |
                        (HTTP / Circuit Breaker Protected)
                                          |
                                          v
                         +---------------------------------+
                         |     Fraud Detection Engine      |
                         |           (Port 8001)           |
                         +---------------------------------+

       ====================== OBSERVABILITY & SRE TIER ======================

     +-----------------------+              +----------------------+
     |   Prometheus Scraper  | ------------>|  Grafana Dashboards  | (Port 3000)
     |      (Port 9090)      |              |  - RED Golden Signals|
     +-----------------------+              |  - SRE Error Budget  |
                 |                          +----------------------+
                 v
     +-----------------------+
     |     Alertmanager      | (Port 9093)
     | - High Error Rate     |
     | - SRE SLO Breaches    |
     +-----------------------+
```

---

## 👥 4-Student Module Division

| Student | Assigned DevOps Domain | Core Responsibilities & Artifacts |
| :--- | :--- | :--- |
| **Student 1** | **Microservices & Containerization** | Payment Gateway (`/api/v1/payments`), Fraud Engine (`/api/v1/fraud/evaluate`), Multi-stage `Dockerfile`s, Service orchestration (`docker-compose.yml`), Circuit Breaker pattern. |
| **Student 2** | **CI/CD Pipeline & DevSecOps** | GitHub Actions (`.github/workflows/ci-cd.yml`), Jenkins Pipeline (`Jenkinsfile`), Automated PyTest testing, Static Security Scanner (`security_scan.py`), Smoke tests (`smoke_test.py`). |
| **Student 3** | **Observability & Monitoring** | Prometheus metrics instrumentation (`prometheus-client`), Custom RED/USE metrics, Scrape config (`prometheus.yml`), Alerting rules (`alert.rules.yml`), Grafana Golden Signals Dashboard. |
| **Student 4** | **SRE, SLI/SLO & Chaos Engineering** | Availability SLI (99.9%), Error Budget Burn Rate formulas, SRE Dashboard (`sre_sli_slo_error_budget.json`), Chaos fault injector (`chaos_simulator.py`), SRE compliance reporter (`slo_calculator.py`). |

---

## 📈 SRE Reliability Framework (Unit 4)

### 1. Service Level Indicators (SLIs)
- **Availability SLI**:
  $$\text{Availability \%} = \left( \frac{\text{Total HTTP Requests} - \text{HTTP 5xx Server Errors}}{\text{Total HTTP Requests}} \right) \times 100$$
- **Latency SLI**:
  $$\text{p95 Latency} \le 200\text{ ms (measured via Prometheus histogram quantile)}$$

### 2. Service Level Objective (SLO)
- **Target**: **99.9%** availability over a rolling evaluation window.

### 3. Error Budget & Burn Rate
- **Allowed Unreliability Budget**:
  $$\text{Error Budget} = 100\% - 99.9\% = 0.1\%$$
- **Burn Rate Multiplier**:
  $$\text{Burn Rate} = \frac{\text{Observed Error Rate}}{\text{Allowed Error Rate (0.001)}}$$
  - **Burn Rate = 1x**: Standard rate; budget will last exactly the 30-day window.
  - **Burn Rate > 14x**: High emergency; 100% of error budget burned within 48 hours. Triggers Critical Alertmanager notification.
