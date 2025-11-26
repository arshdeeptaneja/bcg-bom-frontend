/**
 * The `AppraisalHome` function in JavaScript fetches and displays appraisal dashboard data based on
 * selected filters and allows navigation to different sections.
 * @returns The `AppraisalHome` component is being returned. It contains JSX elements for displaying
 * the dashboard of the appraisal system. The component includes filters for selecting the financial
 * year, appraisal period, and quarter. It also displays KPI tabs for different check-ins and modes
 * related to the appraisal process. Additionally, there is an accordion component for displaying the
 * user's final score information and a foot note section with additional
 */
import AppraisalAccordion from '../../../components/Appraisal/AppraisalAccordion/AppraisalAccordion';
import { KpiTab } from '../../../components/common';
import './AppraisalHome.css';
import { BackButton } from '../../../components/common';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';

export default function AppraisalHome() {
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const navigate = useNavigate();
  const { getEmployeeDetails, getUserProperty, user } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID ?? '36663');
  console.log('Employee Number:', empNo);
  const role = user?.roles?.[0] ?? 'emp';

  const getValueOrZero = (value) => (value === undefined || value === '') ? 0 : value;

  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  const buildNavigationUrl = (basePath, params = {}) => {
    const queryParams = new URLSearchParams({
      financialYear,
      appraisalPeriod,
      quarter: selectedQuarter,
      ...params,
    }).toString();
    return `${basePath}?${queryParams}`;
  };

  const renderToggleButtons = (options, selected, onSelect, outlineClass = 'btn-outline-primary') => (
    <div className="btn-group" role="group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`btn px-2 ${selected === opt.value ? 'btn-primary text-white' : outlineClass}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

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
  const [financialYear, setFinancialYear] = useState(financialYears[0]);

  // React Query to fetch dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['appraisalHomeDashboard', financialYear, appraisalPeriod, selectedQuarter, empNo],
    queryFn: () =>
      appraisalAPI.getAppraisalHomeDashboard({
        empNo: empNo,
        role: role,
        appraisalPeriod: appraisalPeriod.toLowerCase(),
        financialYear: extractYear(financialYear),
        quarter: selectedQuarter,
      }),
    enabled: !!empNo,
  });
  console.log(data);

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisal Home</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisal Home</h1>
      </div>
      <div className="filters-row border rounded-2 px-3 py-2 mt-3 align-items-center d-flex gap-3">
        <span className="text-muted fw-semibold">FY Selection</span>
        <select
          className="form-select w-auto text-primary"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
        >
          {financialYears.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>

        <span className="text-muted fw-semibold ms-4">Appraisal Period</span>
        {renderToggleButtons(
          [
            { value: 'Annual', label: 'Annual Year' },
            { value: 'Quarterly', label: 'Quarterly' },
          ],
          appraisalPeriod,
          setAppraisalPeriod,
          'btn-outline-primarys'
        )}

        {appraisalPeriod === 'Quarterly' && (
          <>
            <span className="text-muted fw-semibold ms-4">Quarter</span>
            {renderToggleButtons(
              [
                { value: 'Q1', label: 'Q1' },
                { value: 'Q2', label: 'Q2' },
                { value: 'Q3', label: 'Q3' },
                { value: 'Q4', label: 'Q4' },
              ],
              selectedQuarter,
              setSelectedQuarter
            )}
          </>
        )}
      </div>

      <div className="kpi-tabs mt-3 d-flex flex-row gap-3">
        <KpiTab
          heading="Appraisee Check-in"
          kpiData={[
            {
              value: getValueOrZero(
                appraisalPeriod === 'Quarterly'
                  ? data?.self_count_quarterly
                  : data?.pending_appraisal_count
              ),
              label: 'Appraisal(s) to be filled',
            },
            {
              value: getValueOrZero(
                appraisalPeriod === 'Quarterly'
                  ? data?.self_pending_appraisal_count
                  : data?.pending_appraisal_count
              ),
              label: 'Pending Appraisal(s)',
            },
          ]}
          onClick={() => {
            const basePath = appraisalPeriod === 'Annual'
              ? '/appraisal/appraisee-check-in'
              : '/quarterly/quarterly-appraisee';
            navigate(buildNavigationUrl(basePath));
          }}
        />

        <KpiTab
          heading="Appraiser Check-in"
          kpiData={[
            { value: 0, label: 'Appraisals to be filled' },
            { value: 0, label: 'Pending Appraisals(s)' },
          ]}
          onClick={() => {
            const basePath = appraisalPeriod === 'Annual'
              ? '/appraiser/annual-appraisal-home'
              : '/appraisal/appraiser-check-in';
            navigate(buildNavigationUrl(basePath));
          }}
        />
        
        {/* Reviewer card - show if reviewer data is available */}
        {(data?.reviewer_pending_appraisals !== undefined || 
          data?.reviewer_completed_appraisals !== undefined) && (
          <KpiTab
            heading="Reviewer Mode"
            kpiData={[
              {
                value: getValueOrZero(data?.reviewer_pending_appraisals),
                label: 'Roles to be reviewed',
              },
              {
                value: getValueOrZero(data?.reviewer_completed_appraisals),
                label: 'Pending Appraisal(s)',
              },
            ]}
            onClick={() => navigate(buildNavigationUrl('/appraiser/reviewer-dashboard'))}
          />
        )}
      </div>
      {/* Accordion for My Final Score */}
      <div className="myFinalScore-accordion mt-3">
        <AppraisalAccordion
          accordionItems={[
            {
              heading: 'My Final Score',
              tableData: data?.appraisal_score_dash?.map((item) => ({
                Cycle: item?.CYCLE ?? '-',
                Weightage: item?.WEIGHTAGE ?? '-',
                'Actual Score': item?.PERCENTAGE_SCORE ?? '-',
                Performance: item?.PERFORMANCE ?? '-',
              })),
            },
          ]}
          columns={['Cycle', 'Weightage', 'Actual Score', 'Performance']}
        />
      </div>

      {/* Foot Note */}
      <div className="footNote mt-3">
        <span className="note text-muted fw-bold">Note: </span>
        <span className="note-content">
          Only roles where an employee has completed 90 days in service during the performance cycle
          will be considered for annual appraisal and 31 days in service during the quarter for
          quarterly check-in.
        </span>
      </div>
    </div>
  );
}
