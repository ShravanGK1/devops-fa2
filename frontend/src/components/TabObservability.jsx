import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TabObservability({ metrics, chartLabels, throughputHistory, latencyHistory, theme }) {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const legendColor = isDark ? '#f8fafc' : '#334155';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
      x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 6, font: { family: 'Inter', size: 11 } } }
    },
    plugins: {
      legend: { labels: { color: legendColor, boxWidth: 12, font: { family: 'Inter', size: 12, weight: '500' } } }
    }
  };

  const throughputData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Throughput (RPS)',
        data: throughputHistory,
        borderColor: isDark ? '#38bdf8' : '#2563eb',
        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2
      }
    ]
  };

  const latencyData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'p50 Median (ms)',
        data: latencyHistory.p50,
        borderColor: '#10b981',
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0
      },
      {
        label: 'p95 SLA (ms)',
        data: latencyHistory.p95,
        borderColor: '#f59e0b',
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0
      },
      {
        label: 'p99 Tail (ms)',
        data: latencyHistory.p99,
        borderColor: '#ef4444',
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0
      }
    ]
  };

  return (
    <div className="view-container">
      {/* Context Bar */}
      <div className="section-meta-bar">
        <div className="section-meta-left">
          <h2>Prometheus Telemetry & Golden Signals</h2>
          <p>Scraping RED metrics (Rate, Errors, Duration) from distributed FastAPI Prometheus clients every 2 seconds.</p>
        </div>
        <span className="chip chip-success">Prometheus: Healthy (:9090)</span>
      </div>

      {/* Summary KPI Tiles */}
      <div className="stats-row">
        <div className="stat-tile">
          <span className="stat-label">Throughput (Rate)</span>
          <div className="stat-value">{metrics.rps} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>RPS</span></div>
          <span className="stat-caption">Ingress traffic volume</span>
        </div>

        <div className="stat-tile">
          <span className="stat-label">p95 Latency (Duration)</span>
          <div className="stat-value" style={{ color: '#10b981' }}>{metrics.p95} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ms</span></div>
          <span className="stat-caption">Service SLO: &lt; 200 ms</span>
        </div>

        <div className="stat-tile">
          <span className="stat-label">HTTP 5xx Error Rate</span>
          <div className="stat-value" style={{ color: parseFloat(metrics.errorRate) > 5 ? '#ef4444' : 'inherit' }}>
            {metrics.errorRate}%
          </div>
          <span className="stat-caption">Server anomaly threshold: 5.0%</span>
        </div>
      </div>

      {/* Observability Graphs */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h3>Request Rate / Ingress Throughput</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>rate(http_requests_total[1m])</span>
          </div>
          <div className="chart-container">
            <Line data={throughputData} options={chartOptions} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Latency Percentiles (p50, p95, p99)</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>histogram_quantile()</span>
          </div>
          <div className="chart-container">
            <Line data={latencyData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
