import React from 'react';
import { ShieldCheck, Play, Sun, Moon } from 'lucide-react';

export default function Navbar({ onStartDemo, theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="brand-info">
          <h1>ApexPay Core & SRE Platform</h1>
          <div className="brand-meta">
            <span>Cluster:</span> <span className="meta-pill">us-east-1a</span>
            <span>•</span>
            <span>Version:</span> <span className="meta-pill">v2.4.1-prod</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button onClick={onStartDemo} className="btn btn-secondary">
          <Play size={14} /> Run Architecture Walkthrough
        </button>
        
        <div className="env-tag">
          <span className="live-indicator"></span>
          <span>All Systems Operational</span>
        </div>
      </div>
    </header>
  );
}
