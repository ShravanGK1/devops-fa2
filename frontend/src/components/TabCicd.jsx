import React, { useState } from 'react';
import { Play, CheckCircle2, Loader2, GitCommit, ShieldCheck, Terminal, Layers } from 'lucide-react';

export default function TabCicd() {
  const [isRunning, setIsRunning] = useState(false);
  const [stages, setStages] = useState({
    lint: 'pending',
    sec: 'pending',
    build: 'pending',
    smoke: 'pending'
  });
  const [logs, setLogs] = useState('Build runner idle. Ready to trigger continuous delivery pipeline simulation.');

  const runPipeline = async () => {
    setIsRunning(true);
    setLogs('[GitHub Actions Runner #184 - Workflow: ci-cd.yml]\n[Trigger: git push to origin/main (Commit: #9e4a10c by @team-devops)]\n\n');
    setStages({ lint: 'running', sec: 'pending', build: 'pending', smoke: 'pending' });

    // Stage 1
    setLogs((prev) => prev + '==> Stage 1: Syntax Linting & Automated PyTest Suite\n    • services/payment_service/tests/test_payment.py ... PASSED (4/4)\n    • services/fraud_service/tests/test_fraud.py ... PASSED (4/4)\n    • Code Coverage: 94.2% across business logic modules.\n    [SUCCESS] 8 unit tests passed in 0.38s.\n\n');
    await new Promise((r) => setTimeout(r, 900));
    setStages({ lint: 'passed', sec: 'running', build: 'pending', smoke: 'pending' });

    // Stage 2
    setLogs((prev) => prev + '==> Stage 2: DevSecOps SAST & Secret Leak Audit\n    • Inspecting 26 source files with regex heuristics...\n    • Trivy Security Scanner: Scanned 3 container definitions.\n    • Vulnerabilities: 0 CRITICAL, 0 HIGH detected.\n    [SUCCESS] DevSecOps security policy gates passed.\n\n');
    await new Promise((r) => setTimeout(r, 900));
    setStages({ lint: 'passed', sec: 'passed', build: 'running', smoke: 'pending' });

    // Stage 3
    setLogs((prev) => prev + '==> Stage 3: Multi-Stage Docker Image Build\n    • docker build -t fintech-payment-service:v2.4.1 ... [DONE: 112 MB]\n    • docker build -t fintech-fraud-service:v2.4.1 ... [DONE: 108 MB]\n    • docker build -t fintech-frontend-portal:v2.4.1 ... [DONE: 28 MB]\n    [SUCCESS] Immutable images packaged and pushed.\n\n');
    await new Promise((r) => setTimeout(r, 900));
    setStages({ lint: 'passed', sec: 'passed', build: 'passed', smoke: 'running' });

    // Stage 4
    setLogs((prev) => prev + '==> Stage 4: Staging Deployment & Automated Smoke Tests\n    • Probing GET http://localhost:8000/health ... 200 OK (Status: UP)\n    • Probing GET http://localhost:8000/metrics ... 200 OK (Prometheus Exporter Active)\n    • Processing Synthetic Transaction TXN-SMOKE-99 ... APPROVED (14ms)\n\n🚀 DEPLOYMENT COMPLETED! Service version v2.4.1 promoted to staging.\n');
    await new Promise((r) => setTimeout(r, 700));
    setStages({ lint: 'passed', sec: 'passed', build: 'passed', smoke: 'passed' });
    setIsRunning(false);
  };

  return (
    <div className="view-container">
      {/* Context Bar */}
      <div className="section-meta-bar">
        <div className="section-meta-left">
          <h2>Continuous Delivery & DevSecOps Verification</h2>
          <p>Automated pipeline orchestrating unit testing, SAST security audits, container builds, and post-deploy smoke tests.</p>
        </div>
        <button onClick={runPipeline} disabled={isRunning} className="btn btn-primary">
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isRunning ? 'Pipeline Executing...' : 'Trigger Pipeline Run'}
        </button>
      </div>

      {/* Pipeline Stage Cards */}
      <div className="pipeline-track">
        <div className={`stage-box ${stages.lint}`}>
          <div className="stage-header">
            <span>STAGE 1</span>
            <span>PyTest & Flake8</span>
          </div>
          <div className="stage-title">Unit Testing</div>
          <div className="stage-desc">8 test assertions & coverage</div>
        </div>

        <div className="stage-link"></div>

        <div className={`stage-box ${stages.sec}`}>
          <div className="stage-header">
            <span>STAGE 2</span>
            <span>Trivy & SAST</span>
          </div>
          <div className="stage-title">DevSecOps Audit</div>
          <div className="stage-desc">Secret leaks & vulnerability scan</div>
        </div>

        <div className="stage-link"></div>

        <div className={`stage-box ${stages.build}`}>
          <div className="stage-header">
            <span>STAGE 3</span>
            <span>Docker Buildx</span>
          </div>
          <div className="stage-title">Container Builds</div>
          <div className="stage-desc">Multi-stage alpine images</div>
        </div>

        <div className="stage-link"></div>

        <div className={`stage-box ${stages.smoke}`}>
          <div className="stage-header">
            <span>STAGE 4</span>
            <span>Staging Target</span>
          </div>
          <div className="stage-title">Smoke Verification</div>
          <div className="stage-desc">Health & end-to-end probing</div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="terminal-window">
        <div className="terminal-header">
          <span>runner@gh-actions-agent-01: ~ /builds/logs</span>
          <span>bash 5.2</span>
        </div>
        <pre className="terminal-body">{logs}</pre>
      </div>
    </div>
  );
}
