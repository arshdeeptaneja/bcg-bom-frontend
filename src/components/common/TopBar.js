import React from 'react';
import './TopBar.css';
import logo from '../../assets/Bank_of_Maharashtra_logo.jpg';
import logout from '../../assets/logout.svg';

const TopBar = ({ onLogout }) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="bank-logo">
          <img src={logo} alt={''} />
        </div>
      </div>
      
      <div className="topbar-right">
        <div className="user-profile">
          <div className="user-avatar" onClick={onLogout} title="Logout">
              <img src={logout} alt={''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;