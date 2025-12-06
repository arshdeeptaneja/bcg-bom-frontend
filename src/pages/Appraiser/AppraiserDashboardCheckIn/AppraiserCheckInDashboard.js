/**
 * The `AppraiserCheckInDashboard` function in JavaScript is a React component that displays a
 * dashboard for appraisers to check in on their reportees' appraisals, including filtering options and
 * summary information.
 * @returns The code is exporting a React functional component named `AppraiserCheckInDashboard`. This
 * component renders a dashboard for an appraiser to check in on their reportees' appraisals for a
 * specific financial year, appraisal period, and quarter.
 */
import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { BackButton } from '../../../components/common';
import './AppraiserCheckInDashboard.css';

import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';

const STATUS_MAPPING = {
  complete_reva: 'Completed',
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

const pickNumericValue = (source, keys = []) => {
  if (!source) return NaN;
  for (const key of keys) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return NaN;
};

const computeAverageFromScoreTable = (scoreEntries) => {
  if (!Array.isArray(scoreEntries) || scoreEntries.length === 0) return 0;

  const total = scoreEntries.reduce((sum, entry) => {
    const value = Number(entry?.PERCENTAGE_SCORE ?? entry?.percentageScore ?? entry?.SCORE ?? 0);
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  return Number((total / scoreEntries.length).toFixed(2));
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

export default function AppraiserCheckInDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();

  const authEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  const isQuarterlyFlow = appraisalPeriod?.toLowerCase() === 'quarterly';

  // -------------------- FILTER STATE -------------------------
  const [filters, setFilters] = useState({
    empNo: '',
    empName: '',
    primaryRole: '',
    appraiser: '',
    status: '',
  });

  const {
    empNo: filterEmpId,
    empName: filterName,
    primaryRole: filterRole,
    appraiser: filterAppraiser,
    status: filterStatus,
  } = filters;

  // -------------------- API CALL -------------------------
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appraiserCheckInDashboard', financialYear, quarter, authEmpNo],

    queryFn: () =>
      appraisalAPI.getAppraiserCheckInDashboard({
        empNo: authEmpNo,
        //empNo: "38096",
        financialYear: extractYear(financialYear),
        quarter,
        appraisalPeriod: appraisalPeriod === 'Quarterly' ? 'quarter' : 'annual',
      }),

    enabled: Boolean(authEmpNo && financialYear && quarter),
  });

  // -------------------- RESPONSE DATA -------------------------
  const reportees = data?.results || [];
  const scoreTable = data?.appraisal_score_dash || [];
  const scoreSummary = data?.score_summary || {};
  const filterData = data?.filter_data || {};

  // -------------------- CLIENT-SIDE FILTERING -------------------------
  const filteredReportees = useMemo(() => {
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

      // Filter by Appraiser (Reporting Authority)
      if (
        filterAppraiser &&
        String(record?.REPORTING_AUTHORITY_NAME).toLowerCase() !== filterAppraiser.toLowerCase()
      ) {
        return false;
      }

      // Filter by Status
      if (filterStatus && getDisplayStatus(record?.APPRAISAL_STATUS) !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [reportees, filterEmpId, filterName, filterRole, filterAppraiser, filterStatus]);

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
      appraiser: '',
      status: '',
    });
  };

  // -------------------- SCORES -------------------------
  // const averageScore = useMemo(() => {
  //   const summaryAvg = pickNumericValue(scoreSummary, [
  //     "averageScore",
  //     "avgScore",
  //     "AVERAGE_SCORE",
  //   ]);
  //   return Number.isNaN(summaryAvg)
  //     ? computeAverageFromScoreTable(scoreTable)
  //     : summaryAvg;
  // }, [scoreSummary, scoreTable]);

  // const maxScore = useMemo(() => {
  //   const summaryMax = pickNumericValue(scoreSummary, [
  //     "maxScore",
  //     "MAX_SCORE",
  //   ]);
  //   if (!Number.isNaN(summaryMax)) return summaryMax;

  //   return scoreTable.reduce((maxValue, entry) => {
  //     const val = Number(entry?.MAX_SCORE ?? entry?.WEIGHTAGE ?? 0);
  //     return Number.isNaN(val) ? maxValue : Math.max(maxValue, val);
  //   }, 0);
  // }, [scoreSummary, scoreTable]);

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

  // if (!isQuarterlyFlow) {
  //   return (
  //     <div className="pageWrapper">
  //       <div className="text-center mt-5 text-danger fw-bold">
  //         This route is only for quarterly flows.
  //       </div>
  //     </div>
  //   );
  // }

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

  if (data.text) {
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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraiser Check-In Dashboard
          </h1>
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
          <label className="form-label fw-semibold">APPRAISER</label>
          <select
            name="appraiser"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.appraiser}
          >
            <option value="">-Select-</option>
            {filterData.REPORTING_AUTHORITY_NAME_ARRAY?.map((x) => (
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

      {/* ---------------- SUMMARY CARD ---------------- */}
      {/* <div className="summary-row border rounded-2 px-5 py-3 mt-3 d-flex justify-content-between align-items-end shadow-sm">
        <h2 className="text-muted fw-bold mb-0">Average Score for Quarter</h2>
        <div className="summary-card-content">
          <span className="fw-bold">Score:</span>
          <span className="text-primary ms-3">{averageScore}</span>
        </div>
        <div className="summary-card-content">
          <span className="fw-bold">Max Score:</span>
          <span className="text-primary ms-3">{maxScore}</span>
        </div>
      </div> */}

      {/* ---------------- EMPLOYEE CARDS ---------------- */}
      <div className="employee-appraisal-cards mt-4">
        {filteredReportees.length === 0 && (
          <p className="text-center text-muted fw-bold mt-5">No reportees found.</p>
        )}

        {console.log('appraisal period: ', appraisalPeriod)}
        {filteredReportees.map((record, index) => {
          const employeeModel = new EmployeeModel({
            empNo: record?.EMP_ID,
            employeeName: record?.EMP_NAME,
            url: record?.URL_ID,
            appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
            employeeScale: appraisalPeriod === 'Annual' ? record?.EMP_SCALE : record?.SCALE,
            additionalRoles: buildAdditionalRoles(record),
            branch: record?.ORGANIZATION || record?.ORGANISATION,
            appraiser: authEmpNo,
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
              userType="appraiser"
              appraisalStatus={getDisplayStatus(record?.APPRAISAL_STATUS || record?.STATUS)}
              exceptionStatus={record?.EXCEPTION_STATUS || 'NOT CREATED'}
              scoreData={scoreTable}
              isCheckInDisabled={
                employeeModel.appraisalStatus !== 'complete_self' &&
                employeeModel.appraisalStatus !== 'complete_self'
              }
              onAddCheckIn={() =>
                appraisalPeriod === 'Annual'
                  ? navigate('/appraisal/annual/appraiser-review', {
                      state: {
                        financialYear,
                        appraisalPeriod,
                        quarter,
                        page_type: 'repa',
                        dateRange,
                        employee: employeeModel,
                        organizationName: record?.ORGANIZATION,
                        urlId: record?.ID,
                        roleType: 'appraiser',
                        pageType: 'review',
                        intent: 'Review',
                        appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
                      },
                    })
                  : navigate('/quarterly/quaterly-appraisee-check-in', {
                      state: {
                        financialYear,
                        appraisalPeriod,
                        quarter,
                        page_type: 'repa',
                        dateRange,
                        employee: employeeModel,
                        organizationName: record?.ORGANIZATION,
                        urlId: record?.URL_ID,
                        roleType: 'appraiser',
                        pageType: 'review',
                        intent: 'Fill',
                        appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
                      },
                    })
              }
              isViewOnly={
                employeeModel.appraisalStatus !== 'pending' &&
                employeeModel.appraisalStatus !== 'complete_self'
              }
              onViewSummary={() => {
                if (appraisalPeriod === 'Annual') {
                  // // Annual: pass as query params
                  // const queryParams = new URLSearchParams({
                  //   financialYear,
                  //   appraisalPeriod,
                  //   urlId: employee.id || '',
                  //   roleName: employee.primary || '',
                  //   roleType: employee.primary || 'Administrative Officers',
                  // }).toString();
                  navigate(`/appraisal/annual/appraiser-review`, {
                    state: {
                      financialYear,
                      appraisalPeriod,
                      quarter,
                      page_type: 'repa',
                      dateRange,
                      employee: employeeModel,
                      organizationName: record?.ORGANIZATION,
                      urlId: record?.ID,
                      roleType: 'appraiser',
                      pageType: 'review',
                      intent: 'Review',
                      appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
                      task: 'view',
                    },
                  });
                } else {
                  navigate('/quarterly/quaterly-appraisee-check-in', {
                    state: {
                      financialYear,
                      appraisalPeriod,
                      quarter,
                      page_type: 'repa',
                      dateRange,
                      employee: employeeModel,
                      organizationName: record?.ORGANIZATION,
                      urlId: record?.URL_ID,
                      roleType: 'appraiser',
                      pageType: 'review',
                      intent: 'View',
                      appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS,
                    },
                  });
                }
              }}
              onAddException={() => {}}
            />
          );
        })}
      </div>
    </div>
  );
}
