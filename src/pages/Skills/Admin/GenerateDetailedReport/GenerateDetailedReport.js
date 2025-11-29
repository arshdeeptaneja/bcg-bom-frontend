import React, { useState, useMemo } from 'react';
import { BackButton } from '../../../../components/common';
import { FaDownload, FaEnvelope } from 'react-icons/fa';
import { HiArrowDownTray } from 'react-icons/hi2';
import { BiSearch } from 'react-icons/bi';
import './GenerateDetailedReport.css';

// Dummy data matching the image
const dummyEmployeeData = [
  {
    sNo: 1,
    pfId: '35723',
    employeeName: 'VENKATARAMAN M',
    scale: '3',
    office: 'CO',
    region: 'CENTRAL OFFICE',
    location: 'VIGILANCE DEPARTMENT',
    progress: 'IN PROGRESS',
    dateOfInitiation: '09/09/2025',
    dateOfCompletion: '',
    skillGroupsSelected: 'Branch & Centralized Operations',
  },
  {
    sNo: 2,
    pfId: '35723',
    employeeName: 'VENKATARAMAN M',
    scale: '3',
    office: 'CO',
    region: 'CENTRAL OFFICE',
    location: 'VIGILANCE DEPARTMENT',
    progress: 'IN PROGRESS',
    dateOfInitiation: '09/09/2025',
    dateOfCompletion: '',
    skillGroupsSelected: 'IIS Audit',
  },
  {
    sNo: 3,
    pfId: '35723',
    employeeName: 'VENKATARAMAN M',
    scale: '3',
    office: 'CO',
    region: 'CENTRAL OFFICE',
    location: 'VIGILANCE DEPARTMENT',
    progress: 'IN PROGRESS',
    dateOfInitiation: '09/09/2025',
    dateOfCompletion: '',
    skillGroupsSelected: 'Customer Sales, Service and Experience',
  },
];

const GenerateDetailedReport = () => {
  const [filters, setFilters] = useState({
    pfId: '',
    region: 'All',
    scale: 'All',
    assessment: 'DEC 2025',
    status: 'All',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDownload = () => {
    console.log('Download clicked');
    // Handle download logic
  };

  const handleEmail = () => {
    console.log('Email clicked');
    // Handle email logic
  };

  const handleEmailLogs = () => {
    console.log('Email Logs clicked');
    // Handle email logs logic
  };

  // Filter employees based on selected filters
  const filteredEmployees = useMemo(() => {
    let filtered = [...dummyEmployeeData];

    if (filters.pfId) {
      filtered = filtered.filter((emp) =>
        emp.pfId.toLowerCase().includes(filters.pfId.toLowerCase())
      );
    }

    if (filters.region !== 'All') {
      filtered = filtered.filter((emp) => emp.region === filters.region);
    }

    if (filters.scale !== 'All') {
      filtered = filtered.filter((emp) => emp.scale === filters.scale);
    }

    return filtered;
  }, [filters.pfId, filters.region, filters.scale]);

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="detailed-report-header d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0">Detailed list of employees</h1>
        </div>
        <div className="action-buttons-group d-flex gap-2">
          <button className="btn btn-action" onClick={handleDownload}>
            <FaDownload className="me-2" />
            Download
          </button>
          <button className="btn btn-action" onClick={handleEmail}>
            <FaEnvelope className="me-2" />
            E-Mail
          </button>
          <button className="btn btn-action" onClick={handleEmailLogs}>
            <HiArrowDownTray className="me-2" />
            Email Logs
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="detailed-report-filters bg-white rounded p-3 mb-4">
        <div className="row g-3 mb-3">
          {/* First Row */}
          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">PF Id</label>
            <div className="position-relative">
              <BiSearch className="filter-search-icon" />
              <input
                type="text"
                className="form-control filter-input"
                placeholder="Search by PF ID"
                value={filters.pfId}
                onChange={(e) => handleFilterChange('pfId', e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Region</label>
            <div className="position-relative">
              <select
                className="form-select filter-select"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="All">All</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
              {filters.region !== 'All' && (
                <span
                  className="filter-clear-icon"
                  onClick={() => handleFilterChange('region', 'All')}
                >
                  ×
                </span>
              )}
            </div>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Scale</label>
            <div className="position-relative">
              <select
                className="form-select filter-select"
                value={filters.scale}
                onChange={(e) => handleFilterChange('scale', e.target.value)}
              >
                <option value="All">All</option>
                <option value="Scale 1">Scale 1</option>
                <option value="Scale 2">Scale 2</option>
                <option value="Scale 3">Scale 3</option>
              </select>
              {filters.scale !== 'All' && (
                <span
                  className="filter-clear-icon"
                  onClick={() => handleFilterChange('scale', 'All')}
                >
                  ×
                </span>
              )}
            </div>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Select Assessment</label>
            <input
              type="text"
              className="form-control filter-input"
              value={filters.assessment}
              onChange={(e) => handleFilterChange('assessment', e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Status</label>
            <input
              type="text"
              className="form-control filter-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Start Date</label>
            <input
              type="date"
              className="form-control filter-input filter-date-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="row g-3">
          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">End Date</label>
            <input
              type="date"
              className="form-control filter-input filter-date-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="detailed-report-table-container">
        <table className="table-primary detailed-report-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>PF Id</th>
              <th>Employee name</th>
              <th>Scale</th>
              <th>Office</th>
              <th>Region</th>
              <th>Location</th>
              <th>Progress</th>
              <th>Date of initiation</th>
              <th>Date of Completion</th>
              <th>Skill groups selected</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.sNo}>
                  <td>{employee.sNo}</td>
                  <td>{employee.pfId}</td>
                  <td>{employee.employeeName}</td>
                  <td>{employee.scale}</td>
                  <td>{employee.office}</td>
                  <td>{employee.region}</td>
                  <td>{employee.location}</td>
                  <td>
                    <span className="progress-badge">{employee.progress}</span>
                  </td>
                  <td>{employee.dateOfInitiation}</td>
                  <td>{employee.dateOfCompletion || '-'}</td>
                  <td>{employee.skillGroupsSelected}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center detailed-report-empty-message">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenerateDetailedReport;
