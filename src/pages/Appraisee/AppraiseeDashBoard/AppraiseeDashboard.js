import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmployeeModel from '../../../models/EmployeeModel';
import AnnualAppraiserCard from '../../Appraiser/AnnualAppraiserCard/AnnualAppraiserCard';

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
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Appraisee Dashboard
                    </h1>
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
