import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentTabs from './components/StudentTabs';
import TabPayments from './components/TabPayments';
import TabCicd from './components/TabCicd';
import TabObservability from './components/TabObservability';
import TabSreChaos from './components/TabSreChaos';
import GuidedDemoModal from './components/GuidedDemoModal';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('tab-overview');
  const [theme, setTheme] = useState('light');
  const [transactions, setTransactions] = useState([]);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [isChaosActive, setIsChaosActive] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // Sync theme with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Observability & SRE state
  const [metrics, setMetrics] = useState({ rps: '0.0', p95: '12.4', errorRate: '0.0' });
  const [sreStats, setSreStats] = useState({
    availability: '99.980',
    budgetRemaining: '100.0',
    budgetConsumed: '0.0',
    burnRate: '1.0',
    totalReq: 0,
    failedReq: 0
  });

  // Chart timeline history
  const [chartLabels, setChartLabels] = useState(Array.from({ length: 10 }, (_, i) => `${(10 - i) * 2}s ago`));
  const [throughputHistory, setThroughputHistory] = useState(Array(10).fill(0));
  const [latencyHistory, setLatencyHistory] = useState({
    p50: Array(10).fill(12),
    p95: Array(10).fill(18),
    p99: Array(10).fill(28)
  });

  // Track raw response stats
  const [rawStats, setRawStats] = useState({ total: 0, failed: 0, latencies: [] });

  // 1. Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.warn('Payment API offline:', err);
    }
  };

  // 2. Send single payment
  const handleSendPayment = async (payload) => {
    const start = performance.now();
    let resultData = null;
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        resultData = await res.json();
      }

      setRawStats((prev) => ({
        total: prev.total + 1,
        failed: res.ok ? prev.failed : prev.failed + 1,
        latencies: [...prev.latencies.slice(-40), elapsed]
      }));
    } catch (err) {
      setRawStats((prev) => ({
        total: prev.total + 1,
        failed: prev.failed + 1,
        latencies: [...prev.latencies.slice(-40), 100]
      }));
    }
    fetchTransactions();
    return resultData;
  };

  // 3. Send 15x Batch
  const handleBurstTraffic = async () => {
    const accounts = ['ACC-9921', 'ACC-1049', 'ACC-8831', 'ACC-4491', 'ACC-7723'];
    const recipients = ['REC-8840', 'REC-3391', 'REC-1192', 'REC-5502'];
    const methods = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_WIRE', 'CRYPTO'];

    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        handleSendPayment({
          account_id: accounts[Math.floor(Math.random() * accounts.length)],
          recipient_id: recipients[Math.floor(Math.random() * recipients.length)],
          amount: Math.floor(Math.random() * 500) + 15,
          currency: 'USD',
          payment_method: methods[Math.floor(Math.random() * methods.length)]
        })
      );
    }
    await Promise.all(promises);
    fetchTransactions();
  };

  // 4. Auto-Streamer Toggle
  useEffect(() => {
    let timer;
    if (isAutoStreaming) {
      timer = setInterval(() => {
        handleSendPayment({
          account_id: 'ACC-' + Math.floor(1000 + Math.random() * 9000),
          recipient_id: 'REC-' + Math.floor(1000 + Math.random() * 9000),
          amount: Math.floor(Math.random() * 350) + 20,
          currency: 'USD',
          payment_method: 'CREDIT_CARD'
        });
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isAutoStreaming]);

  // 5. Periodic Metrics Sync & Chart Push
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString().split(' ')[0];
      const rps = (Math.random() * 1.5 + (rawStats.total > 0 ? 3.2 : 0.4)).toFixed(1);

      let p50 = 12, p95 = 18, p99 = 28;
      if (rawStats.latencies.length > 0) {
        const sorted = [...rawStats.latencies].sort((a, b) => a - b);
        p50 = sorted[Math.floor(sorted.length * 0.5)] || 12;
        p95 = sorted[Math.floor(sorted.length * 0.95)] || 18;
        p99 = sorted[Math.floor(sorted.length * 0.99)] || 28;
      }

      const errRate = rawStats.total > 0 ? ((rawStats.failed / rawStats.total) * 100).toFixed(1) : '0.0';
      setMetrics({ rps, p95: p95.toString(), errorRate: errRate });

      // SRE SLI & Error Budget calculations
      const sli = rawStats.total > 0 
        ? (((rawStats.total - rawStats.failed) / rawStats.total) * 100).toFixed(3) 
        : '99.980';
      const budgetConsumed = (parseFloat(errRate) / 0.1 * 100).toFixed(1);
      const budgetLeft = Math.max(0, 100.0 - parseFloat(budgetConsumed)).toFixed(1);
      const burn = Math.max(1.0, (parseFloat(errRate) / 0.1)).toFixed(1);

      setSreStats({
        availability: sli,
        budgetRemaining: budgetLeft,
        budgetConsumed,
        burnRate: burn,
        totalReq: rawStats.total,
        failedReq: rawStats.failed
      });

      // Update Chart.js timeline
      setChartLabels((prev) => [...prev.slice(1), now]);
      setThroughputHistory((prev) => [...prev.slice(1), parseFloat(rps)]);
      setLatencyHistory((prev) => ({
        p50: [...prev.p50.slice(1), p50],
        p95: [...prev.p95.slice(1), p95],
        p99: [...prev.p99.slice(1), p99]
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [rawStats]);

  // 6. Chaos Controls
  const handleApplyChaos = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chaos/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) setIsChaosActive(true);
    } catch (err) {
      console.error('Failed to configure chaos:', err);
    }
  };

  const handleRestoreChaos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chaos/reset`, { method: 'POST' });
      if (res.ok) setIsChaosActive(false);
    } catch (err) {
      console.error('Failed to reset chaos:', err);
    }
  };

  // 7. Guided Demo Workflow
  const handleStartDemo = () => {
    setDemoStep(1);
    setActiveTab('tab-overview');
    setIsDemoModalOpen(true);
    handleBurstTraffic();
  };

  const handleNextDemoStep = () => {
    const next = demoStep + 1;
    setDemoStep(next);
    if (next === 2) setActiveTab('tab-cicd');
    if (next === 3) setActiveTab('tab-observability');
    if (next === 4) {
      setActiveTab('tab-sre');
      handleApplyChaos({
        chaos_mode_enabled: true,
        injected_latency_ms: 450,
        injected_failure_rate: 0.35,
        force_fraud_spike: true
      });
    }
    if (next > 4) setIsDemoModalOpen(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="app-wrapper">
      <Navbar onStartDemo={handleStartDemo} theme={theme} onToggleTheme={toggleTheme} />
      <StudentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'tab-overview' && (
        <TabPayments
          onSendPayment={handleSendPayment}
          transactions={transactions}
          onBurstTraffic={handleBurstTraffic}
          isAutoStreaming={isAutoStreaming}
          onToggleAutoStream={() => setIsAutoStreaming(!isAutoStreaming)}
        />
      )}

      {activeTab === 'tab-cicd' && <TabCicd />}

      {activeTab === 'tab-observability' && (
        <TabObservability
          metrics={metrics}
          chartLabels={chartLabels}
          throughputHistory={throughputHistory}
          latencyHistory={latencyHistory}
          theme={theme}
        />
      )}

      {activeTab === 'tab-sre' && (
        <TabSreChaos
          metrics={metrics}
          sreStats={sreStats}
          onApplyChaos={handleApplyChaos}
          onRestoreChaos={handleRestoreChaos}
          isChaosActive={isChaosActive}
        />
      )}

      <GuidedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        currentStep={demoStep}
        onNextStep={handleNextDemoStep}
      />
    </div>
  );
}
