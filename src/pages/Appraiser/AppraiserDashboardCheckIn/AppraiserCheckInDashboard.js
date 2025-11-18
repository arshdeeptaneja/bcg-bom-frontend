import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AppraiserCheckInDashboard.css';
import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
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
export default function AppraiserCheckInDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

  // Get employee number from auth context
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    const match = fy?.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // React Query to fetch appraiser check-in dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appraiserCheckInDashboard', financialYear, appraisalPeriod, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getAppraiserCheckInDashboard({
        empNo: empNo,
        financialYear: extractYear(financialYear),
        quarter: quarter || '',
        appraisalPeriod: appraisalPeriod?.toLowerCase() || '',
      }),
    enabled: !!empNo && !!financialYear && !!appraisalPeriod && !!quarter, // Only run query if required params are available
  });
console.log("data", data);
  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch appraiser check-in dashboard data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser Check-In Dashboard</h1>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Missing required parameters: Financial Year, Appraisal Period, or Quarter</p>
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
              Appraiser Check-In Dashboard
            </h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Extract data from API response
  // Handle both wrapped (data.data) and direct (data) response structures
  const responseData = data?.data || data;
  const results = responseData?.result || [];
  const scoreData = responseData?.appraisal_score_dash || [];

  // Status mapping for display transformation
  const STATUS_MAPPING = {
    'complete_reva': 'Pending at Acceptor',
    'complete_self': 'Pending at Appraiser',
    'complete_repa': 'Pending at Reviewer',
    'pending': 'Pending at Appraisee',
    'submitted_appraisal': 'Completed',
    'completed': 'Completed',
    'complete_ac': 'Completed'
  };

  // Helper function to get display status from backend status
  const getDisplayStatus = (backendStatus) => {
    if (!backendStatus) return 'Pending';
    const status = backendStatus.toLowerCase();
    return STATUS_MAPPING[status] || 'Pending';
  };

  // Calculate date range based on financial year and quarter
  const getDateRange = (startDate, endDate) => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    // Fallback: calculate from financial year and quarter
    if (!financialYear) return '';
    const year = extractYear(financialYear);
    const startYear = parseInt(year);
    const endYear = startYear + 1;
    
    if (appraisalPeriod === 'Quarterly' && quarter) {
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
      return `${startYear}-04-01 to ${endYear}-03-31`;
    }
    return '';
  };
  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraiser Check-In Dashboard
          </h1>
        </div>
        <h4 className="text-muted fw-bold mb-0 ms-3">
          {`${
            appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
          } ${financialYear} ${appraisalPeriod} Check-In`}
        </h4>
      </div>

      {/* --Appraisee Check-In Filters Row --*/}
      <div className="row g-3 mb-4 appraiser-filter-bar">
        <div className="col-md-2">
          <label className="form-label fw-semibold">EMPLOYEE NUMBER</label>
          <select className="form-select">
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">EMPLOYEE NAME</label>
          <select className="form-select">
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">PRIMARY ROLE</label>
          <select className="form-select">
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">APPRAISER</label>
          <select className="form-select">
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">STATUS</label>
          <select className="form-select">
            <option>-Select-</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn primary-button px-4 w-100">
            Reset <i className="bi bi-arrow-repeat ms-1"></i>
          </button>
        </div>
      </div>

      {/* Employee Appraisal Cards */}
      <div className="employee-appraisal-cards">
        {results.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted fw-semibold">No appraisal data available for this period</p>
            <p className="text-muted">Please check back later or contact HR if you believe this is an error.</p>
          </div>
        ) : (
          results.map((employee, index) => (
            <EmployeeAppraisalCard
              key={employee.EMP_ID || employee.empNo || index}
              employee={
                new EmployeeModel({
                  empNo: employee.EMP_ID || employee.empNo || '',
                  employeeName: employee.EMP_NAME || employee.employeeName || '',
                  employeeScale: employee.SCALE || employee.employeeScale || '',
                  roles: employee.ADDITIONAL_ROLE_1 || employee.ADDITIONAL_ROLE_2
                    ? [employee.ADDITIONAL_ROLE_1, employee.ADDITIONAL_ROLE_2].filter(Boolean)
                    : employee.roles || [],
                  appraiser: employee.REPORTING_AUTHORITY_NAME || employee.appraiser || '',
                })
              }
              dateRange={getDateRange(employee.START_DATE, employee.END_DATE)}
              primaryRole={employee.MAIN_ROLE || employee.primaryRole || ''}
              appraisalStatus={getDisplayStatus(employee.APPRAISAL_STATUS)}
              exceptionStatus={employee.EXCEPTION_STATUS || 'NOT CREATED'}
              organization={employee.ORGANIZATION || employee.organization || ''}
              quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
              appraisalPeriod={appraisalPeriod}
              scoreData={scoreData}
              onAddCheckIn={() => {
                navigate('/appraisal/check-in-form', {
                  state: {
                    financialYear,
                    appraisalPeriod,
                    quarter,
                    dateRange: getDateRange(employee.START_DATE, employee.END_DATE),
                    employee: {
                      empNo: employee.EMP_ID || employee.empNo || '',
                      employeeName: employee.EMP_NAME || employee.employeeName || '',
                      employeeScale: employee.SCALE || employee.employeeScale || '',
                      roles: employee.ADDITIONAL_ROLE_1 || employee.ADDITIONAL_ROLE_2
                        ? [employee.ADDITIONAL_ROLE_1, employee.ADDITIONAL_ROLE_2].filter(Boolean)
                        : employee.roles || [],
                      primaryRole: employee.MAIN_ROLE || employee.primaryRole || '',
                      appraiser: employee.REPORTING_AUTHORITY_NAME || employee.appraiser || '',
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
