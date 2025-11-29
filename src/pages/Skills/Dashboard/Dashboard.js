import React, { useState } from 'react';
import { BackButton } from '../../../components/common';
import { Guidelines } from '../../../pages';
import SkillSelection from './DashboardTabs/SkillSelection/SkillSelection';
import './Dashboard.css';

const Dashboard = () => {
  // Placeholder components for each tab
  const AboutYou = () => (
    <div className="tab-content">
      <h2>About You</h2>
      <p>This is the About You component content.</p>
    </div>
  );

  const GuidelinesTab = () => (
    <div className="tab-content">
      <Guidelines onNext={() => setActiveTab('skill-selection')} />
    </div>
  );

  const SkillSelectionTab = () => (
    <div className="tab-content">
      <SkillSelection />
    </div>
  );

  const DashboardTab = () => (
    <div className="tab-content">
      <h2>Dashboard</h2>
      <p>This is the Dashboard component content.</p>
    </div>
  );

  const [activeTab, setActiveTab] = useState('about-you');

  const tabs = [
    { id: 'about-you', label: 'About You', component: <AboutYou /> },
    { id: 'guidelines', label: 'Guidelines', component: <GuidelinesTab /> },
    { id: 'skill-selection', label: 'Skill Selection', component: <SkillSelectionTab /> },
    { id: 'dashboard', label: 'Dashboard', component: <DashboardTab /> },
  ];

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex align-items-center gap-3 mb-4">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0">Skill Assessment</h1>
      </div>

      {/* Tabs Bar */}
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content-wrapper">{activeComponent}</div>
    </div>
  );
};

export default Dashboard;
