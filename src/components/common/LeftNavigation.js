import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LeftNavigation.css';
import dashboardIcon from '../../assets/home.svg';
import toolIcon from '../../assets/tools-green.svg';
import { accessService } from '../../services/api';

const LeftNavigation = () => {
  const [activeItem, setActiveItem] = useState('home');
  const [showToolsSubmenu, setShowToolsSubmenu] = useState(false);
  const [filteredTools, setFilteredTools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toolsSubmenu = [
    { id: 'business-target', label: 'Business Target', path: '/rc/business-target' },
    { id: 'role-clarity', label: 'Role Clarity', path: '/rc/role-clarity' },
    { id: 'role-allocation', label: 'Role Allocation', path: '/rc/role-allocation' },
    { id: 'scorecard', label: 'Scorecard', path: '/rc/scorecard' },
    { id: 'appraisal', label: 'Appraisal', path: '/rc/appraisal' },
    { id: 'transfer-tool', label: 'Transfer Tool - Transfers', path: '/rc/transfer-tool' },
    { id: 'performance-dashboard', label: 'Performance Dashboard', path: '/rc/performance-dashboard' },
    { id: 'product-dashboard', label: 'Product Dashboard', path: '/rc/product-dashboard' }
  ];

  const ZonalHead = ['Business Target', 'Role Clarity', 'Scorecard', 'Appraisal', 'Transfer Tool - Transfers', 'Performance Dashboard', 'Product Dashboard'];
  const branchHead = ['Business Target', 'Role Clarity', 'Scorecard', 'Appraisal', 'Transfer Tool - Transfers', 'Performance Dashboard', 'Product Dashboard']
  const verticalHead = ['Role Clarity', 'Scorecard', 'Appraisal']
  const suHead = ['Role Clarity', 'Scorecard', 'Appraisal', 'Product Dashboard']
  const fallbackMenu = ['Role Clarity', 'Scorecard']

  const fetchAndSetTools = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem('userData'))?.[0];
    if (!userData || isLoading) return;

    const empId = userData.EMP_NUMBER || userData.EMP_ID;
    const unitType = userData.BRANCHTYPE || '';
    const role = userData.POSITION_DESIGNATION || '';

    let initialAccessList = []; // Array of strings (tool labels for local fallback)

    // --- Fallback Logic (Moved the accessList setup outside the filter for clarity) ---
    const designation = userData.POSITION_DESIGNATION;
    if (designation === 'Zonal Head') {
      initialAccessList = ZonalHead;
    } else if (designation === 'Branch Head' && userData.BRANCHTYPE === "su") {
      initialAccessList = suHead;
    } else if (designation === 'Branch Head' || designation === 'Branch Officer') {
      initialAccessList = branchHead; // Using branchHead array (or ZonalHead as per your choice)
    } else if (designation === 'Vertical Head') {
      initialAccessList = verticalHead;
    } else {
      initialAccessList = fallbackMenu;
    }

    if (!empId || !unitType || !role) {
      console.warn('Missing user data for API call. Using local fallback.');
      setFilteredTools(toolsSubmenu.filter(item => initialAccessList.includes(item.label)));
      return;
    }
    // --- End Fallback Logic ---


    setIsLoading(true);
    try {
      // API response is the object: { moduleWise: {}, accessibleTools: [...] }
      const apiResponseObject = await accessService.getAccessModuleWise(empId, unitType, role);

      const accessibleTools = apiResponseObject?.accessibleTools;

      if (!Array.isArray(accessibleTools)) {
        console.error("API response structure unexpected. Falling back to local list.");
        setFilteredTools(toolsSubmenu.filter(item => initialAccessList.includes(item.label)));
        setIsLoading(false);
        return;
      }

      const normalizedAccessList = accessibleTools
        .map(tool => tool.name)
        .map(apiName => {
          if (apiName.includes('Scorecard')) return 'Scorecard'; 
          if (apiName.includes('Transfer Tool')) return 'Transfer Tool - Transfers';
          return apiName;
        });

      setFilteredTools(
        toolsSubmenu.filter(item => normalizedAccessList.includes(item.label))
      );

    } catch (error) {
      console.error('Error fetching tool access:', error);
      setFilteredTools(toolsSubmenu.filter(item => initialAccessList.includes(item.label)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetTools();
  }, [fetchAndSetTools]);

  const handleToolsClick = () => {
    setShowToolsSubmenu(!showToolsSubmenu);

    setActiveItem('tools');
  };

  const handleHomeClick = () => {
    setActiveItem('home');
    setShowToolsSubmenu(false);
    navigate('/welcome');
  };

  const handleSubmenuClick = (path) => {
    navigate(path);
    setShowToolsSubmenu(false);
  };

  return (
    <div className="left-navigation">
      <div className="nav-menu">
        <div
          className={`nav-item ${activeItem === 'home' ? 'active' : ''}`}
          onClick={handleHomeClick}
        >
          <div className="nav-icon"><img src={dashboardIcon} alt={''} /></div>
          <div className="nav-label">Home</div>
        </div>

        <div
          className={`nav-item ${activeItem === 'tools' ? 'active' : ''}`}
          onClick={handleToolsClick}
        >
          <div className="nav-icon"><img src={toolIcon} alt={''} /></div>
          <div className="nav-label">My Tools</div>
        </div>

        {showToolsSubmenu && (
          <div className="submenu">
            {filteredTools.map((item) => (
              <div
                key={item.id}
                className="submenu-item"
                onClick={() => handleSubmenuClick(item.path)}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}

        <div
          className={`nav-item ${activeItem === 'survey' ? 'active' : ''}`}
          onClick={() => setActiveItem('survey')}
        >
          <div className="nav-icon"><img src={toolIcon} alt={''} /></div>
          <div className="nav-label">Survey</div>
        </div>
      </div>
    </div>
  );
};

export default LeftNavigation;