/**
 * The `AppraiserCheckIn` function is a React component that displays an appraiser check-in dashboard
 * with filters and employee appraisal cards based on fetched data.
 * @returns The `AppraiserCheckIn` component is being returned. It is a functional component that
 * displays an Appraiser Check-In Dashboard. The component fetches data using React Query based on
 * financial year, appraisal period, and quarter. It then applies filters to the data and displays
 * Employee Appraisal Cards based on the filtered results. The component also includes a filter panel
 * with options to filter by employee number
 */
import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AppraiserCheckIn.css';
import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';

// Status mapping for display transformation
const STATUS_MAPPING = {
  complete_reva: 'Completed',
  complete_self: 'Pending at Appraiser',
  complete_repa: 'Pending at Reviewer',
  pending: 'Pending at Appraisee',
  submitted_appraisal: 'Completed',
  completed: 'Completed',
  complete_ac: 'Completed',
};

// Helper function to get display status from backend status
const getDisplayStatus = (backendStatus) => {
  if (!backendStatus) return 'Pending';
  const status = backendStatus.toLowerCase();
  return STATUS_MAPPING[status] || 'Pending';
};

// Helper function to get backend status from display status
const getBackendStatus = (displayStatus) => {
  const entry = Object.entries(STATUS_MAPPING).find(([key, value]) => value === displayStatus);
  return entry ? entry[0] : '';
};

/**
 *
 * @param {Object} props - The component props.
 * @param {string} props.financialYear - The financial year.
 * @param {string} props.appraisalPeriod - The appraisal period.
 * @param {string} props.quarter - The quarter.
 * @returns
 */
export default function AppraiserCheckIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

  // Extract empNo from AuthContext
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '36663');

  // Helper function to extract year from "FY 2024-25" format
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Filter state
  const [filters, setFilters] = useState({
    empNumber: '',
    employeeName: '',
    primaryRole: '',
    appraiser: '',
    status: '',
  });

  // Filtered results state
  const [filteredResults, setFilteredResults] = useState([]);

  // React Query to fetch dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['appraiseeCheckInDashboard', financialYear, appraisalPeriod, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getAppraiserCheckInDashboard({
        empNo: empNo,
        financialYear: extractYear(financialYear),
        quarter: quarter,
        appraisalPeriod: appraisalPeriod,
      }),
    enabled: !!empNo && !!financialYear && !!appraisalPeriod && !!quarter,
  });

  console.log('Fetched Appraiser Check-In Dashboard Data:', data);
  // Apply filters whenever filter state or data changes
  useEffect(() => {
    if (!data || !data.results) {
      setFilteredResults([]);
      return;
    }

    let results = [...data.results];

    // Apply Employee Number filter
    if (filters.empNumber) {
      results = results.filter((emp) => emp.EMP_ID === filters.empNumber);
    }

    // Apply Employee Name filter
    if (filters.employeeName) {
      results = results.filter((emp) => emp.EMP_NAME === filters.employeeName);
    }

    // Apply Primary Role filter
    if (filters.primaryRole) {
      results = results.filter((emp) => emp.MAIN_ROLE === filters.primaryRole);
    }

    // Apply Appraiser filter
    if (filters.appraiser) {
      results = results.filter((emp) => emp.REPORTING_AUTHORITY_NAME === filters.appraiser);
    }

    // Apply Status filter
    if (filters.status) {
      const backendStatus = getBackendStatus(filters.status);
      results = results.filter((emp) => {
        const empStatus = emp.APPRAISAL_STATUS ? emp.APPRAISAL_STATUS.toLowerCase() : '';
        return empStatus === backendStatus;
      });
    }

    setFilteredResults(results);
  }, [filters, data]);

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Handle reset filters
  const handleReset = () => {
    setFilters({
      empNumber: '',
      employeeName: '',
      primaryRole: '',
      appraiser: '',
      status: '',
    });
  };

  // Get unique status options from filter_data with display transformation
  const getStatusOptions = () => {
    if (!data || !data.filter_data || !data.filter_data.APPRAISAL_STATUS_ARRAY) {
      return [];
    }
    return [...new Set(data.filter_data.APPRAISAL_STATUS_ARRAY)].map((status) => ({
      value: getDisplayStatus(status),
      label: getDisplayStatus(status),
    }));
  };

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div>No financial year, appraisal period, or quarter found</div>
      </div>
    );
  }

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Appraiser Check-In Dashboard
            </h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraiser Check-In Dashboard
          </h1>
        </div>
        <h2 className="text-muted fw-bold mb-0 ms-3">
          {`${
            appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
          } ${financialYear} ${appraisalPeriod} Check-In`}
        </h2>
      </div>

      {/* Filter Panel */}
      <div className="filter-panel mt-4 d-flex align-items-end gap-3">
        {/* Employee Number Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">EMPLOYEE NUMBER</label>
          <select
            className="form-select filter-select"
            value={filters.empNumber}
            onChange={(e) => handleFilterChange('empNumber', e.target.value)}
          >
            <option value="">-Select-</option>
            {data?.filter_data?.EC_NUMBER_ARRAY?.map((empNo, index) => (
              <option key={index} value={empNo}>
                {empNo}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Name Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">EMPLOYEE NAME</label>
          <select
            className="form-select filter-select"
            value={filters.employeeName}
            onChange={(e) => handleFilterChange('employeeName', e.target.value)}
          >
            <option value="">-Select-</option>
            {data?.filter_data?.EMP_NAME_ARRAY?.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Role Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">PRIMARY ROLE</label>
          <select
            className="form-select filter-select"
            value={filters.primaryRole}
            onChange={(e) => handleFilterChange('primaryRole', e.target.value)}
          >
            <option value="">-Select-</option>
            {data?.filter_data?.MAIN_ROLE_ARRAY?.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Appraiser Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">APPRAISER</label>
          <select
            className="form-select filter-select"
            value={filters.appraiser}
            onChange={(e) => handleFilterChange('appraiser', e.target.value)}
          >
            <option value="">-Select-</option>
            {data?.filter_data?.REPORTING_AUTHORITY_NAME_ARRAY?.map((appraiser, index) => (
              <option key={index} value={appraiser}>
                {appraiser}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">STATUS</label>
          <select
            className="form-select filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">-Select-</option>
            {getStatusOptions().map((status, index) => (
              <option key={index} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="filter-actions">
          <button type="button" className="btn btn-outline-primary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {/* Employee Appraisal Cards */}
      <div className="employee-appraisal-cards">
        {filteredResults.length === 0 && Object.values(filters).some((f) => f !== '') ? (
          <div className="text-center mt-5">
            <p className="text-muted fw-semibold">No employees match the selected filters</p>
          </div>
        ) : (
          filteredResults.map((employee, index) => (
            <EmployeeAppraisalCard
              key={employee.EMP_ID || index}
              employee={
                new EmployeeModel({
                  empNo: employee.EMP_ID || '',
                  employeeName: employee.EMP_NAME || '',
                  employeeScale: employee.SCALE || '',
                  roles:
                    employee.ADDITIONAL_ROLE_1 || employee.ADDITIONAL_ROLE_2
                      ? [employee.ADDITIONAL_ROLE_1, employee.ADDITIONAL_ROLE_2].filter(Boolean)
                      : [],
                  appraiser: employee.REPORTING_AUTHORITY_NAME || '',
                })
              }
              dateRange={
                employee.START_DATE && employee.END_DATE
                  ? `${employee.START_DATE} to ${employee.END_DATE}`
                  : ''
              }
              primaryRole={employee.MAIN_ROLE || ''}
              appraisalStatus={getDisplayStatus(employee.APPRAISAL_STATUS)}
              exceptionStatus="NOT CREATED"
              organization={employee.ORGANIZATION || ''}
              quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
              appraisalPeriod={appraisalPeriod}
              onAddCheckIn={() => {
                navigate('/appraisal/check-in-form', {
                  state: {
                    financialYear,
                    appraisalPeriod,
                    quarter,
                    dateRange:
                      employee.START_DATE && employee.END_DATE
                        ? `${employee.START_DATE} to ${employee.END_DATE}`
                        : '',
                    employee: {
                      empNo: employee.EMP_ID || '',
                      employeeName: employee.EMP_NAME || '',
                      employeeScale: employee.SCALE || '',
                      roles:
                        employee.ADDITIONAL_ROLE_1 || employee.ADDITIONAL_ROLE_2
                          ? [employee.ADDITIONAL_ROLE_1, employee.ADDITIONAL_ROLE_2].filter(Boolean)
                          : [],
                      primaryRole: employee.MAIN_ROLE || '',
                      appraiser: employee.REPORTING_AUTHORITY_NAME || '',
                      appraisalStatus:
                        employee.APPRAISAL_STATUS ||
                        employee.STATUS ||
                        employee.status ||
                        'pending',
                      pageType: 'repa',
                    },
                  },
                });
              }}
              onViewSummary={() => {}}
              onAddException={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
