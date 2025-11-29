import React from 'react';
import { BackButton, IconTab } from '../../../components/common';
import { HiUserGroup } from 'react-icons/hi';
import { FaDesktop } from 'react-icons/fa';
import './ProfilerLandingPage.css';

const ProfilerLandingPage = () => {
  // const navigate = useNavigate(); // Uncomment when routes are ready

  const handleSkillProfilerToolClick = () => {
    console.log('Skill Profiler Tool clicked');
    // Navigate to Skill Profiler Tool page
    // navigate('/skills/profiler-tool');
  };

  const handleAdminDashboardClick = () => {
    console.log('Skill Profiler Admin Dashboard clicked');
    // Navigate to Admin Dashboard page
    // navigate('/skills/admin-dashboard');
  };

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="profiler-landing-header mb-4">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 mt-3">Skill Profiler</h1>
      </div>

      {/* Tiles Section */}
      <div className="profiler-tiles-container">
        <IconTab
          icon={<HiUserGroup />}
          label="Skill Profiler Tool"
          iconColor="#dc3545"
          onClick={handleSkillProfilerToolClick}
        />
        <IconTab
          icon={<FaDesktop />}
          label="Skill Profiler Admin Dashboard"
          iconColor="#20c997"
          onClick={handleAdminDashboardClick}
        />
      </div>
    </div>
  );
};

export default ProfilerLandingPage;
