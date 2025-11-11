import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AppraiserCheckInDashboard.css';
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
export default function AppraiserCheckInDashboard() {
  const navigate = useNavigate();
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
  <div class="row g-3 mb-4 appraiser-filter-bar">
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
          onAddCheckIn={() => {
            navigate('/appraisal/check-in-form', {
              state: {
                financialYear,
                appraisalPeriod,
                quarter,
                dateRange: '2024-01-01 to 2024-12-31',
                employee: {
                  empNo: '123456',
                  employeeName: 'John Doe',
                  employeeScale: '10',
                  roles: ['Role 1', 'Role 2'],
                  primaryRole: 'Role 1',
                  appraiser: 'Jane Doe',
                },
              },
            });
          }}
          onViewSummary={() => {}}
          onAddException={() => {}}
        />

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
          onAddCheckIn={() => {
            navigate('/appraisal/check-in-form', {
              state: {
                financialYear,
                appraisalPeriod,
                quarter,
                dateRange: '2024-01-01 to 2024-12-31',
                employee: {
                  empNo: '123456',
                  employeeName: 'John Doe',
                  employeeScale: '10',
                  roles: ['Role 1', 'Role 2'],
                  primaryRole: 'Role 1',
                  appraiser: 'Jane Doe',
                },
              },
            });
          }}
          onViewSummary={() => {}}
          onAddException={() => {}}
        />
      </div>
    </div>
  );
}
