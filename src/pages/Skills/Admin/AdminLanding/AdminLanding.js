import React from 'react';
// import { useNavigate } from 'react-router-dom'; // Uncomment when routes are ready
import { BackButton, IconTab } from '../../../../components/common';
import { HiFolder, HiDocumentText, HiCog, HiClipboardList } from 'react-icons/hi';
import { FaFileAlt, FaFileInvoice, FaCog } from 'react-icons/fa';
import { BsFileEarmarkText, BsGear } from 'react-icons/bs';
import { AiOutlineFileText, AiOutlineReload } from 'react-icons/ai';
import './AdminLanding.css';

const AdminLanding = () => {
  // const navigate = useNavigate(); // Uncomment when routes are ready

  const adminMenuItems = [
    {
      label: 'Update skills',
      icon: <HiFolder />,
      iconColor: '#ffc107',
      path: '/skills/admin/update-skills',
    },
    {
      label: 'Update sub-skills',
      icon: <HiFolder />,
      iconColor: '#ffc107',
      path: '/skills/admin/update-sub-skills',
    },
    {
      label: 'Manage questionnaire',
      icon: <AiOutlineFileText />,
      iconColor: '#28a745',
      path: '/skills/admin/manage-questionnaire',
    },
    {
      label: 'Manage assessment',
      icon: <BsFileEarmarkText />,
      iconColor: '#007bff',
      path: '/skills/admin/manage-assessment',
    },
    {
      label: 'Manage Files',
      icon: <BsFileEarmarkText />,
      iconColor: '#007bff',
      path: '/skills/admin/manage-files',
    },
    {
      label: 'Generate detailed report',
      icon: <HiClipboardList />,
      iconColor: '#dc3545',
      path: '/skills/admin/generate-detailed-report',
    },
    {
      label: 'Generate IDPs',
      icon: <AiOutlineReload />,
      iconColor: '#17a2b8',
      path: '/skills/admin/generate-idps',
    },
    {
      label: 'Set configurations',
      icon: <HiCog />,
      iconColor: '#fd7e14',
      path: '/skills/admin/set-configuration',
    },
    {
      label: 'Status Dashboard',
      icon: <HiClipboardList />,
      iconColor: '#dc3545',
      path: '/skills/admin/status-dashboard',
    },
    {
      label: 'Skill Gap Analysis Dashboard',
      icon: <HiClipboardList />,
      iconColor: '#dc3545',
      path: '/skills/admin/skill-gap-analysis',
    },
    {
      label: 'Faculty Dashboard',
      icon: <HiClipboardList />,
      iconColor: '#dc3545',
      path: '/skills/admin/faculty-dashboard',
    },
    {
      label: 'Employee Assessment Status',
      icon: <HiClipboardList />,
      iconColor: '#dc3545',
      path: '/skills/admin/employee-assessment-status',
    },
  ];

  const handleItemClick = (path) => {
    console.log('Navigating to:', path);
    // navigate(path); // Uncomment when routes are ready
  };

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="admin-landing-header mb-4">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 mt-3">
          Skill Profiler Admin Panel
        </h1>
      </div>

      {/* Grid Section */}
      <div className="admin-landing-grid">
        {adminMenuItems.map((item, index) => (
          <IconTab
            key={index}
            icon={item.icon}
            label={item.label}
            iconColor={item.iconColor}
            onClick={() => handleItemClick(item.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminLanding;
