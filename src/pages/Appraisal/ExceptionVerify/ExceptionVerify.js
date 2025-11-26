/**
 * The `ExceptionVerify` function in JavaScript fetches and displays exception validation data based on
 * selected filters and financial year.
 * @returns The `ExceptionVerify` component is being returned. It includes JSX elements for displaying
 * a dashboard related to exception validation. The component fetches data using React Query based on
 * selected filters like financial year, appraisal period, and quarter. It displays loading spinner
 * while data is being fetched and shows error toast if there is an API error.
 */
import AppraisalAccordion from '../../../components/Appraisal/AppraisalAccordion/AppraisalAccordion';
import { KpiTab } from '../../../components/common';
import './ExceptionVerify.css';
import { BackButton } from '../../../components/common';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';

export default function ExceptionVerify() {
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const navigate = useNavigate();

  // Get employee number from auth context
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

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

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // React Query to fetch exception validator dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'exceptionValidatorDashboard',
      financialYear,
      appraisalPeriod,
      selectedQuarter,
      empNo,
    ],
    queryFn: () =>
      appraisalAPI.getExceptionValidatorDashboard({
        fy: extractYear(financialYear),
        quarter: selectedQuarter,
        exceptionPeriod: appraisalPeriod.toLowerCase(),
        empNo: empNo,
      }),
    enabled: !!empNo, // Only run query if empNo is available
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch exception data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Extract counts from API response
  const totalCount = data?.data?.TOTAL_COUNT || 0;
  const pendingCount = data?.data?.PENDING_COUNT || 0;

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exception Validation</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exception Validation</h1>
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

        {/* Exception Period Selection */}
        <span className="text-muted fw-semibold ms-4">Exception Period</span>
        <div className="btn-group" role="group" aria-label="Exception period selector">
          <button
            type="button"
            className={`btn px-2 ${
              appraisalPeriod === 'Annual' ? 'btn-primary text-white' : 'btn-outline-primary'
            }`}
            onClick={() => setAppraisalPeriod('Annual')}
          >
            Annual Year
          </button>
          <button
            type="button"
            className={`btn px-2 ${
              appraisalPeriod === 'Quarterly' ? 'btn-primary text-white' : 'btn-outline-primary'
            }`}
            onClick={() => setAppraisalPeriod('Quarterly')}
          >
            Quarterly
          </button>
        </div>

        {/* Quarter Selection */}
        {appraisalPeriod === 'Quarterly' && (
          <>
            <span className="text-muted fw-semibold ms-4">Quarter</span>
            <div className="btn-group" role="group" aria-label="Quarter selector">
              <button
                type="button"
                className={`btn px-2 ${
                  selectedQuarter === 'Q1' ? 'btn-primary text-white' : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedQuarter('Q1')}
              >
                Q1
              </button>
              <button
                type="button"
                className={`btn px-2 ${
                  selectedQuarter === 'Q2' ? 'btn-primary text-white' : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedQuarter('Q2')}
              >
                Q2
              </button>
              <button
                type="button"
                className={`btn px-2 ${
                  selectedQuarter === 'Q3' ? 'btn-primary text-white' : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedQuarter('Q3')}
              >
                Q3
              </button>
              <button
                type="button"
                className={`btn px-2 ${
                  selectedQuarter === 'Q4' ? 'btn-primary text-white' : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedQuarter('Q4')}
              >
                Q4
              </button>
            </div>
          </>
        )}
      </div>

      {/* KPI Tabs */}
      <div className="kpi-tabs mt-3 d-flex flex-row gap-3">
        <KpiTab
          heading="Exceptions"
          kpiData={[
            { value: totalCount, label: 'Total Exceptions' },
            { value: pendingCount, label: 'Pending Exception' },
          ]}
          onClick={() => {
            navigate(
              `/appraisal/exceptions-list?financialYear=${financialYear}&appraisalPeriod=${appraisalPeriod}&quarter=${selectedQuarter}`
            );
          }}
        />
      </div>

      {/* Foot Note */}
      <div className="footNote mt-3">
        <span className="note text-muted fw-bold">Note: </span>
        <span className="note-content">
          Only roles where an employee has completed 90 days in service during the performance cycle
          will be considered for annual exceptions and 31 days in service during the quarter for
          quarterly exceptions.
        </span>
      </div>
    </div>
  );
}
