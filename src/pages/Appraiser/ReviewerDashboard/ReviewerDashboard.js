/**
 * The `ReviewerDashboard` function in JavaScript is a React component that displays a
 * dashboard for reviewers to check in on their assigned appraisals, including filtering options and
 * summary information.
 * @returns The code is exporting a React functional component named `ReviewerDashboard`. This
 * component renders a dashboard for a reviewer to check in on their assigned appraisals for a
 * specific financial year, appraisal period, and quarter.
 */
import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { BackButton } from '../../../components/common';
import './ReviewerDashboard.css';

import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';

const STATUS_MAPPING = {
  complete_reva: 'Pending at Acceptor',
  complete_self: 'Pending at Appraiser',
  complete_repa: 'Pending at Reviewer',
  pending: 'Pending at Appraisee',
  submitted_appraisal: 'Completed',
  completed: 'Completed',
  complete_ac: 'Completed',
};

const getDisplayStatus = (backendStatus) => {
  if (!backendStatus) return 'Pending';
  const normalized = String(backendStatus).toLowerCase();
  return STATUS_MAPPING[normalized] || backendStatus;
};

const extractYear = (fyLabel) => {
  if (!fyLabel) return new Date().getFullYear().toString();
  const match = fyLabel.match(/FY\s+(\d{4})/i);
  return match ? match[1] : fyLabel;
};

const buildAdditionalRoles = (r) => {
  return [r?.ADDITIONAL_ROLE_2, r?.ADDITIONAL_ROLE_3, r?.ADDITIONAL_ROLE_4]
    .filter(Boolean)
    .map((x) => String(x));
};

const buildDateRange = (start, end) => {
  if (!start || !end) return '';
  return `${start} - ${end}`;
};

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();

  const authEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  // -------------------- FILTER STATE -------------------------
  const [filters, setFilters] = useState({
    empNo: '',
    empName: '',
    primaryRole: '',
    branch: '',
    status: '',
  });

  const {
    empNo: filterEmpId,
    empName: filterName,
    primaryRole: filterRole,
    branch: filterBranch,
    status: filterStatus,
  } = filters;

  // -------------------- API CALL -------------------------
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reviewerCheckInDashboard', financialYear, quarter, authEmpNo],

    queryFn: () =>
      appraisalAPI.getReviewerCheckInDashboard({
        empNo: authEmpNo,
        financialYear: extractYear(financialYear),
      }),

    enabled: Boolean(authEmpNo && financialYear && quarter),
  });

  // -------------------- RESPONSE DATA -------------------------
  const scoreTable = data?.appraisal_score_dash || [];
  const filterData = data?.filter_data || {};

  // -------------------- CLIENT-SIDE FILTERING -------------------------
  const filteredReportees = useMemo(() => {
    const reportees = data?.results || [];
    return reportees.filter((record) => {
      // Filter by Employee Number
      if (filterEmpId && !String(record?.EMP_ID).includes(filterEmpId)) {
        return false;
      }

      // Filter by Employee Name
      if (
        filterName &&
        !String(record?.EMP_NAME).toLowerCase().includes(filterName.toLowerCase())
      ) {
        return false;
      }

      // Filter by Primary Role
      if (filterRole && String(record?.MAIN_ROLE).toLowerCase() !== filterRole.toLowerCase()) {
        return false;
      }

      // Filter by Branch
      if (
        filterBranch &&
        !String(record?.ORGANIZATION || record?.ORGANISATION)
          .toLowerCase()
          .includes(filterBranch.toLowerCase())
      ) {
        return false;
      }

      // Filter by Status
      if (filterStatus && getDisplayStatus(record?.APPRAISAL_STATUS) !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [data?.results, filterEmpId, filterName, filterRole, filterBranch, filterStatus]);

  // -------------------- FILTER HANDLERS -------------------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((old) => ({ ...old, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      empNo: '',
      empName: '',
      primaryRole: '',
      branch: '',
      status: '',
    });
  };

  // -------------------- LOADING / ERROR -------------------------
  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5 text-danger fw-bold">
          Missing financial year, appraisal period, or quarter
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="pageWrapper">
        <LoadingSpinner />
      </div>
    );

  if (isError)
    return (
      <div className="pageWrapper">
        <p className="text-center text-danger fw-bold mt-5">Failed to load reportee data</p>
        <p className="text-center text-muted">{error?.message}</p>
      </div>
    );

  if (data?.text) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5 text-danger fw-bold">{data.text}</div>
      </div>
    );
  }

  // -------------------- UI -------------------------
  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex justify-content-between align-items-center">
        <div className="headline d-flex align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Reviewer Dashboard</h1>
        </div>
        {appraisalPeriod === 'Annual' ? (
          <h4 className="text-muted fw-bold mb-0">{financialYear} Annual Check-In</h4>
        ) : (
          <h4 className="text-muted fw-bold mb-0">
            {quarter}, {financialYear} Quarterly Check-In
          </h4>
        )}
      </div>

      {/* ---------------- FILTER BAR ---------------- */}
      <div className="row g-3 mb-4 appraiser-filter-bar">
        <div className="col-md-2">
          <label className="form-label fw-semibold">EMPLOYEE NUMBER</label>
          <select
            name="empNo"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.empNo}
          >
            <option value="">-Select-</option>
            {filterData.EC_NUMBER_ARRAY?.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">EMPLOYEE NAME</label>
          <select
            name="empName"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.empName}
          >
            <option value="">-Select-</option>
            {filterData.EMP_NAME_ARRAY?.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">PRIMARY ROLE</label>
          <select
            name="primaryRole"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.primaryRole}
          >
            <option value="">-Select-</option>
            {filterData.PRIMARY_ROLE_ARRAY?.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">BRANCH</label>
          <select
            name="branch"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.branch}
          >
            <option value="">-Select-</option>
            {filterData.BRANCH_ARRAY?.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">STATUS</label>
          <select
            name="status"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.status}
          >
            <option value="">-Select-</option>
            {filterData.STATUS_ARRAY?.map((x) => (
              <option key={getDisplayStatus(x)} value={getDisplayStatus(x)}>
                {getDisplayStatus(x)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button className="btn primary-button w-100" onClick={handleReset}>
            Reset <i className="bi bi-arrow-repeat ms-1"></i>
          </button>
        </div>
      </div>

      {/* ---------------- EMPLOYEE CARDS ---------------- */}
      <div className="employee-appraisal-cards mt-4">
        {filteredReportees.length === 0 && (
          <p className="text-center text-muted fw-bold mt-5">No reportees found.</p>
        )}

        {filteredReportees.map((record, index) => {
          const employeeModel = new EmployeeModel({
            empNo: record?.EMP_ID,
            employeeName: record?.EMP_NAME,
            url: record?.URL_ID,
            appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
            employeeScale: appraisalPeriod === 'Annual' ? record?.EMP_SCALE : record?.SCALE,
            additionalRoles: buildAdditionalRoles(record),
            branch: record?.ORGANIZATION || record?.ORGANISATION,
            appraiser: record?.REPORTING_AUTHORITY_NO || authEmpNo,
            primaryRole: appraisalPeriod === 'Annual' ? record?.PRIMARY_ROLE : record?.MAIN_ROLE,
          });

          const dateRange = buildDateRange(
            appraisalPeriod === 'Annual' ? record?.ROLE_START_DATE : record?.STARTDATE,
            appraisalPeriod === 'Annual' ? record?.ROLE_END_DATE : record?.ENDDATE
          );

          return (
            <EmployeeAppraisalCard
              key={index}
              employee={employeeModel}
              dateRange={dateRange}
              primaryRole={appraisalPeriod === 'Annual' ? record?.PRIMARY_ROLE : record?.MAIN_ROLE}
              additionalRoles={buildAdditionalRoles(record)}
              organization={record?.ORGANIZATION || record?.ORGANISATION}
              userType="reviewer"
              appraisalStatus={getDisplayStatus(record?.APPRAISAL_STATUS || record?.STATUS)}
              exceptionStatus={record?.EXCEPTION_STATUS || 'NOT CREATED'}
              scoreData={scoreTable}
              isCheckInDisabled={
                record?.APPRAISAL_STATUS !== 'complete_repa' && record?.STATUS !== 'complete_repa'
              }
              onAddCheckIn={() =>
                appraisalPeriod === 'Annual'
                  ? navigate('/appraisal/annual/reviewer-review', {
                      state: {
                        financialYear,
                        appraisalPeriod,
                        quarter,
                        page_type: 'reva',
                        dateRange,
                        employee: employeeModel,
                        organizationName: record?.ORGANIZATION,
                        urlId: record?.ID,
                        roleType: 'reviewer',
                        pageType: 'review',
                        intent: 'Review',
                        appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
                      },
                    })
                  : navigate('/quarterly/quaterly-reviewer-check-in', {
                      state: {
                        financialYear,
                        appraisalPeriod,
                        quarter,
                        page_type: 'reva',
                        dateRange,
                        employee: employeeModel,
                        organizationName: record?.ORGANIZATION,
                        urlId: record?.URL_ID,
                        roleType: 'reviewer',
                        pageType: 'review',
                        intent: 'Review',
                        appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
                      },
                    })
              }
              onViewSummary={() => {}}
              onAddException={() => {}}
            />
          );
        })}
      </div>
    </div>
  );
}
