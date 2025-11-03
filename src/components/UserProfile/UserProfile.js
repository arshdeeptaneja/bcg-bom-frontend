import React, { useState, useEffect } from 'react';
import { userAPI, dashboardAPI } from '../../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [kraMetrics, setKraMetrics] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Example of multiple GET API calls
      const [
        profileData,
        rolesData,
        kraData,
        teamData,
        dashData
      ] = await Promise.allSettled([
        userAPI.getProfile(),
        userAPI.getRoles(),
        userAPI.getKRAMetrics(),
        userAPI.getTeamMembers(),
        dashboardAPI.getDashboardData()
      ]);

      // Handle profile data
      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value);
        console.log('Profile data:', profileData.value);
      } else {
        console.error('Failed to fetch profile:', profileData.reason);
      }

      // Handle roles data
      if (rolesData.status === 'fulfilled') {
        setRoles(rolesData.value);
        console.log('Roles data:', rolesData.value);
      } else {
        console.error('Failed to fetch roles:', rolesData.reason);
      }

      // Handle KRA metrics data
      if (kraData.status === 'fulfilled') {
        setKraMetrics(kraData.value);
        console.log('KRA metrics data:', kraData.value);
      } else {
        console.error('Failed to fetch KRA metrics:', kraData.reason);
      }

      // Handle team members data
      if (teamData.status === 'fulfilled') {
        setTeamMembers(teamData.value);
        console.log('Team members data:', teamData.value);
      } else {
        console.error('Failed to fetch team members:', teamData.reason);
      }

      // Handle dashboard data
      if (dashData.status === 'fulfilled') {
        setDashboardData(dashData.value);
        console.log('Dashboard data:', dashData.value);
      } else {
        console.error('Failed to fetch dashboard data:', dashData.reason);
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      setError('');
      const profileData = await userAPI.getProfile();
      setProfile(profileData);
      console.log('Profile refreshed:', profileData);
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile data.');
    }
  };

  const handleRefreshRoles = async () => {
    try {
      setError('');
      const rolesData = await userAPI.getRoles();
      setRoles(rolesData);
      console.log('Roles refreshed:', rolesData);
    } catch (err) {
      console.error('Error refreshing roles:', err);
      setError('Failed to refresh roles data.');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <div className="loading-spinner">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="user-profile-header">
        <h2>User Profile</h2>
        <button onClick={fetchUserData} className="refresh-btn">
          Refresh All Data
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div className="profile-section">
        <div className="section-header">
          <h3>Profile Information</h3>
          <button onClick={handleRefreshProfile} className="refresh-btn-small">
            Refresh
          </button>
        </div>
        {profile ? (
          <div className="profile-data">
            <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
            <p><strong>Employee ID:</strong> {profile.employeeId || 'N/A'}</p>
            <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
            <p><strong>Department:</strong> {profile.department || 'N/A'}</p>
            <p><strong>Position:</strong> {profile.position || 'N/A'}</p>
          </div>
        ) : (
          <p>No profile data available</p>
        )}
      </div>

      {/* Roles Section */}
      <div className="roles-section">
        <div className="section-header">
          <h3>User Roles</h3>
          <button onClick={handleRefreshRoles} className="refresh-btn-small">
            Refresh
          </button>
        </div>
        {roles.length > 0 ? (
          <div className="roles-data">
            {roles.map((role, index) => (
              <div key={index} className="role-item">
                <p><strong>Role:</strong> {role.name}</p>
                <p><strong>Description:</strong> {role.description}</p>
                <p><strong>Permissions:</strong> {role.permissions?.join(', ') || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No roles data available</p>
        )}
      </div>

      {/* KRA Metrics Section */}
      <div className="kra-section">
        <h3>KRA Metrics</h3>
        {kraMetrics ? (
          <div className="kra-data">
            <p><strong>Overall Score:</strong> {kraMetrics.overallScore || 'N/A'}</p>
            <p><strong>Target Achievement:</strong> {kraMetrics.targetAchievement || 'N/A'}%</p>
            <p><strong>Last Updated:</strong> {kraMetrics.lastUpdated || 'N/A'}</p>
          </div>
        ) : (
          <p>No KRA metrics available</p>
        )}
      </div>

      {/* Team Members Section */}
      <div className="team-section">
        <h3>Team Members</h3>
        {teamMembers.length > 0 ? (
          <div className="team-data">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <p><strong>Name:</strong> {member.name}</p>
                <p><strong>Position:</strong> {member.position}</p>
                <p><strong>Employee ID:</strong> {member.employeeId}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No team members data available</p>
        )}
      </div>

      {/* Dashboard Data Section */}
      <div className="dashboard-section">
        <h3>Dashboard Summary</h3>
        {dashboardData ? (
          <div className="dashboard-data">
            <p><strong>Total Tasks:</strong> {dashboardData.totalTasks || 'N/A'}</p>
            <p><strong>Completed Tasks:</strong> {dashboardData.completedTasks || 'N/A'}</p>
            <p><strong>Pending Tasks:</strong> {dashboardData.pendingTasks || 'N/A'}</p>
            <p><strong>Last Login:</strong> {dashboardData.lastLogin || 'N/A'}</p>
          </div>
        ) : (
          <p>No dashboard data available</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;