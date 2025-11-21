import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ExceptionsList.css';
import { ExceptionListTable } from '../../../components/Appraisal';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';

export default function ExceptionsList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const financialYear = searchParams.get('financialYear');
  const quarter = searchParams.get('quarter');
  const appraisalPeriod = searchParams.get('appraisalPeriod');

  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    if (!fy) {
      return new Date().getFullYear().toString();
    }
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // React Query to fetch exception dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exceptionQuarterlyVerify', financialYear, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getExceptionQuarterlyVerify({
        fy: extractYear(financialYear),
        quarter: quarter,
        empNo: empNo,
      }),
    enabled: !!empNo, // Only run query if empNo is available
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch exception data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  console.log(data);

const exceptionListData =
  data?.result != null
    ? data?.result
        .map((item) => ({
          exceptionId: item.CUST_TICKET_ID,
          custTicketId: item.CUST_TICKET_ID,
          urlId: item.P_URL_ID,

          employee: {
            empNo: item.EC_NUMBER,
            name: item.EMP_NAME,
            branch: item.BRNAME,
            primaryRole: item.PRIMARY_ROLE,
            appraiser: item.REP_NAME,
            zone: item.ZNNAME,
          },

          exceptionDescription: item.FINAL_APPEAL_STATUS,
          preExceptionScore: item.TOTAL_SCORE,
          postExceptionScore: item.TOTAL_FINAL_SCORE,
          exceptionStatus: item.STATUS,
        }))
        // Apply filters here
        .filter((item) => {
          const f = filters;

          return (
            (f.employee === '' || item.employee.name === f.employee) &&
            (f.primaryRole === '' || item.employee.primaryRole === f.primaryRole) &&
            (f.branch === '' || item.employee.branch === f.branch) &&
            (f.exceptionStatus === '' || item.exceptionStatus === f.exceptionStatus)
          );
        })
    : [];


  const buildQuarterDateRange = (fyLabel, quarterLabel) => {
    if (!fyLabel || !quarterLabel) return '';
    const yearString = extractYear(fyLabel);
    const baseYear = yearString ? parseInt(yearString, 10) : NaN;
    if (!baseYear) return '';

    switch (quarterLabel) {
      case 'Q1':
        return `01 Apr ${baseYear} - 30 Jun ${baseYear}`;
      case 'Q2':
        return `01 Jul ${baseYear} - 30 Sep ${baseYear}`;
      case 'Q3':
        return `01 Oct ${baseYear} - 31 Dec ${baseYear}`;
      case 'Q4':
        return `01 Jan ${baseYear + 1} - 31 Mar ${baseYear + 1}`;
      default:
        return '';
    }
  };

  const handleReviewException = (exception) => {
    navigate('/appraisal/review-quarterly-exception', {
      state: {
        financialYear,
        quarter,
        appraisalPeriod,
        dateRange: buildQuarterDateRange(financialYear, quarter),
        employee: {
          empNo: exception.employee.empNo,
          employeeName: exception.employee.name,
          branch: exception.employee.branch,
          primaryRole: exception.employee.primaryRole,
          appraiser: exception.employee.appraiser,
          zone: exception.employee.zone,
        },
        role: 'APPRAISER',
        roleName: 'APPRAISER',
        roleId: 'APPRAISER',
        custTicketId: exception.custTicketId,
        exceptionId: exception.exceptionId,
        urlId: exception.urlId,
      },
    });
  };

  const [filters, setFilters] = useState({
    employee: '',
    primaryRole: '',
    branch: '',
    exceptionStatus: '',
  });

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search filters:', filters);
  };

  const handleClearFilter = () => {
  setFilters({
    employee: '',
    primaryRole: '',
    branch: '',
    exceptionStatus: '',
  });
};


  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exception Resolution</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exceptions List</h1>
      </div>

      {/* Filter Panel */}
     {/* Filter Panel */}
<div className="filter-panel mt-4 d-flex align-items-end gap-3">

  {/* Employee Filter */}
  <div className="filter-group">
    <label className="filter-label text-primary fw-semibold">Employee</label>
    <select
      className="form-select filter-select"
      value={filters.employee}
      onChange={(e) => handleFilterChange('employee', e.target.value)}
    >
      <option value="">-Select-</option>
      {data?.EMP_NAME?.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  </div>

  {/* Primary Role Filter */}
  <div className="filter-group">
    <label className="filter-label text-primary fw-semibold">Primary Role</label>
    <select
      className="form-select filter-select"
      value={filters.primaryRole}
      onChange={(e) => handleFilterChange('primaryRole', e.target.value)}
    >
      <option value="">-Select-</option>
      {data?.PRIMARY_ROLE?.map((role) => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  </div>

  {/* Branch Filter */}
  <div className="filter-group">
    <label className="filter-label text-primary fw-semibold">Branch</label>
    <select
      className="form-select filter-select"
      value={filters.branch}
      onChange={(e) => handleFilterChange('branch', e.target.value)}
    >
      <option value="">-Select-</option>
      {data?.BRANCH_NAME?.map((branch) => (
        <option key={branch} value={branch}>{branch}</option>
      ))}
    </select>
  </div>

  {/* Exception Status Filter */}
  <div className="filter-group">
    <label className="filter-label text-primary fw-semibold">Exception Status</label>
    <select
      className="form-select filter-select"
      value={filters.exceptionStatus}
      onChange={(e) => handleFilterChange('exceptionStatus', e.target.value)}
    >
      <option value="">-Select-</option>
      {data?.TICKET_STATUS?.map((status) => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  </div>

  {/* Buttons */}
  <div className="filter-actions d-flex gap-2">
    <button
      type="button"
      className="btn btn-primary search-btn"
      onClick={handleSearch}
    >
      Search
    </button>

    <button
      type="button"
      className="btn btn-outline-primary clear-filter-btn"
      onClick={handleClearFilter}
    >
      Clear Filter
    </button>
  </div>
</div>


      <ExceptionListTable
        exceptionListData={exceptionListData}
        onReviewException={handleReviewException}
      />
    </div>
  );
}
