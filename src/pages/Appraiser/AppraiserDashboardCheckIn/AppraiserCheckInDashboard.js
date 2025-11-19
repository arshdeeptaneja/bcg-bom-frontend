import { useMemo } from 'react';
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
  if (!Array.isArray(scoreEntries) || scoreEntries.length === 0) {
    return 0;
  }
  const total = scoreEntries.reduce((sum, entry) => {
    const value = Number(entry?.PERCENTAGE_SCORE ?? entry?.percentageScore ?? entry?.SCORE);
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);
  return Number((total / scoreEntries.length).toFixed(2));
};

const extractYear = (fyLabel) => {
  if (!fyLabel) {
    return new Date().getFullYear().toString();
  }
  const match = fyLabel.match(/FY\s+(\d{4})/i);
  return match ? match[1] : fyLabel;
};

const buildAdditionalRoles = (record) => {
  const roles = [record?.ADDITIONAL_ROLE_1, record?.ADDITIONAL_ROLE_2, record?.ADDITIONAL_ROLE_3]
    .filter(Boolean)
    .map((role) => String(role));
  return roles;
};

const buildDateRange = (start, end) => {
  if (!start || !end) {
    return '';
  }
  return `${start} to ${end}`;
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appraiserCheckInDashboard', financialYear, quarter, authEmpNo],
    queryFn: () =>
      appraisalAPI.getAppraiserCheckInDashboard({
        empNo: authEmpNo,
        financialYear: extractYear(financialYear),
        quarter,
        appraisalPeriod: 'quarterly',
      }),
    enabled: Boolean(authEmpNo && financialYear && quarter && isQuarterlyFlow),
  });

  const reportees = data?.result || data?.reportees || [];
  const scoreTable = data?.appraisal_score_dash || [];
  const scoreSummary = data?.score_summary || data?.scoreSummary || {};

  const averageScore = useMemo(() => {
    const summaryAverage = pickNumericValue(scoreSummary, ['averageScore', 'avgScore', 'AVERAGE_SCORE']);
    return Number.isNaN(summaryAverage) ? computeAverageFromScoreTable(scoreTable) : summaryAverage;
  }, [scoreSummary, scoreTable]);

  const maxScore = useMemo(() => {
    const summaryMax = pickNumericValue(scoreSummary, ['maxScore', 'MAX_SCORE']);
    if (!Number.isNaN(summaryMax)) {
      return summaryMax;
    }
    return scoreTable.reduce((maxValue, entry) => {
      const candidate = Number(entry?.MAX_SCORE ?? entry?.WEIGHTAGE ?? 0);
      return Number.isNaN(candidate) ? maxValue : Math.max(maxValue, candidate);
    }, 0);
  }, [scoreSummary, scoreTable]);

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Missing financial year, appraisal period, or quarter</p>
        </div>
      </div>
    );
  }

  if (!isQuarterlyFlow) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">This route is only available for quarterly flows.</p>
        </div>
      </div>
    );
  }

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

  if (isError) {
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
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load reportee data</p>
          <p className="text-muted">{error?.message || 'Please try again later.'}</p>
        </div>
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
        <h4 className="text-muted fw-bold mb-0 ms-3">{`${quarter}, ${financialYear} Quarterly Check-In`}</h4>
      </div>

      <div className="row g-3 mb-4 appraiser-filter-bar">
        <div className="col-md-2">
          <label className="form-label fw-semibold">EMPLOYEE NUMBER</label>
          <select className="form-select" disabled>
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">EMPLOYEE NAME</label>
          <select className="form-select" disabled>
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">PRIMARY ROLE</label>
          <select className="form-select" disabled>
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">APPRAISER</label>
          <select className="form-select" disabled>
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">STATUS</label>
          <select className="form-select" disabled>
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn primary-button px-4 w-100" disabled>
            Reset <i className="bi bi-arrow-repeat ms-1" />
          </button>
        </div>
      </div>

      <div className="summary-row border rounded-2 px-5 py-3 mt-3 align-items-end justify-content-between d-flex gap-3 shadow-sm">
        <h2 className="text-muted fw-bold mb-0 ms-3">Average Score for Quarter</h2>
        <div className="summary-card-content">
          <span className="summary-card-content-value fw-bold">Score:</span>
          <span className="summary-card-content-value text-primary ms-3">{averageScore || 0}</span>
        </div>
        <div className="summary-card-content">
          <span className="summary-card-content-value fw-bold">Max Score:</span>
          <span className="summary-card-content-value text-primary ms-3">{maxScore || 0}</span>
        </div>
      </div>

      <div className="employee-appraisal-cards">
        {reportees.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted fw-semibold">No reportees pending for this quarter.</p>
          </div>
        ) : (
          reportees.map((record, index) => {
            const employeeModel = new EmployeeModel({
              empNo: record?.EMP_ID || record?.empNo || `reportee-${index}`,
              employeeName: record?.EMP_NAME || record?.employeeName || 'Employee',
              employeeScale: record?.SCALE || record?.employeeScale || '',
              additionalRoles: buildAdditionalRoles(record),
              appraiser: record?.APPRAISER_NAME || record?.REPORTING_AUTHORITY_NAME || '',
              primaryRole: record?.PRIMARY_ROLE || record?.MAIN_ROLE || '',
            });

            const dateRange = buildDateRange(record?.START_DATE, record?.END_DATE);
            const appraisalStatus = getDisplayStatus(record?.APPRAISAL_STATUS || record?.STATUS);

            return (
              <EmployeeAppraisalCard
                key={employeeModel.empNo || index}
                employee={employeeModel}
                dateRange={dateRange}
                quarter={quarter}
                appraisalPeriod={appraisalPeriod}
                primaryRole={employeeModel.primaryRole}
                additionalRoles={buildAdditionalRoles(record)}
                organization={record?.ORGANIZATION || ''}
                appraisalStatus={appraisalStatus}
                exceptionStatus={record?.EXCEPTION_STATUS || 'NOT CREATED'}
                scoreData={record?.scoreData || scoreTable}
                onAddCheckIn={() => {
                  navigate('/appraisal/check-in-form', {
                    state: {
                      financialYear,
                      appraisalPeriod,
                      quarter,
                      dateRange,
                      employee: {
                        empNo: employeeModel.empNo,
                        employeeName: employeeModel.employeeName,
                        employeeScale: employeeModel.employeeScale,
                        roles: employeeModel.additionalRoles,
                        primaryRole: employeeModel.primaryRole,
                        appraiser: employeeModel.appraiser,
                        organization: record?.ORGANIZATION || '',
                      },
                      organizationName: record?.ORGANIZATION || '',
                      urlId: record?.URL_ID || 'quarterly-appraiser-dashboard',
                      roleType: 'appraiser',
                      pageType: 'review',
                      intent: 'Review',
                      appraisalStatus: record?.APPRAISAL_STATUS || record?.STATUS || '',
                    },
                  });
                }}
                onViewSummary={() => {}}
                onAddException={() => {}}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
