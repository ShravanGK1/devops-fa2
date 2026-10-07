import React, { useState } from 'react';
import { Send, Zap, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

export default function TabPayments({ onSendPayment, transactions, onBurstTraffic, isAutoStreaming, onToggleAutoStream }) {
  const [sender, setSender] = useState('acc_enterprise_9104');
  const [recipient, setRecipient] = useState('rec_vendor_4412');
  const [amount, setAmount] = useState('450.00');
  const [method, setMethod] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setLastResult(null);

    const res = await onSendPayment({
      account_id: sender,
      recipient_id: recipient,
      amount: parseFloat(amount),
      currency: 'USD',
      payment_method: method
    });

    if (res) {
      setLastResult(res);
    }
    setIsProcessing(false);
  };

  return (
    <div className="view-container">
      {/* Context Bar */}
      <div className="section-meta-bar">
        <div className="section-meta-left">
          <h2>Financial Gateway & Distributed Fraud Scoring</h2>
          <p>Decoupled async microservice pipeline with upstream circuit breaking and telemetry hooks.</p>
        </div>
        <div className="btn-group">
          <button type="button" onClick={onBurstTraffic} className="btn btn-secondary">
            <Zap size={14} /> Send 15x Batch Load
          </button>
          <button
            type="button"
            onClick={onToggleAutoStream}
            className={`btn ${isAutoStreaming ? 'btn-danger' : 'btn-primary'}`}
          >
            {isAutoStreaming ? 'Stop Load Stream' : 'Start Auto-Traffic'}
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Payment Dispatch Terminal */}
        <div className="panel">
          <div className="panel-header">
            <h3>Dispatch Transaction</h3>
            <span className="chip chip-success">Circuit Breaker: CLOSED</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Originating Account (Debtor)</label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="acc_..."
                  required
                />
              </div>
              <div className="field">
                <label>Beneficiary Account (Creditor)</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="rec_..."
                  required
                />
              </div>
              <div className="field">
                <label>Transfer Amount ($ USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="1"
                  required
                />
              </div>
              <div className="field">
                <label>Settlement Instrument</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="CREDIT_CARD">Credit Card (Visa / Mastercard)</option>
                  <option value="DEBIT_CARD">Debit Card (Interac)</option>
                  <option value="BANK_WIRE">FedWire RTGS</option>
                  <option value="CRYPTO">USDC Stablecoin</option>
                </select>
              </div>
            </div>

            <div className="btn-group" style={{ marginBottom: lastResult ? '14px' : '0' }}>
              <button type="submit" disabled={isProcessing} className="btn btn-primary">
                {isProcessing ? 'Authorizing with Fraud Engine...' : 'Authorize Transaction'}
              </button>
            </div>

            {/* Instant Confirmation Banner */}
            {lastResult && (
              <div style={{
                marginTop: '14px',
                padding: '12px 14px',
                borderRadius: '6px',
                background: lastResult.status === 'SUCCESS' ? '#ecfdf5' : lastResult.status === 'BLOCKED_FRAUD' ? '#fffbeb' : '#fef2f2',
                border: `1px solid ${lastResult.status === 'SUCCESS' ? '#a7f3d0' : lastResult.status === 'BLOCKED_FRAUD' ? '#fde68a' : '#fecaca'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {lastResult.status === 'SUCCESS' ? (
                    <CheckCircle2 size={16} color="#059669" />
                  ) : lastResult.status === 'BLOCKED_FRAUD' ? (
                    <AlertTriangle size={16} color="#d97706" />
                  ) : (
                    <XCircle size={16} color="#dc2626" />
                  )}
                  <div>
                    <strong>{lastResult.status === 'SUCCESS' ? 'Transaction Settled' : lastResult.status}:</strong>{' '}
                    <span>{lastResult.transaction_id} • Latency: {lastResult.latency_ms}ms • Risk: {(lastResult.risk_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${parseFloat(lastResult.amount).toFixed(2)}</span>
              </div>
            )}
          </form>
        </div>

        {/* Microservice Mesh Overview */}
        <div className="panel">
          <div className="panel-header">
            <h3>Service Mesh Topology & Latency Budget</h3>
            <span className="chip chip-success">Health: 100%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="stage-box passed">
              <div className="stage-header">
                <span>FRONTEND SERVICE</span>
                <span>Port 5173</span>
              </div>
              <div className="stage-title">React 18 Single Page Application</div>
              <div className="stage-desc">Telemetry collector & operational control plane</div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              ↓ HTTP POST /api/v1/payments (Avg ~14ms)
            </div>

            <div className="stage-box passed">
              <div className="stage-header">
                <span>GATEWAY CORE</span>
                <span>FastAPI • Port 8000</span>
              </div>
              <div className="stage-title">Payment Gateway Microservice</div>
              <div className="stage-desc">Prometheus RED exporter, rate-limiter, circuit-breaker fallback</div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              ↓ Downstream Risk RPC (Async REST)
            </div>

            <div className="stage-box passed">
              <div className="stage-header">
                <span>FRAUD ENGINE</span>
                <span>FastAPI • Port 8001</span>
              </div>
              <div className="stage-title">Real-Time Risk Scoring Engine</div>
              <div className="stage-desc">Behavioral heuristic scoring & anomaly detection rules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Stream Table */}
      <div className="panel">
        <div className="panel-header">
          <h3>Transaction Audit Stream</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing latest {transactions.length} events
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction Reference</th>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Instrument</th>
                <th>Fraud Score</th>
                <th>Gateway Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No transactions captured. Click "Authorize Transaction" or "Send 15x Batch Load" to stream live events.
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 10).map((t) => {
                  const isBlocked = t.status === 'BLOCKED_FRAUD';
                  const isFailed = t.status === 'FAILED_ERROR';
                  return (
                    <tr key={t.transaction_id || Math.random()}>
                      <td><strong>{t.transaction_id}</strong></td>
                      <td>{t.account_id}</td>
                      <td>{t.recipient_id}</td>
                      <td>${parseFloat(t.amount).toFixed(2)}</td>
                      <td>{t.payment_method || 'CARD'}</td>
                      <td>{(parseFloat(t.risk_score || 0.05) * 100).toFixed(0)}%</td>
                      <td>{t.latency_ms} ms</td>
                      <td>
                        <span className={`chip ${isBlocked ? 'chip-warning' : isFailed ? 'chip-danger' : 'chip-success'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
