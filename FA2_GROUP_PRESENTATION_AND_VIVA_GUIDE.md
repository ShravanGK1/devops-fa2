# 🎓 DevOps FA-2 Group Project & Viva Master Guide
## Project: Cloud-Native FinTech Microservices with CI/CD, Observability & Site Reliability Engineering (SRE)

---

## 📌 1. Project Overview & Syllabus Alignment

This project satisfies all requirements for **FA-2 DevOps & SRE** (covering **Unit 3: CI/CD Pipelines** and **Unit 4: Monitoring, Observability & Site Reliability Engineering**).

### Real-World Business Problem
High-throughput FinTech transaction systems require **sub-second latency**, **real-time fraud scoring**, **continuous automated delivery**, and **99.9% high availability**. System outages or latency spikes directly lead to financial loss and regulatory violations.

### Key Technical Pillars
1. **Microservices & Fault Tolerance**: Async REST APIs with Circuit Breakers & health probes.
2. **Automated CI/CD & DevSecOps**: Multi-stage GitHub Actions & Jenkins pipelines, automated PyTest suites, SAST vulnerability scanning, and containerized deployment.
3. **Observability & Alerting**: Prometheus RED (Rate, Errors, Duration) / USE metrics scraping, pre-provisioned Grafana dashboards, and Alertmanager incident rules.
4. **Site Reliability Engineering (SRE)**: Concrete SLI/SLO framework (99.9% availability, p95 < 200ms), real-time Error Budget Burn Rate tracking, and synthetic Chaos Engineering fault injection.

---

## 👥 2. Clear 4-Student Role Division & Deliverables

| Student ID / Role | Domain | Responsibilities | Key Code Files & Artifacts |
| :--- | :--- | :--- | :--- |
| **Student 1** | **Microservices, Containerization & Circuit Breaker** | • Payment Gateway API (`/api/v1/payments`)<br>• Fraud Detection Engine (`/api/v1/fraud/evaluate`)<br>• Docker multi-stage builds & compose orchestration<br>• Circuit breaker & graceful degradation | • `services/payment_service/app/main.py`<br>• `services/fraud_service/app/main.py`<br>• `services/payment_service/Dockerfile`<br>• `docker-compose.yml` |
| **Student 2** | **Continuous Integration, CD & DevSecOps** | • GitHub Actions workflow (`ci-cd.yml`)<br>• Jenkins pipeline (`Jenkinsfile`)<br>• Automated PyTest unit test execution<br>• DevSecOps SAST & secret scanner (`security_scan.py`)<br>• Automated post-deployment smoke tests (`smoke_test.py`) | • `.github/workflows/ci-cd.yml`<br>• `cicd/Jenkinsfile`<br>• `cicd/scripts/security_scan.py`<br>• `cicd/scripts/smoke_test.py` |
| **Student 3** | **Observability, Metrics & Alerting** | • Prometheus metrics instrumentation (`prometheus-client`)<br>• Scraping configurations & targets<br>• Alertmanager firing rules (High Error Rate, SLO Breaches)<br>• Grafana RED metrics & Golden Signals dashboard | • `services/payment_service/app/metrics.py`<br>• `monitoring/prometheus/prometheus.yml`<br>• `monitoring/prometheus/alert.rules.yml`<br>• `monitoring/grafana/dashboards/fintech_golden_signals.json` |
| **Student 4** | **Site Reliability Engineering (SRE) & Chaos Suite** | • Formal SLI/SLO definitions (99.9% Uptime, p95 < 200ms)<br>• Error Budget & Burn Rate calculation formulas<br>• SRE Error Budget Grafana Dashboard<br>• Chaos Fault Injector & Synthetic Load Simulator<br>• Automated SRE Compliance Audit reporter | • `monitoring/grafana/dashboards/sre_sli_slo_error_budget.json`<br>• `sre_chaos_suite/chaos_simulator.py`<br>• `sre_chaos_suite/traffic_generator.py`<br>• `sre_chaos_suite/slo_calculator.py` |

---

## 🎬 3. Step-by-Step Live Demonstration Script for Viva

When the faculty / evaluator asks you to demonstrate the project, follow this 4-step sequence:

### Step 1: Start the Entire Infrastructure (Student 1)
```powershell
docker compose up -d --build
```
- Open the **FinTech Portal**: [http://localhost:8080](http://localhost:8080)
- Explain the decoupled microservices (Payment Gateway on `:8000`, Fraud Engine on `:8001`).
- Trigger a single payment and explain the JSON response with risk score and latency.

### Step 2: Demonstrate CI/CD & DevSecOps (Student 2)
```powershell
# Run Unit Tests
$env:PYTHONPATH="."; python -m pytest services/payment_service/tests/ services/fraud_service/tests/ -v

# Run DevSecOps Security Scan
python cicd/scripts/security_scan.py

# Run Smoke Tests
python cicd/scripts/smoke_test.py
```
- Show the `.github/workflows/ci-cd.yml` stages: Linting -> PyTest -> SAST Security Audit -> Container Build -> Smoke Testing.

### Step 3: Show Prometheus, Metrics & Grafana Dashboards (Student 3)
- Open **Prometheus**: [http://localhost:9090/targets](http://localhost:9090/targets) (show active scrape endpoints).
- Open **Grafana**: [http://localhost:3000](http://localhost:3000) (Login: `admin` / `admin`).
- Show the **FinTech Microservices Golden Signals & RED Metrics** dashboard:
  - Request Rate (RPS)
  - Latency percentiles (p50, p90, p99)
  - Error rate %
  - Fraud risk histogram

### Step 4: Execute SRE Chaos Experiment & Error Budget Burn (Student 4)
- Run the synthetic background traffic:
```powershell
start python sre_chaos_suite/traffic_generator.py
```
- In the Web Portal ([http://localhost:8080](http://localhost:8080)) or via CLI, **inject Chaos** (400ms latency + 40% 500 error rate):
```powershell
python sre_chaos_suite/chaos_simulator.py --latency 400 --failure-rate 0.4 --duration 20
```
- Switch to Grafana **SRE Reliability & Error Budget Observatory**:
  - Show the **Availability SLI** dropping.
  - Show the **Error Budget Burn Rate** spiking above standard multiplier.
  - Show Alertmanager ([http://localhost:9093](http://localhost:9093)) firing `HighHttpErrorRate` and `PaymentLatencySLOBreached`.
- Generate the final SRE Audit Report:
```powershell
python sre_chaos_suite/slo_calculator.py
```

---

## ❓ 4. Viva Preparation: Questions & Model Answers

### Student 1 Questions (Architecture & Containers)
- **Q: Why did you separate Payment Gateway and Fraud Detection into two microservices?**
  - *Answer:* Separation of concerns. Payment processing requires rapid transaction dispatch, whereas fraud evaluation involves CPU-intensive risk scoring heuristics and database lookups. Decoupling them allows independent scaling and prevents fraud evaluation latency from locking payment database connections.
- **Q: What is a Circuit Breaker and why is it implemented?**
  - *Answer:* If the downstream Fraud Detection service crashes or becomes slow, the circuit breaker trips from `CLOSED` to `OPEN`. Rather than letting payment requests time out and crash the whole system, the gateway falls back to local safety heuristics to process urgent transactions gracefully.
- **Q: Why did you use multi-stage Docker builds?**
  - *Answer:* Multi-stage builds separate the build environment (compilers, pip caches) from the runtime environment. This produces ultra-lean container images (under 120MB), reduces attack surface, and speeds up deployment.

### Student 2 Questions (CI/CD & DevSecOps)
- **Q: What is the difference between Continuous Integration and Continuous Deployment?**
  - *Answer:* CI continuously merges developer code, runs automated linting, unit tests, and security scans on every commit. CD automatically builds deployable container artifacts and pushes them into staging/production environments once CI gates pass.
- **Q: What is DevSecOps and where is it integrated in your pipeline?**
  - *Answer:* DevSecOps shifts security left by testing for vulnerabilities during early CI stages rather than in production. We integrated SAST secret scanning (`security_scan.py`) and Trivy vulnerability auditing directly into the GitHub Actions pipeline before the Docker build step.
- **Q: What is the purpose of the post-deployment smoke test?**
  - *Answer:* It acts as a fast sanity verification in staging/production to confirm endpoints (`/health`, `/metrics`, `/api/v1/payments`) are responding correctly before routing real user traffic.

### Student 3 Questions (Monitoring & Observability)
- **Q: What are the RED and USE metrics in observability?**
  - *Answer:* **RED** stands for Rate (requests/sec), Errors (failed requests/sec), and Duration (latency distribution) for request-driven services. **USE** stands for Utilization, Saturation, and Errors for resource-driven components (CPU, memory, disks).
- **Q: How does Prometheus scrape metrics from your microservices?**
  - *Answer:* Prometheus uses a pull-based model. It periodically queries the `/metrics` HTTP endpoints exposed by our FastAPI microservices using the `prometheus-client` Python SDK at 5-second scrape intervals.
- **Q: What alerting rules did you configure in Prometheus?**
  - *Answer:* We configured rules for `HighHttpErrorRate` (>5% 5xx errors), `PaymentLatencySLOBreached` (p95 > 300ms), `FraudCircuitBreakerTripped`, and `ServiceDown`.

### Student 4 Questions (SRE, SLI/SLO & Chaos Engineering)
- **Q: What is the difference between an SLI, an SLO, and an SLA?**
  - *Answer:* 
    - **SLI (Service Level Indicator):** A quantifiable metric measuring service performance (e.g., current availability = 99.85%).
    - **SLO (Service Level Objective):** Internal reliability target set by the SRE team (e.g., 99.9% availability over 30 days).
    - **SLA (Service Level Agreement):** The business contract with customers specifying penalties if SLO is violated.
- **Q: What is an Error Budget and how is Burn Rate calculated?**
  - *Answer:* An Error Budget is the allowable margin of unreliability ($100\% - \text{SLO} = 0.1\%$). Burn Rate measures how fast the error budget is being consumed relative to normal speed. A burn rate of 14x means the entire 30-day budget will be depleted in ~48 hours.
- **Q: Why do we conduct Chaos Engineering experiments?**
  - *Answer:* Chaos engineering proactively injects controlled failures (network latency, server 500 crashes, downstream degradation) to validate whether monitoring alerts fire, circuit breakers trip, and the system self-heals before real production outages happen.
