import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmployeeModel from '../../../models/EmployeeModel';
import AnnualAppraiserCard from '../../Appraiser/AnnualAppraiserCard/AnnualAppraiserCard';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
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
    queryFn: () => appraisalAPI.getAppraiseeDashboard({
      fy: extractYear(financialYear),
      quarter: quarter,
      appraisalPeriod: appraisalPeriod,
      empNo: empNo,
    }),
    enabled: !!empNo && !!financialYear,
  });
  // Define employee object before JSX
  const employee = new EmployeeModel({
    empNo: '123456',
    employeeName: 'John Doe',
    employeeScale: '10',
    roles: ['Role 1', 'Role 2'],
    appraiser: 'Jane Doe',
  });
  // TODO: Get the average score and max score from the API
  const averageScore = 70;
  const maxScore = 100;

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div>No financial year, appraisal period, or quarter found</div>
      </div>
    );
  }
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
          dateRange="2024-01-01 to 2024-12-31"
          primaryRole="Role 1"
          appraisalStatus="PENDING AT APPRAISEE"
          exceptionStatus="COMPLETED"
          organization="Dhanetha"
          quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
          appraisalPeriod={appraisalPeriod}
          leftAction={null}
          onAddAppraisal={() => navigate('/appraiser/add-appraisal')}
          annualButtons={true}
        />
      </div>
    </div>
  );
}
