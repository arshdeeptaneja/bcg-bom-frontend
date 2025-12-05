/**
 * The `AppraiseeCheckIn` function is a React component that fetches and displays appraisal dashboard
 * data for an appraisee based on financial year, appraisal period, and quarter parameters.
 * @returns The `AppraiseeCheckIn` component is being returned. This component fetches data using React
 * Query based on the financial year, appraisal period, and quarter parameters. It handles different
 * states such as loading, error, and successful data retrieval.
 */
import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AppraiseeCheckIn.css';
import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';

// Status mapping for display transformation
const STATUS_MAPPING = {
  complete_self: 'Pending at Appraiser',
  complete_repa: 'Pending at Reviewer',
  pending: 'Pending at Appraisee',
  complete: 'Completed',
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
export default function AppraiseeCheckIn() {
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

  // React Query to fetch dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myAppraisalDashboard', financialYear, appraisalPeriod, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getAppraiseeCheckInDashboard({
        empNo: empNo,
        financialYear: extractYear(financialYear),
        appraisalPeriod: appraisalPeriod.toLowerCase(),
        quarter: appraisalPeriod.toLowerCase() === 'quarterly' ? quarter : '',
      }),
    enabled: !!empNo && !!financialYear && !!appraisalPeriod,
  });

  const responseData = data?.data || data;
  const redResult = responseData?.redresult || [];

  const appraisalScoreDash = responseData?.appraisal_score_dash || [];
  const averageScore = responseData?.overall_avg_score ?? 0;

  const maxScore = responseData?.overall_max_score ?? 0;
  const cardData = responseData?.result?.[0] || responseData?.redresult?.[0] || null;

  const additionalRoles = [
    cardData?.ADDITIONAL_ROLE_1,
    cardData?.ADDITIONAL_ROLE_2,
    cardData?.ADDITIONAL_ROLE_3,
    cardData?.ADDITIONAL_ROLE_4,
  ].filter((role) => role && role !== 'none');

  const hasCardData = !!cardData;

  const cardDateRange = cardData?.date || 'N/A';

  const employeeModel = hasCardData
    ? new EmployeeModel({
        empNo: cardData?.pf_number || 'N/A',
        employeeName: cardData?.emp_name || 'N/A',
        employeeScale: cardData?.scale || 'N/A',
        branch: cardData?.organization,
        roles: [
          cardData?.secondary,
          cardData?.tertiary,
          cardData?.ADDITIONAL_ROLE_3,
          cardData?.ADDITIONAL_ROLE_4,
        ],
        appraiser: cardData?.reporting_authority_ecno || 'N/A',
        appraiserName: cardData?.reporting_authority_name || 'N/A',
        primaryRole: cardData?.primary,
      })
    : null;

  if (!financialYear || !appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">
            Missing required parameters: Financial Year or Appraisal Period
          </p>
        </div>
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
              Appraisee Check-In Dashboard
            </h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if API call fails
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Appraisee Check-In Dashboard
            </h1>
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load appraisal data</p>
          <p className="text-muted">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  // Extract results from API response
  const results = data?.allResults || [];
  const scoreData = data?.appraisal_score_dash || [];
  console.log('results:', results);
  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraisee Check-In Dashboard
          </h1>
        </div>
        <h2 className="text-muted fw-bold mb-0 ms-3">
          {`${financialYear} ${appraisalPeriod} Appraisal`}
        </h2>
      </div>

      {/* Employee Appraisal Cards */}
      <div className="employee-appraisal-cards">
        {results.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted fw-semibold">No appraisal data available for this period</p>
            <p className="text-muted">
              Please check back later or contact HR if you believe this is an error.
            </p>
          </div>
        ) : (
          results.map((employee, index) => (
            <EmployeeAppraisalCard
              key={employee.EMP_ID || index}
              employee={employeeModel}
              // dateRange={employee.START_DATE && employee.END_DATE
              //   ? `${employee.START_DATE} to ${employee.END_DATE}`
              //   : ''}
              dateRange={cardDateRange}
              primaryRole={employeeModel.primaryRole || ''}
              appraisalStatus={employee.status}
              exceptionStatus={employee.APPEAL_STATUS}
              isCheckInDisabled={employee.status?.toLowerCase() !== 'pending'}
              isAppealEnabled={employee.status?.toLowerCase() === 'complete' && (employee.APPEAL_STATUS=="NA" )}
              organization={employee.organization || ''}
              quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
              appraisalPeriod={appraisalPeriod}
              scoreData={scoreData}
              onAddCheckIn={() => {
                if (appraisalPeriod === 'Annual') {
                  // Annual: pass as query params
                  const queryParams = new URLSearchParams({
                    financialYear,
                    appraisalPeriod,
                    urlId: employee.id || '',
                    roleName: employee.primary || '',
                    roleType: employee.primary || 'Administrative Officers',
                  }).toString();
                  navigate(`/appraisal/check-in-form?${queryParams}`, {
                    state: {
                      employee: employeeModel,
                      dateRange: cardDateRange,
                      financialYear,
                      appraisalPeriod,
                      quarter,

                      pageType: 'self',
                      appraisalStatus: employee.status,
                    },
                  });
                } else {
                  // Quarterly: pass as state
                  navigate('/appraisal/check-in-form', {
                    state: {
                      financialYear,
                      appraisalPeriod,
                      quarter,
                      dateRange:
                        employee.START_DATE && employee.END_DATE
                          ? `${employee.START_DATE} to ${employee.END_DATE}`
                          : '',
                      employee: employeeModel,
                      pageType: 'self',
                      appraisalStatus: employee.status,
                    },
                  });
                }
              }}
              isViewOnly={employee.status?.toLowerCase() !== 'pending'}
              onViewSummary={() => {
                console.log("View Summary");
                
                if (appraisalPeriod === 'Annual') {
                  // Annual: pass as query params
                  const queryParams = new URLSearchParams({
                    financialYear,
                    appraisalPeriod,
                    urlId: employee.id || '',
                    roleName: employee.primary || '',
                    roleType: employee.primary || 'Administrative Officers',
                  }).toString();
                  navigate(`/appraisal/check-in-form?${queryParams}`, {
                    state: {
                      employee: employeeModel,
                      dateRange: cardDateRange,
                      financialYear,
                      appraisalPeriod,
                      quarter,
                      pageType: 'self',
                      appraisalStatus: employee.status,
                      task: 'view',
                    },
                  });
                } 
              }}
              onAddException={() => {
                console.log('button pressed');
                navigate('/appraisal/exception-quarterly', {
                  state: {
                    financialYear,
                    appraisalPeriod,
                    quarter,
                    dateRange:
                      employee.START_DATE && employee.END_DATE
                        ? `${employee.START_DATE} to ${employee.END_DATE}`
                        : '',
                    employee: employeeModel,
                    role: employeeModel.primaryRole,
                  },
                });
              }}
              onAddAppeal={() => {
                const queryParams = new URLSearchParams({
                  roleId: employee.id || employee.URL_ID || '',
                  roleType:
                    employee.primary || employeeModel?.primaryRole || 'Administrative Officer',
                  financialYear: financialYear?.replace('FY ', '') || '2025',
                  appraisalPeriod: 'Annual',
                  empNo: employeeModel?.empNo || '',
                  employeeName: employeeModel?.employeeName || '',
                  primaryRole: employeeModel?.primaryRole || '',
                  appraiser:employeeModel.appraiserName|| '',
                }).toString();
                navigate(`/annual/add-appeal?${queryParams}`);
              }}
              isViewAppealOnly={employee.APPEAL_STATUS=="NA"? false:true}

              onViewAppeal={()=>{
                 const queryParams = new URLSearchParams({
                  roleId: employee.id || employee.URL_ID || '',
                  roleType:
                    employee.primary || employeeModel?.primaryRole || 'Administrative Officer',
                  financialYear: financialYear
    ?.replace('FY ', '')      // remove FY prefix → "2025-26"
    ?.split('-')[0]           // take only before dash → "2025"
  || '2025',
                  appraisalPeriod: 'Annual',
                  empNo: employeeModel?.empNo || '',
                  employeeName: employeeModel?.employeeName || '',
                  primaryRole: employeeModel?.primaryRole || '',
                  appraiser:employeeModel.appraiserName|| '',
                  task: 'view',
                }).toString();
                navigate(`/annual/add-appeal?${queryParams}`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
