/**
 * The QuarterlyAppraisee function fetches and displays appraisal data for a specific employee during a
 * quarterly check-in period.
 * @returns The `QuarterlyAppraisee` component is returning JSX elements based on different conditions.
 * Here is a summary of what is being returned:
 */
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BackButton } from '../../../components/common';
import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
import { useEffect } from 'react';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';

export default function QuarterlyAppraisee() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const { getEmployeeDetails, getUserProperty, user } = useAuth();
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');
  const role = user?.roles?.[0] || 'admin';

  // Get employee details from auth context using getUserProperty
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    const fyMatch = fy.match(/FY (\d{4})/);
    if (fyMatch) return fyMatch[1];
    const rangeMatch = fy.match(/(\d{4})-\d{4}/);
    if (rangeMatch) return rangeMatch[1];
    const yearMatch = fy.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
  };

  // React Query to fetch my appraisal dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myAppraisalDashboard', financialYear, appraisalPeriod, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getAppraiseeCheckInDashboard({
        empNo: empNo,
        role: role,
        financialYear: parseInt(extractYear(financialYear)),
        appraisalPeriod: appraisalPeriod.toLowerCase() === "quarterly" ? "quarter" : "",
        quarter: quarter || '',
      }),
    enabled: !!empNo && !!financialYear && !!appraisalPeriod && !!quarter,
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch appraisal data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Missing financial year, appraisal period, or quarter</p>
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
              Appraisee Check-In Dashboard
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

  const responseData = data?.data || data;
  const redResult = responseData?.redresult || [];


  const appraisalScoreDash = responseData?.appraisal_score_dash || [];
  const averageScore = responseData?.score ?? 0;
            
  const maxScore = responseData?.maxscore ?? 0;
  const cardData = responseData?.result?.[0] || responseData?.redresult?.[0] || null;

  const additionalRoles = [
    cardData?.ADDITIONAL_ROLE_1,
    cardData?.ADDITIONAL_ROLE_2,
    cardData?.ADDITIONAL_ROLE_3,
    cardData?.ADDITIONAL_ROLE_4,
  ].filter(role => role && role !== "none");

  const hasCardData = !!cardData;

  const cardDateRange = cardData?.date || 'N/A';

  const employeeModel = hasCardData
    ? new EmployeeModel({
      empNo: cardData?.pf_number || 'N/A',
      employeeName: cardData?.emp_name || 'N/A',
      employeeScale: cardData?.scale || 'N/A',
      roles: [],
      appraiser: cardData?.reporting_authority_name || 'N/A',
    })
    : null;
  console.log("RED RESULT:", redResult);
  console.log("CARD DATA:", cardData);
  console.log("EMPLOYEE MODEL:", employeeModel);

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
          {`${quarter}, ${financialYear} Quarterly Check-In`}
        </h2>
      </div>

      <div className="summary-row border rounded-2 px-5 py-3 mt-3 align-items-end justify-content-between d-flex gap-3 shadow-sm">
        <h2 className="text-muted fw-bold mb-0 ms-3">Average Score for Quarter</h2>
        <div className="summary-card-content">
          <span className="summary-card-content-value fw-bold">Score:</span>
          <span className="summary-card-content-value text-primary ms-3">{averageScore}</span>
        </div>
        <div className="summary-card-content">
          <span className="summary-card-content-value fw-bold">Max Score:</span>
          <span className="summary-card-content-value text-primary ms-3">{maxScore}</span>
        </div>
      </div>

      <div className="employee-appraisal-cards">
        {!hasCardData ? (
          <div className="text-center mt-5">
            <p className="text-muted fw-semibold">No appraisal data available for this period</p>
            <p className="text-muted">Please check back later or contact HR if you believe this is an error.</p>
          </div>
        ) : (
          <EmployeeAppraisalCard
            employee={employeeModel}
            dateRange={cardDateRange}
            redResult={redResult}
            primaryRole={cardData?.MAIN_ROLE || cardData?.primary || 'Role 1'}
            appraisalStatus={cardData?.appraisalStatus || 'PENDING AT APPRAISEE'}
            exceptionStatus="COMPLETED"
            organization={cardData?.organization || 'Dhanetha'}
            additionalRoles={additionalRoles}
            quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
            appraisalPeriod={appraisalPeriod}
            scoreData={appraisalScoreDash}
            onAddCheckIn={() => {
              navigate('/quarterly/quaterly-appraisee-check-in', {
                state: {
                  financialYear,
                  appraisalPeriod,
                  quarter,
                  dateRange: cardDateRange,
                  employee: {
                    empNo: employeeModel.empNo,
                    employeeName: employeeModel.employeeName,
                    employeeScale: employeeModel.employeeScale,
                    roles: employeeModel.roles,
                    primaryRole: cardData?.MAIN_ROLE || cardData?.primaryRole || 'Role 1',
                    appraiser: employeeModel.appraiser,
                  },
                },
              });
            }}
            onViewSummary={() => { }}
            onAddException={() => { }}
          />
        )}
      </div>
    </div>
  );
}
