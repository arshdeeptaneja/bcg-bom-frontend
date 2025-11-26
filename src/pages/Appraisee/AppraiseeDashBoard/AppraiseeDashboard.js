/**
 * The `AppraiseeDashboard` function fetches and displays appraisee dashboard data based on financial
 * year, appraisal period, and quarter parameters.
 * @returns The `AppraiseeDashboard` component is being returned. This component fetches data related
 * to the appraisee's dashboard using React Query and displays it in the UI. It includes various
 * sections such as fetching data, handling loading and error states, extracting data from the API
 * response, calculating date ranges, determining appraisal status, and displaying employee appraisal
 * cards.
 */
import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmployeeModel from '../../../models/EmployeeModel';
import AnnualAppraiserCard from '../../Appraiser/AnnualAppraiserCard/AnnualAppraiserCard';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';
/**
 *
 * @param {Object} props - The component props.
 * @param {string} props.financialYear - The financial year.
 * @param {string} props.appraisalPeriod - The appraisal period.
 * @param {string} props.quarter - The quarter.
 * @returns
 */
export default function AppraiseeDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');
  const {getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // React Query to fetch appraisee dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appraiseeDashboard', financialYear, appraisalPeriod, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getAppraiseeDashboard({
        fy: extractYear(financialYear),
        quarter: quarter || '',
        appraisalPeriod: appraisalPeriod?.toLowerCase() || '',
        empNo: empNo,
      }),
    enabled: !!empNo && !!financialYear && !!appraisalPeriod, // Only run query if required params are available
  });
 
  // Create employee model from auth context using getUserProperty
  const employee = new EmployeeModel({
    empNo: empNo,
    employeeName: getUserProperty("name"),
    employeeScale: getUserProperty('employeeScale', employeeDetails?.currentUser?.[0]?.SCALE || ''),
    //TODO: CONFIRM WITH @ARSH
    roles: getUserProperty('roles', employeeDetails?.currentUser?.[0]?.ROLES || []),
    //TODO: CONFIRM WITH @ARSH
    appraiser: getUserProperty('appraiser', employeeDetails?.currentUser?.[0]?.REPORTING_AUTHORITY_NAME || employeeDetails?.currentUser?.[0]?.APPRAISER || ''),
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch appraisee dashboard data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

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
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisee Dashboard</h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Extract data from API response
  // The API response structure: { result: [], average_score: null, appraisal_score_dash: [], ... }
  // Handle both wrapped (data.data) and direct (data) response structures
  const responseData = data?.data || data;
  const results = responseData?.result || [];
  const averageScore = responseData?.average_score || 0;
  const maxScore = 100; // Default max score, adjust if provided by API
  const appraisalScoreDash = responseData?.appraisal_score_dash || [];
  
  // Determine appraisal status from API response
  // appraisal_final_status: 1 = completed, 0 or null = pending
  const appraisalFinalStatus = responseData?.appraisal_final_status;
  const appraisalStatus = appraisalFinalStatus === 1 ? 'COMPLETED' : 'PENDING AT APPRAISEE';
  
  // Get final grade from API response
  const finalGrade = responseData?.final_grade || responseData?.post_final_grade || '';
  const empGrade = responseData?.EMP_GRADE || '';
  
  // Calculate date range based on financial year and quarter
  const getDateRange = () => {
    if (!financialYear) return '';
    const year = extractYear(financialYear);
    const startYear = parseInt(year);
    const endYear = startYear + 1;
    
    if (appraisalPeriod === 'Quarterly' && quarter) {
      // Quarterly date ranges (FY starts in April)
      const quarterMonths = {
        'Q1': { start: '04', end: '06', endDay: '30' }, // April to June
        'Q2': { start: '07', end: '09', endDay: '30' }, // July to September
        'Q3': { start: '10', end: '12', endDay: '31' }, // October to December
        'Q4': { start: '01', end: '03', endDay: '31' }, // January to March (next year)
      };
      const q = quarterMonths[quarter];
      if (q) {
        const startDate = quarter === 'Q4' 
          ? `${endYear}-${q.start}-01` 
          : `${startYear}-${q.start}-01`;
        const endDate = quarter === 'Q4'
          ? `${endYear}-${q.end}-${q.endDay}`
          : `${startYear}-${q.end}-${q.endDay}`;
        return `${startDate} to ${endDate}`;
      }
    } else if (appraisalPeriod === 'Annual') {
      // Annual date range: April 1 to March 31
      return `${startYear}-04-01 to ${endYear}-03-31`;
    }
    return '';
  };

  const dateRange = getDateRange();
  
  // Get primary role from employee details using getUserProperty (since not in API response)
  const primaryRole = getUserProperty('primaryRole', 
    employeeDetails?.currentUser?.[0]?.MAIN_ROLE || 
    employeeDetails?.currentUser?.[0]?.PRIMARY_ROLE || 
    'Role 1'
  );
  
  // Get organization from employee details using getUserProperty (since not in API response)
  const organization = getUserProperty('organization', 
    employeeDetails?.currentUser?.[0]?.ORGANIZATION || 
    employeeDetails?.currentUser?.[0]?.ORG_NAME || 
    ''
  );

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisee Dashboard</h1>
        </div>
      </div>

      {/* Employee Appraisal Cards */}
      <div className="employee-appraisal-cards">
        <AnnualAppraiserCard
          employee={employee}
          dateRange={dateRange}
          primaryRole={primaryRole}
          appraisalStatus={appraisalStatus}
          exceptionStatus="COMPLETED"
          organization={organization}
          quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
          appraisalPeriod={appraisalPeriod}
          scoreData={appraisalScoreDash}
          leftAction={null}
          onAddAppraisal={() => navigate('/appraiser/add-appraisal')}
          annualButtons={true}
        />
      </div>
    </div>
  );
}// {
//   "result": [],
//   "average_score": null,
//   "appeal_status": {
//     "appeal_denied": "Denied",
//     "appeal_partially_accepted": "Partially Accepted",
//     "appeal_approved": "Approved",
//     "appeal_rejected": "Rejected",
//     "appeal_accepted": "Accepted",
//     "appeal_registered": "Registered"
//   },
//   "redresult": [],
//   "appraisal_final_status": 1,
//   "final_grade": null,
//   "post_final_grade": null,
//   "appraisal_score_dash": [
//     {
//       "WEIGHTED_SCORE": 0,
//       "WEIGHTAGE": 0,
//       "ID": 1,
//       "PERCENTAGE_SCORE": 0,
//       "CYCLE": "Quarter 1"
//     },
//     {
//       "WEIGHTED_SCORE": 0,
//       "WEIGHTAGE": 0,
//       "ID": 2,
//       "PERCENTAGE_SCORE": 0,
//       "CYCLE": "Quarter 2"
//     },
//     {
//       "WEIGHTED_SCORE": 0,
//       "WEIGHTAGE": 0,
//       "ID": 3,
//       "PERCENTAGE_SCORE": 0,
//       "CYCLE": "Quarter 3"
//     },
//     {
//       "WEIGHTED_SCORE": 0,
//       "WEIGHTAGE": 0,
//       "ID": 4,
//       "PERCENTAGE_SCORE": 0,
//       "CYCLE": "Quarter 4"
//     },
//     {
//       "WEIGHTED_SCORE": null,
//       "WEIGHTAGE": 100,
//       "ID": 5,
//       "PERCENTAGE_SCORE": null,
//       "CYCLE": "Total Non-Discretionary score"
//     },
//     {
//       "WEIGHTED_SCORE": 0,
//       "WEIGHTAGE": 70,
//       "ID": 6,
//       "PERCENTAGE_SCORE": null,
//       "CYCLE": "Non-Discretionary Score (Scaled down to 70)"
//     },
//     {
//       "WEIGHTED_SCORE": null,
//       "WEIGHTAGE": 30,
//       "ID": 7,
//       "PERCENTAGE_SCORE": null,
//       "CYCLE": "(+) Discretionary Score"
//     },
//     {
//       "WEIGHTED_SCORE": 0,
//       "WEIGHTAGE": 100,
//       "ID": 8,
//       "PERCENTAGE_SCORE": null,
//       "CYCLE": "Total Score"
//     }
//   ],
//   "feedback_status": 1,
//   "EMP_GRADE": ""
// }

