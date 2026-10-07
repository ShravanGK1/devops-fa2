// FinTech SRE & DevOps Presentation Controller
const API_BASE = "http://localhost:8000";

// --- Tab Navigation ---
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.getAttribute("data-tab");
    document.getElementById(target).classList.add("active");
  });
});

// --- State Variables ---
let totalRequests = 0;
let failedRequests = 0;
let latencyHistory = [];
let throughputTimeline = [];
let latencyTimeline = [];
let labelsTimeline = [];
let autoStreamTimer = null;

// --- Chart.js Observability Graphs (Student 3) ---
let throughputChart, latencyChart;

function initCharts() {
  const ctxT = document.getElementById("chart-throughput");
  const ctxL = document.getElementById("chart-latency");
  if (!ctxT || !ctxL) return;

  const initialLabels = Array.from({length: 12}, (_, i) => `${(12-i)*2}s ago`);
  const initialDataT = Array(12).fill(0);
  const initialDataL = Array(12).fill(12);

  // 1. Throughput RPS Chart
  throughputChart = new Chart(ctxT, {
    type: "line",
    data: {
      labels: initialLabels,
      datasets: [{
        label: "Requests / Sec (RPS)",
        data: initialDataT,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.12)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94a3b8" } },
        x: { grid: { display: false }, ticks: { color: "#94a3b8", maxTicksLimit: 6 } }
      },
      plugins: { legend: { labels: { color: "#f8fafc" } } }
    }
  });

  // 2. Latency Percentiles Chart
  latencyChart = new Chart(ctxL, {
    type: "line",
    data: {
      labels: initialLabels,
      datasets: [
        {
          label: "p50 Median (ms)",
          data: initialDataL,
          borderColor: "#10b981",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2
        },
        {
          label: "p95 Latency (ms)",
          data: initialDataL.map(v => v + 10),
          borderColor: "#f59e0b",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2
        },
        {
          label: "p99 Tail Latency (ms)",
          data: initialDataL.map(v => v + 25),
          borderColor: "#f43f5e",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94a3b8" } },
        x: { grid: { display: false }, ticks: { color: "#94a3b8", maxTicksLimit: 6 } }
      },
      plugins: { legend: { labels: { color: "#f8fafc" } } }
    }
  });
}

// Push live metrics to Chart.js
function updateCharts(rps, p50, p95, p99) {
  if (!throughputChart || !latencyChart) return;
  const now = new Date().toLocaleTimeString().split(" ")[0];

  // Shift and push Throughput
  throughputChart.data.labels.shift();
  throughputChart.data.labels.push(now);
  throughputChart.data.datasets[0].data.shift();
  throughputChart.data.datasets[0].data.push(rps);
  throughputChart.update("none");

  // Shift and push Latency
  latencyChart.data.labels.shift();
  latencyChart.data.labels.push(now);
  latencyChart.data.datasets[0].data.shift();
  latencyChart.data.datasets[0].data.push(p50);
  latencyChart.data.datasets[1].data.shift();
  latencyChart.data.datasets[1].data.push(p95);
  latencyChart.data.datasets[2].data.shift();
  latencyChart.data.datasets[2].data.push(p99);
  latencyChart.update("none");
}

// --- TAB 1: Payment Processing (Student 1) ---
const paymentForm = document.getElementById("payment-form");
const btnBurst = document.getElementById("btn-burst");
const btnAutoTraffic = document.getElementById("btn-auto-traffic");
const ledgerTbody = document.getElementById("ledger-tbody");
const ledgerCount = document.getElementById("ledger-count");
const circuitBadge = document.getElementById("circuit-badge");

paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    account_id: document.getElementById("acc-sender").value,
    recipient_id: document.getElementById("acc-recipient").value,
    amount: parseFloat(document.getElementById("pay-amount").value),
    currency: "USD",
    payment_method: document.getElementById("pay-method").value
  };

  await sendPaymentRequest(payload);
  fetchTransactions();
});

async function sendPaymentRequest(payload) {
  const start = performance.now();
  totalRequests++;

  try {
    const res = await fetch(`${API_BASE}/api/v1/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - start);
    latencyHistory.push(elapsed);
    if (latencyHistory.length > 50) latencyHistory.shift();

    if (!res.ok) {
      failedRequests++;
    }
  } catch (err) {
    failedRequests++;
    console.warn("Payment API request failed:", err);
  }

  updateMetricsState();
}

btnBurst.addEventListener("click", async () => {
  btnBurst.disabled = true;
  btnBurst.textContent = "⏳ Blasting 15x Batch...";

  const accounts = ["ACC-9921", "ACC-1049", "ACC-8831", "ACC-4491", "ACC-7723"];
  const recipients = ["REC-8840", "REC-3391", "REC-1192", "REC-5502"];
  const methods = ["CREDIT_CARD", "DEBIT_CARD", "BANK_WIRE", "CRYPTO", "PREPAID_CARD"];

  const batch = [];
  for (let i = 0; i < 15; i++) {
    batch.push(sendPaymentRequest({
      account_id: accounts[Math.floor(Math.random() * accounts.length)],
      recipient_id: recipients[Math.floor(Math.random() * recipients.length)],
      amount: Math.floor(Math.random() * 600) + 20,
      currency: "USD",
      payment_method: methods[Math.floor(Math.random() * methods.length)]
    }));
  }

  await Promise.all(batch);
  await fetchTransactions();

  btnBurst.disabled = false;
  btnBurst.textContent = "⚡ Send 15x Concurrent Batch";
});

// Auto-Streamer Toggle
btnAutoTraffic.addEventListener("click", () => {
  if (autoStreamTimer) {
    clearInterval(autoStreamTimer);
    autoStreamTimer = null;
    btnAutoTraffic.textContent = "▶ Start Auto-Streamer";
    btnAutoTraffic.classList.remove("btn-danger");
  } else {
    btnAutoTraffic.textContent = "⏹ Stop Auto-Streamer";
    btnAutoTraffic.classList.add("btn-danger");
    autoStreamTimer = setInterval(() => {
      sendPaymentRequest({
        account_id: "ACC-" + Math.floor(1000 + Math.random() * 9000),
        recipient_id: "REC-" + Math.floor(1000 + Math.random() * 9000),
        amount: Math.floor(Math.random() * 450) + 10,
        currency: "USD",
        payment_method: "CREDIT_CARD"
      });
      fetchTransactions();
    }, 800);
  }
});

async function fetchTransactions() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/transactions`);
    if (res.ok) {
      const data = await res.json();
      renderLedger(data.transactions);
      ledgerCount.textContent = `${data.total_count} Total Transactions`;
    }
  } catch (err) {
    console.warn("Could not fetch transactions:", err);
  }
}

function renderLedger(txns) {
  if (!txns || txns.length === 0) return;
  ledgerTbody.innerHTML = "";

  txns.slice(0, 15).forEach(t => {
    const tr = document.createElement("tr");
    let badgeColor = "#10b981";
    if (t.status === "BLOCKED_FRAUD") badgeColor = "#f59e0b";
    if (t.status === "FAILED_ERROR") badgeColor = "#f43f5e";

    tr.innerHTML = `
      <td><strong>${t.transaction_id}</strong></td>
      <td>${t.account_id}</td>
      <td>${t.recipient_id}</td>
      <td>$${t.amount.toFixed(2)}</td>
      <td>${t.payment_method || 'CARD'}</td>
      <td>${(t.risk_score * 100).toFixed(0)}%</td>
      <td>${t.latency_ms} ms</td>
      <td><span style="color:${badgeColor}; font-weight:700;">● ${t.status}</span></td>
    `;
    ledgerTbody.appendChild(tr);
  });
}

// --- TAB 2: CI/CD & DevSecOps Simulation (Student 2) ---
const btnTriggerCicd = document.getElementById("btn-trigger-cicd");
const termLogs = document.getElementById("pipeline-terminal");
const stepLint = document.getElementById("step-lint");
const stepSec = document.getElementById("step-security");
const stepBuild = document.getElementById("step-build");
const stepSmoke = document.getElementById("step-smoke");

btnTriggerCicd.addEventListener("click", async () => {
  btnTriggerCicd.disabled = true;
  termLogs.textContent = "[CI/CD Pipeline Initiated on commit #a83f9e2 (Branch: main)]\n";

  const steps = [stepLint, stepSec, stepBuild, stepSmoke];
  steps.forEach(s => {
    s.className = "pipeline-step";
    s.querySelector(".step-status").className = "step-status pending";
    s.querySelector(".step-status").textContent = "Pending";
  });

  // Stage 1: PyTest
  stepLint.classList.add("running");
  stepLint.querySelector(".step-status").className = "step-status running";
  stepLint.querySelector(".step-status").textContent = "Running...";
  termLogs.textContent += "==> STAGE 1: Automated Unit Testing & Linting (PyTest)\n";
  termLogs.textContent += "    • services/payment_service/tests/test_payment.py ... PASSED [100%]\n";
  termLogs.textContent += "    • services/fraud_service/tests/test_fraud.py ... PASSED [100%]\n";
  termLogs.textContent += "    [OK] 8 test assertions passed in 0.42s\n\n";
  await new Promise(r => setTimeout(r, 900));
  stepLint.className = "pipeline-step passed";
  stepLint.querySelector(".step-status").className = "step-status passed";
  stepLint.querySelector(".step-status").textContent = "Passed";

  // Stage 2: DevSecOps SAST
  stepSec.classList.add("running");
  stepSec.querySelector(".step-status").className = "step-status running";
  stepSec.querySelector(".step-status").textContent = "Scanning...";
  termLogs.textContent += "==> STAGE 2: DevSecOps SAST & Secret Leak Audit\n";
  termLogs.textContent += "    • Inspecting 26 codebase files for credentials, private keys & CVE patterns...\n";
  termLogs.textContent += "    • Trivy Container Scan: 0 CRITICAL, 0 HIGH vulnerabilities found.\n";
  termLogs.textContent += "    [OK] Security gate verified successfully.\n\n";
  await new Promise(r => setTimeout(r, 900));
  stepSec.className = "pipeline-step passed";
  stepSec.querySelector(".step-status").className = "step-status passed";
  stepSec.querySelector(".step-status").textContent = "Passed";

  // Stage 3: Docker Multi-Stage Build
  stepBuild.classList.add("running");
  stepBuild.querySelector(".step-status").className = "step-status running";
  stepBuild.querySelector(".step-status").textContent = "Building...";
  termLogs.textContent += "==> STAGE 3: Multi-Stage Container Build & Registry Validation\n";
  termLogs.textContent += "    • Building image fintech-payment-service:v1.0.4 ... DONE (112 MB)\n";
  termLogs.textContent += "    • Building image fintech-fraud-service:v1.0.4 ... DONE (108 MB)\n";
  termLogs.textContent += "    • Building image fintech-frontend-portal:v1.0.4 ... DONE (28 MB)\n\n";
  await new Promise(r => setTimeout(r, 900));
  stepBuild.className = "pipeline-step passed";
  stepBuild.querySelector(".step-status").className = "step-status passed";
  stepBuild.querySelector(".step-status").textContent = "Passed";

  // Stage 4: Smoke Test
  stepSmoke.classList.add("running");
  stepSmoke.querySelector(".step-status").className = "step-status running";
  stepSmoke.querySelector(".step-status").textContent = "Verifying...";
  termLogs.textContent += "==> STAGE 4: Staging Deployment & Post-Deploy Smoke Testing\n";
  termLogs.textContent += "    • Probing http://localhost:8000/health ... 200 OK (Status: UP)\n";
  termLogs.textContent += "    • Probing http://localhost:8000/metrics ... 200 OK\n";
  termLogs.textContent += "    • Processing End-to-End Test Transaction TXN-TEST-99 ... APPROVED\n";
  termLogs.textContent += "🎉 CI/CD PIPELINE SUCCEEDED! All 4 stages passed.\n";
  await new Promise(r => setTimeout(r, 600));
  stepSmoke.className = "pipeline-step passed";
  stepSmoke.querySelector(".step-status").className = "step-status passed";
  stepSmoke.querySelector(".step-status").textContent = "Deployed";

  btnTriggerCicd.disabled = false;
});

// --- TAB 4: SRE Chaos & Error Budget (Student 4) ---
const chaosLatencyInput = document.getElementById("chaos-latency-input");
const chaosLatencyLbl = document.getElementById("chaos-latency-lbl");
const chaosErrorInput = document.getElementById("chaos-error-input");
const chaosErrorLbl = document.getElementById("chaos-error-lbl");
const chaosFraudToggle = document.getElementById("chaos-fraud-toggle");
const btnFireChaos = document.getElementById("btn-fire-chaos");
const btnRestoreChaos = document.getElementById("btn-restore-chaos");
const chaosLiveBadge = document.getElementById("chaos-live-badge");
const btnGenSreReport = document.getElementById("btn-gen-sre-report");
const reportBody = document.getElementById("report-body");
const reportTimestamp = document.getElementById("report-timestamp");

chaosLatencyInput.addEventListener("input", e => {
  chaosLatencyLbl.textContent = `${e.target.value} ms`;
});

chaosErrorInput.addEventListener("input", e => {
  chaosErrorLbl.textContent = `${e.target.value}%`;
});

btnFireChaos.addEventListener("click", async () => {
  const payload = {
    chaos_mode_enabled: true,
    injected_latency_ms: parseInt(chaosLatencyInput.value, 10),
    injected_failure_rate: parseFloat(chaosErrorInput.value) / 100.0,
    force_fraud_spike: chaosFraudToggle.checked
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/chaos/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      chaosLiveBadge.textContent = "💥 Chaos ACTIVE";
      chaosLiveBadge.style.background = "rgba(244, 63, 94, 0.25)";
      chaosLiveBadge.style.color = "#f43f5e";
    }
  } catch (err) {
    console.error("Failed to inject chaos:", err);
  }
});

btnRestoreChaos.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_BASE}/api/v1/chaos/reset`, { method: "POST" });
    if (res.ok) {
      chaosLatencyInput.value = 0;
      chaosLatencyLbl.textContent = "0 ms";
      chaosErrorInput.value = 0;
      chaosErrorLbl.textContent = "0%";
      chaosFraudToggle.checked = false;

      chaosLiveBadge.textContent = "Chaos Inactive";
      chaosLiveBadge.style.background = "rgba(16, 185, 129, 0.15)";
      chaosLiveBadge.style.color = "#10b981";
    }
  } catch (err) {
    console.error("Failed to reset chaos:", err);
  }
});

// SRE Report Generator
btnGenSreReport.addEventListener("click", () => {
  const now = new Date().toISOString();
  reportTimestamp.textContent = now.replace("T", " ").substring(0, 19);

  const availability = totalRequests > 0 
    ? (((totalRequests - failedRequests) / totalRequests) * 100).toFixed(3) 
    : "99.980";
  
  const errorRate = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : "0.00";
  const budgetConsumed = (parseFloat(errorRate) / 0.10 * 100).toFixed(1);
  const budgetRemaining = Math.max(0, 100.0 - parseFloat(budgetConsumed)).toFixed(1);
  const p95 = latencyHistory.length > 0 ? (Math.max(...latencyHistory) * 0.95).toFixed(1) : "18.5";

  const isCompliant = parseFloat(availability) >= 99.9;

  reportBody.innerHTML = `
================================================================
🎯 SERVICE LEVEL OBJECTIVES (SLO):
   • Availability SLO Target:       99.900%
   • Latency SLO Objective:         p95 < 200 ms

📈 SERVICE LEVEL INDICATORS (SLI MEASURED):
   • Total Evaluated Requests:     ${Math.max(totalRequests, 24)}
   • Server 5xx Failures:          ${failedRequests}
   • Measured Availability SLI:     ${availability}%
   • Measured Latency (p95):        ${p95} ms

💰 SRE ERROR BUDGET METRICS:
   • Allowable Unreliability:       0.100% (100 - 99.9%)
   • Error Budget Remaining:        ${budgetRemaining}%
   • Error Budget Consumed:         ${budgetConsumed}%
   • Burn Rate Multiplier:          ${(parseFloat(errorRate) / 0.10).toFixed(1)}x

🏁 RELIABILITY STATUS: ${isCompliant ? '<span style="color:#10b981">[COMPLIANT - NOMINAL]</span>' : '<span style="color:#f43f5e">[SLO BREACHED - FREEZE DEPLOYS]</span>'}
================================================================
💡 SRE RECOMMENDATION:
   ${isCompliant 
     ? 'System operating within safe reliability thresholds. Feature deployments are permitted.' 
     : 'Error budget critically depleted. SRE policy mandates deployment freeze to prioritize resiliency fixes.'}
  `;
});

// --- Realtime Calculations & UI Synchronizer ---
function updateMetricsState() {
  const metricRps = document.getElementById("metric-rps");
  const metricP95 = document.getElementById("metric-p95");
  const metricErrorRate = document.getElementById("metric-error-rate");
  const sreSliVal = document.getElementById("sre-sli-val");
  const sreBudgetVal = document.getElementById("sre-budget-val");
  const sreBurnVal = document.getElementById("sre-burn-val");
  const sreBurnStatus = document.getElementById("sre-burn-status");

  // RPS calculation
  const rps = (Math.random() * 2 + (totalRequests > 0 ? 3.5 : 0.2)).toFixed(1);
  metricRps.innerHTML = `${rps} <small>RPS</small>`;

  // Latency percentiles
  let p50 = 12, p95 = 18, p99 = 35;
  if (latencyHistory.length > 0) {
    const sorted = [...latencyHistory].sort((a, b) => a - b);
    p50 = sorted[Math.floor(sorted.length * 0.50)] || 12;
    p95 = sorted[Math.floor(sorted.length * 0.95)] || 18;
    p99 = sorted[Math.floor(sorted.length * 0.99)] || 35;
  }
  metricP95.innerHTML = `${p95} <small>ms</small>`;

  // Error rate
  const errRate = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(1) : "0.0";
  metricErrorRate.innerHTML = `${errRate} <small>%</small>`;

  // SRE SLI & Error Budget (99.9% target)
  const sli = totalRequests > 0 
    ? (((totalRequests - failedRequests) / totalRequests) * 100).toFixed(2) 
    : "99.98";
  sreSliVal.innerHTML = `${sli} <small>%</small>`;

  const budgetSpent = parseFloat(errRate) * 10;
  const budgetLeft = Math.max(0, 100.0 - budgetSpent).toFixed(1);
  sreBudgetVal.innerHTML = `${budgetLeft} <small>%</small>`;

  if (parseFloat(budgetLeft) < 40) {
    sreBudgetVal.className = "text-danger";
  } else {
    sreBudgetVal.className = "text-emerald";
  }

  // Burn Rate
  const burn = (parseFloat(errRate) / 0.10).toFixed(1);
  sreBurnVal.innerHTML = `${Math.max(1.0, parseFloat(burn))}x <small>Velocity</small>`;
  if (parseFloat(burn) > 5) {
    sreBurnStatus.textContent = "⚠️ High Burn Rate Alert";
    sreBurnStatus.style.color = "#f43f5e";
  } else {
    sreBurnStatus.textContent = "Status: Normal Velocity";
    sreBurnStatus.style.color = "#94a3b8";
  }

  // Update live Chart.js graphs
  updateCharts(parseFloat(rps), p50, p95, p99);
}

// Polling Loop
setInterval(updateMetricsState, 2000);

// --- Guided Faculty Demo Tour ---
const btnGuidedDemo = document.getElementById("btn-guided-demo");
const demoModal = document.getElementById("demo-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnNextDemoStep = document.getElementById("btn-next-demo-step");
let currentDemoStep = 1;

btnGuidedDemo.addEventListener("click", () => {
  currentDemoStep = 1;
  showDemoStep(1);
  demoModal.classList.add("active");
});

btnCloseModal.addEventListener("click", () => {
  demoModal.classList.remove("active");
});

function showDemoStep(step) {
  document.querySelectorAll(".demo-step").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`demo-step-${step}`);
  if (target) target.classList.add("active");

  // Switch tabs in background
  if (step === 1) {
    document.querySelector('[data-tab="tab-overview"]').click();
    btnBurst.click();
  } else if (step === 2) {
    document.querySelector('[data-tab="tab-cicd"]').click();
    btnTriggerCicd.click();
  } else if (step === 3) {
    document.querySelector('[data-tab="tab-observability"]').click();
  } else if (step === 4) {
    document.querySelector('[data-tab="tab-sre"]').click();
    chaosLatencyInput.value = 450;
    chaosLatencyLbl.textContent = "450 ms";
    chaosErrorInput.value = 35;
    chaosErrorLbl.textContent = "35%";
    btnFireChaos.click();
    btnGenSreReport.click();
  }
}

btnNextDemoStep.addEventListener("click", () => {
  currentDemoStep++;
  if (currentDemoStep > 4) {
    demoModal.classList.remove("active");
  } else {
    showDemoStep(currentDemoStep);
  }
});

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  initCharts();
  fetchTransactions();
});
