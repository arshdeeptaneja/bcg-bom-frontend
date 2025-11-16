import './AppraisalDashboard.css';
import { ImageTab } from '../../../components/common';
import { HiOutlineDocumentCheck } from 'react-icons/hi2';
import AppraisalAccordion from '../../../components/Appraisal/AppraisalAccordion/AppraisalAccordion';
import { useNavigate } from 'react-router-dom';

/**
 * This component is used to display the appraisal dashboard.
 * @returns
 */
const AppraisalDashboard = () => {
  const getFinancialYears = () => {
    const years = [];
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // FY starts in April
    for (let i = 0; i < 6; i++) {
      const start = currentYear - i;
      const end = (start + 1).toString().slice(2);
      years.push(`FY ${start}-${end}`);
    }
    return years;
  };

  const financialYears = getFinancialYears();

  const navigate = useNavigate();

  return (
    <div className="pageWrapper">
      <h1 className="dashboard-title text-primary fw-bold mb-0">Appraisal Dashboard</h1>

      {/* FY Selection Row */}
      <div className="fy-row border rounded-2 px-3 py-2 mt-3 align-items-center d-flex gap-3">
        <span className="text-muted fw-semibold">FY Selection</span>
        <select className="form-select w-auto text-primary">
          {financialYears.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
      </div>

      {/* Appraisal Tabs */}
      <div className="appraisal-tabs mt-3 d-flex flex-row gap-3">
        <ImageTab
          heading="Appraisal"
          body="Click here for Appraisal"
          image={<HiOutlineDocumentCheck />}
          onClick={() => navigate('/appraisal/home')}
        />
        <ImageTab
          heading="Exception Resolution"
          body="Click here for Exception Resolution"
          image={<HiOutlineDocumentCheck />}
          onClick={() => navigate('/appraisal/exception-resolution')}
        />
        <ImageTab
          heading="Exception Validation"
          body="Click here for Exception Validation"
          image={<HiOutlineDocumentCheck />}
          onClick={() => navigate('/appraisal/exception-verify')}
        />
      </div>

      {/*Accordions*/}
      <div className="appraisal-accordion-menu mt-3">
        <AppraisalAccordion
          accordionItems={[
            { heading: 'Self-Appraisal', pendingCount: 3 },
            { heading: 'Reporting Authority', pendingCount: 3 },
            { heading: 'Reviewing Authority', pendingCount: 3 },
            { heading: 'Accepting Authority', pendingCount: 3 },
            { heading: 'Exception Resolution - Reporting Authority', pendingCount: 3 },
          ]}
        />
      </div>
    </div>
  );
};

export default AppraisalDashboard;
