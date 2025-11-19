import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmployeeModel from '../../../models/EmployeeModel';
import AnnualAppraiserCard from '../AnnualAppraiserCard/AnnualAppraiserCard';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
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
export default function AppraiserDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const financialYear = searchParams.get('financialYear');
    const appraisalPeriod = searchParams.get('appraisalPeriod');
    const quarter = searchParams.get('quarter');

    // Get employee details from auth context using getUserProperty
    const { getEmployeeDetails, getUserProperty } = useAuth();
    const employeeDetails = getEmployeeDetails();
    const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

    // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
    const extractYear = (fy) => {
        const match = fy?.match(/FY (\d{4})/);
        return match ? match[1] : new Date().getFullYear().toString();
    };

    // React Query to fetch appraiser dashboard data
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['appraiserDashboard', financialYear, appraisalPeriod, quarter, empNo],
        queryFn: () =>
            appraisalAPI.getAppraiserCheckInDashboard({
                empNo: empNo,
                financialYear: parseInt(extractYear(financialYear)),
                quarter: quarter || '',
                appraisalPeriod: appraisalPeriod?.toLowerCase() || '', // @TODO: Confirm with Arsh - appraisalPeriod parameter
            }),
        enabled: !!empNo && !!financialYear && !!quarter, // Only run query if required params are available
    });

    // Show error toast when API fails
    useEffect(() => {
        if (isError) {
            toast.error(`Failed to fetch appraiser dashboard data: ${error?.message || 'Unknown error'}`);
        }
    }, [isError, error]);

    if (!financialYear || !appraisalPeriod || !quarter) {
        return (
            <div className="pageWrapper">
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
                            Appraiser Dashboard
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
                            Appraiser Dashboard
                        </h1>
                    </div>
                </div>
                <div className="text-center mt-5">
                    <p className="text-danger fw-semibold">Failed to load appraiser dashboard data</p>
                    <p className="text-muted">{error?.message || 'Please try again later'}</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
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
    
    // Create employee model from auth context using getUserProperty
    const employee = new EmployeeModel({
        empNo: empNo,
        employeeName: getUserProperty("name", employeeDetails?.currentUser?.[0]?.EMP_NAME || employeeDetails?.currentUser?.[0]?.NAME || ''),
        employeeScale: getUserProperty('employeeScale', employeeDetails?.currentUser?.[0]?.SCALE || ''),
        roles: getUserProperty('roles', employeeDetails?.currentUser?.[0]?.ROLES || []),
        appraiser: getUserProperty('appraiser', employeeDetails?.currentUser?.[0]?.REPORTING_AUTHORITY_NAME || employeeDetails?.currentUser?.[0]?.APPRAISER || ''),
    });
    
    // Get primary role from employee details using getUserProperty
    const primaryRole = getUserProperty('primaryRole', 
        employeeDetails?.currentUser?.[0]?.MAIN_ROLE || 
        employeeDetails?.currentUser?.[0]?.PRIMARY_ROLE || 
        ''
    );
    
    // Get organization from employee details using getUserProperty
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
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Appraiser Dashboard
                    </h1>
                </div>
                <h5 className="text-muted fw-bold mb-0 ms-3">
                    {`${appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
                        } ${financialYear} ${appraisalPeriod} Check-In`}
                </h5>
            </div>

            {/* --Appraisee Check-In Filters Row --*/}
            {/* <div class="row g-3 mb-4 appraiser-filter-bar">
    <div class="col-md-2">
      <label class="form-label fw-semibold">EMPLOYEE NUMBER</label>
      <select class="form-select">
        <option>-Select-</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label fw-semibold">EMPLOYEE NAME</label>
      <select class="form-select">
        <option>-Select-</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label fw-semibold">PRIMARY ROLE</label>
      <select class="form-select">
        <option>-Select-</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label fw-semibold">APPRAISER</label>
      <select class="form-select">
        <option>-Select-</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label fw-semibold">STATUS</label>
      <select class="form-select">
        <option>-Select-</option>
      </select>
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button class="btn primary-button px-4 w-100">
        Reset <i class="bi bi-arrow-repeat ms-1"></i>
      </button>
    </div>
  </div> */}

            {/* Employee Appraisal Cards */}
            <div className="employee-appraisal-cards">
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
                    middleAction={{
                        id: 'view-summary',
                        label: 'View Summary',
                        onClick: () => navigate(`/summary/${employee.empNo}`)
                    }}
                    rightAction={{
                        id: 'raise-appeal',
                        label: 'Raise Appeal',
                        to: '/appeal/create',
                        onClick: () => navigate(`/summary/${employee.empNo}`)
                    }}
                />
            </div>
        </div>
    );
}
