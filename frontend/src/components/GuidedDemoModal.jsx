import React from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GuidedDemoModal({ isOpen, onClose, currentStep, onNextStep }) {
  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Asynchronous Payment Dispatch & Circuit Breaking',
      desc: 'Simulating concurrent transaction authorizations to show decoupled FastAPI microservices and upstream circuit-breaker isolation under load.',
      progress: '25%'
    },
    {
      title: '2. Continuous Delivery & DevSecOps Verification',
      desc: 'Executing the automated CI/CD pipeline: running PyTest suites, performing SAST secret scans, building multi-stage containers, and probing staging health.',
      progress: '50%'
    },
    {
      title: '3. Prometheus Telemetry & Latency Histograms',
      desc: 'Scraping live RED golden signals (Throughput RPS, Latency percentiles p50/p95/p99) directly into Chart.js telemetry dashboards.',
      progress: '75%'
    },
    {
      title: '4. SRE Error Budget Burn & Chaos Injection',
      desc: 'Injecting network latency and 500 server errors, measuring the real-time Error Budget burn multiplier, and producing the post-mortem compliance audit.',
      progress: '100%'
    }
  ];

  const current = steps[currentStep - 1] || steps[0];

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Architecture Walkthrough</h3>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>

        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            {current.title}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {current.desc}
          </p>
          <div style={{ width: '100%', height: '4px', background: 'var(--bg-subtle)', borderRadius: '4px', marginTop: '14px' }}>
            <div style={{ width: current.progress, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onNextStep} className="btn btn-primary">
            {currentStep >= 4 ? 'Complete Walkthrough' : 'Next Section'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
