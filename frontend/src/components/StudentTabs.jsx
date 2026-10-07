import React from 'react';
import { CreditCard, GitPullRequest, Activity, ShieldAlert } from 'lucide-react';

export default function StudentTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'tab-overview', title: 'Payment Processing & Mesh', icon: CreditCard },
    { id: 'tab-cicd', title: 'CI/CD & DevSecOps Delivery', icon: GitPullRequest },
    { id: 'tab-observability', title: 'Observability & RED Metrics', icon: Activity },
    { id: 'tab-sre', title: 'SRE Reliability & Chaos', icon: ShieldAlert },
  ];

  return (
    <nav className="app-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon size={16} />
            <span>{tab.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
