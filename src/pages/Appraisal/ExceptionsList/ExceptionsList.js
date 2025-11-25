import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { BackButton } from '../../../components/common';
import { ExceptionListTable } from '../../../components/Appraisal';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import './ExceptionsList.css';

export default function ExceptionsList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const financialYear = searchParams.get('financialYear');
  const quarter = searchParams.get('quarter');
  const appraisalPeriod = searchParams.get('appraisalPeriod');

  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty(
    'empNo',
    employeeDetails?.currentUser?.[0]?.EMP_ID || ''
  );

  /** Extract base year from "FY 2025-26" → 2025 */
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  /** Fetch exceptions */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exceptionQuarterlyVerify', financialYear, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getExceptionQuarterlyVerify({
        fy: extractYear(financialYear),
        quarter,
        empNo,
      }),
    enabled: !!empNo,
  });

  useEffect(() => {
    if (isError) {
      toast.error(
        `Failed to fetch exception data: ${
          error?.message || 'Unknown error'
        }`
      );
    }
  }, [isError, error]);

  /** ----------------------------
   *  CORRECT FIELD MAPPING
   * ---------------------------- */
  const exceptionListData =
    data?.result?.map((item) => ({
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
    })) || [];

  /** Build quarter date label */
  const buildQuarterDateRange = (fyLabel, quarterLabel) => {
    const year = parseInt(extractYear(fyLabel), 10);
    if (!year) return '';

    switch (quarterLabel) {
      case 'Q1':
        return `01 Apr ${year} - 30 Jun ${year}`;
      case 'Q2':
        return `01 Jul ${year} - 30 Sep ${year}`;
      case 'Q3':
        return `01 Oct ${year} - 31 Dec ${year}`;
      case 'Q4':
        return `01 Jan ${year + 1} - 31 Mar ${year + 1}`;
      default:
        return '';
    }
  };

  /** Handle Review button */
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

  /** Filters */
  const [filters, setFilters] = useState({
    employee: '',
    primaryRole: '',
    branch: '',
    exceptionStatus: '',
  });

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleClearFilter = () => {
    setFilters({
      employee: '',
      primaryRole: '',
      branch: '',
      exceptionStatus: '',
    });
  };

  const handleSearch = () => {
    console.log('Search filters:', filters);
  };

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found.</div>;
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Exception Resolution
          </h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
          Exceptions List
        </h1>
      </div>

      {/* FILTER PANEL */}
      <div className="filter-panel mt-4 d-flex align-items-end gap-3">

        {/* Employee */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">
            Employee
          </label>
          <select
            className="form-select filter-select"
            value={filters.employee}
            onChange={(e) =>
              handleFilterChange('employee', e.target.value)
            }
          >
            <option value="">-Select-</option>
            {data?.EMP_NAME?.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Role */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">
            Primary Role
          </label>
          <select
            className="form-select filter-select"
            value={filters.primaryRole}
            onChange={(e) =>
              handleFilterChange('primaryRole', e.target.value)
            }
          >
            <option value="">-Select-</option>
            {data?.PRIMARY_ROLE?.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Branch */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">
            Branch
          </label>
          <select
            className="form-select filter-select"
            value={filters.branch}
            onChange={(e) =>
              handleFilterChange('branch', e.target.value)
            }
          >
            <option value="">-Select-</option>
            {data?.BRANCH_NAME?.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Exception Status */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">
            Exception Status
          </label>
          <select
            className="form-select filter-select"
            value={filters.exceptionStatus}
            onChange={(e) =>
              handleFilterChange('exceptionStatus', e.target.value)
            }
          >
            <option value="">-Select-</option>
            {data?.TICKET_STATUS?.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
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

      {/* TABLE */}
      <ExceptionListTable
        exceptionListData={exceptionListData}
        onReviewException={handleReviewException}
      />
    </div>
  );
}
