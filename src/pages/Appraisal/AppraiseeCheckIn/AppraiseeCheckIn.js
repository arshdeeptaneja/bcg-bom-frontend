import { BackButton } from '../../../components/common';
import { useSearchParams } from 'react-router-dom';
import './AppraiseeCheckIn.css';
import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';

/**
 *
 * @param {Object} props - The component props.
 * @param {string} props.financialYear - The financial year.
 * @param {string} props.appraisalPeriod - The appraisal period.
 * @param {string} props.quarter - The quarter.
 * @returns
 */
export default function AppraiseeCheckIn() {
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraisee Check-In Dashboard
          </h1>
        </div>
        <h2 className="text-muted fw-bold mb-0 ms-3">
          {`${
            appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
          } ${financialYear} ${appraisalPeriod} Check-In`}
        </h2>
      </div>

      {/* Appraisee Check-In Summary Row */}
      <div className="summary-row border rounded-2 px-5 py-3 mt-3 align-items-end justify-content-between d-flex gap-3 shadow-sm">
        <h2 className="text-muted fw-bold mb-0 ms-3 text-muted">{`Average Score for ${
          appraisalPeriod === 'Quarterly' ? 'Quarter' : 'Year'
        }`}</h2>
        <div className="summary-card-content">
          <span class="summary-card-content-value fw-bold">Score:</span>
          <span class="summary-card-content-value text-primary ms-3">{averageScore}</span>
        </div>
        <div className="summary-card-content">
          <span class="summary-card-content-value fw-bold">Max Score:</span>
          <span class="summary-card-content-value text-primary ms-3">{maxScore}</span>
        </div>
      </div>

      {/* Employee Appraisal Cards */}
      <div className="employee-appraisal-cards">
        <EmployeeAppraisalCard
          employee={
            new EmployeeModel({
              empNo: '123456',
              employeeName: 'John Doe',
              employeeScale: '10',
              roles: ['Role 1', 'Role 2'],
              appraiser: 'Jane Doe',
            })
          }
          dateRange="2024-01-01 to 2024-12-31"
          primaryRole="Role 1"
          appraisalStatus="PENDING AT APPRAISEE"
          exceptionStatus="COMPLETED"
          organization="Dhanetha"
          quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
          appraisalPeriod={appraisalPeriod}
          onAddCheckIn={() => {}}
          onViewSummary={() => {}}
          onAddException={() => {}}
        />
      </div>
    </div>
  );
}
