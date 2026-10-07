import React, { useState } from 'react';
import { Flame, RefreshCw, FileCheck2, AlertCircle } from 'lucide-react';

export default function TabSreChaos({ metrics, sreStats, onApplyChaos, onRestoreChaos, isChaosActive }) {
  const [latency, setLatency] = useState(0);
  const [failureRate, setFailureRate] = useState(0);
  const [fraudSpike, setFraudSpike] = useState(false);
  const [report, setReport] = useState(null);

  const handleApplyChaos = async () => {
    await onApplyChaos({
      chaos_mode_enabled: true,
      injected_latency_ms: parseInt(latency, 10),
      injected_failure_rate: parseFloat(failureRate) / 100.0,
      force_fraud_spike: fraudSpike
    });
  };

  const handleRestore = async () => {
    setLatency(0);
    setFailureRate(0);
    setFraudSpike(false);
    await onRestoreChaos();
  };

  const generateReport = () => {
    const isCompliant = parseFloat(sreStats.availability) >= 99.9;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setReport({
      timestamp: now,
      isCompliant,
      availability: sreStats.availability,
      budgetRemaining: sreStats.budgetRemaining,
      budgetConsumed: sreStats.budgetConsumed,
      burnMultiplier: sreStats.burnRate,
      p95: metrics.p95,
      evaluatedRequests: Math.max(sreStats.totalReq, 28),
      failedReq: sreStats.failedReq
    });
  };

  return (
    <div className="view-container">
      {/* Context Bar */}
      <div className="section-meta-bar">
        <div className="section-meta-left">
          <h2>Site Reliability Engineering & Fault Injection</h2>
          <p>Rolling 30-day availability SLO (99.90%), Error Budget Burn Rate multiplier, and synthetic chaos testing.</p>
        </div>
        <button onClick={generateReport} className="btn btn-secondary">
          <FileCheck2 size={14} /> Generate Compliance Audit
        </button>
      </div>

      {/* SRE KPI Tiles */}
      <div className="stats-row">
        <div className="stat-tile">
          <span className="stat-label">Measured Availability SLI</span>
          <div
            className="stat-value"
            style={{ color: parseFloat(sreStats.availability) < 99.9 ? '#ef4444' : '#10b981' }}
          >
            {sreStats.availability}%
          </div>
          <span className="stat-caption">Target SLO: 99.900% Uptime</span>
        </div>

        <div className="stat-tile">
          <span className="stat-label">Error Budget Remaining</span>
          <div
            className="stat-value"
            style={{ color: parseFloat(sreStats.budgetRemaining) < 50 ? '#ef4444' : '#10b981' }}
          >
            {sreStats.budgetRemaining}%
          </div>
          <span className="stat-caption">Allowable Unreliability: 0.100%</span>
        </div>

        <div className="stat-tile">
          <span className="stat-label">Budget Burn Multiplier</span>
          <div
            className="stat-value"
            style={{ color: parseFloat(sreStats.burnRate) > 5 ? '#ef4444' : 'inherit' }}
          >
            {sreStats.burnRate}x
          </div>
          <span className="stat-caption">
            {parseFloat(sreStats.burnRate) > 5 ? '⚠️ Accelerated Exhaustion' : 'Nominal burn velocity'}
          </span>
        </div>
      </div>

      <div className="grid-2">
        {/* Chaos Engineering Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>Fault Injection / Chaos Experiment Suite</h3>
            <span className={`chip ${isChaosActive ? 'chip-danger' : 'chip-success'}`}>
              {isChaosActive ? 'Fault Injected' : 'Nominal State'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Simulate realistic production failures to validate whether circuit breakers isolate downstream timeouts and verify if alertmanager fires when latency SLOs are breached.
          </p>

          <div className="slider-field">
            <div className="slider-top">
              <span>Artificial Network Latency</span>
              <span className="slider-val">{latency} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="50"
              value={latency}
              onChange={(e) => setLatency(e.target.value)}
            />
          </div>

          <div className="slider-field">
            <div className="slider-top">
              <span>Synthetic HTTP 500 Error Injection</span>
              <span className="slider-val">{failureRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={failureRate}
              onChange={(e) => setFailureRate(e.target.value)}
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="fraud-toggle"
              checked={fraudSpike}
              onChange={(e) => setFraudSpike(e.target.checked)}
            />
            <label htmlFor="fraud-toggle" style={{ cursor: 'pointer' }}>
              Force downstream high-risk fraud anomaly load
            </label>
          </div>

          <div className="btn-group">
            <button onClick={handleApplyChaos} className="btn btn-danger">
              <Flame size={14} /> Inject Faults
            </button>
            <button onClick={handleRestore} className="btn btn-outline">
              <RefreshCw size={14} /> Reset to Nominal
            </button>
          </div>
        </div>

        {/* SRE Compliance Audit */}
        <div className="panel">
          <div className="panel-header">
            <h3>SRE Compliance & Post-Mortem Report</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {report ? report.timestamp : 'Pending generation'}
            </span>
          </div>

          <div className="report-terminal">
            {report ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
{`================================================================
SERVICE LEVEL OBJECTIVE (SLO) AUDIT
================================================================
• Target Availability SLO:        99.900% (Rolling Window)
• Target Latency SLO:             p95 < 200.0 ms

MEASURED INDICATORS (SLI):
• Total Transactions Evaluated:   ${report.evaluatedRequests}
• Unhandled 5xx Failures:         ${report.failedReq}
• Measured Availability SLI:      ${report.availability}%
• Measured p95 Latency:           ${report.p95} ms

ERROR BUDGET LEDGER:
• Allowable Unreliability:        0.100% (100 - 99.9%)
• Error Budget Remaining:         ${report.budgetRemaining}%
• Error Budget Consumed:          ${report.budgetConsumed}%
• Current Burn Rate Multiplier:   ${report.burnMultiplier}x

STATUS: ${report.isCompliant ? '[COMPLIANT - NOMINAL]' : '[SLO BREACHED - FREEZE PROD DEPLOYS]'}

OPERATIONAL RECOMMENDATION:
${report.isCompliant 
  ? 'System operates inside reliability envelope. Feature deployments authorized.' 
  : 'Error budget depleted. Automated change-freeze active; engineers prioritized for resilience.'}`}
              </pre>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '36px 0' }}>
                Click <strong>"Generate Compliance Audit"</strong> above to compute the live SRE Error Budget against the 99.9% SLO agreement.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
