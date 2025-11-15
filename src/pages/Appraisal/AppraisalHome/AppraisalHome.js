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
  // Extract empNo and user info from AuthContext
  const { getEmployeeDetails, getUserProperty, user } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '36663');
  console.log('Employee Number:', empNo);
  const role = user?.roles?.[0] || 'emp'; // Get first role or default to 'emp'

  // Helper function to extract year from "FY 2024-25" format
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

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
  const { data, isLoading} = useQuery({
    queryKey: ['appraisalHomeDashboard', financialYear, appraisalPeriod, selectedQuarter, empNo],
    queryFn: () => appraisalAPI.getAppraisalHomeDashboard({
      empNo: empNo,
      role: role,
      appraisalPeriod: appraisalPeriod.toLowerCase(),
      financialYear: extractYear(financialYear),
      quarter: selectedQuarter
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

        {/* Appraisal Period Selection */}
        <span className="text-muted fw-semibold ms-4">Appraisal Period</span>
        <div className="btn-group" role="group" aria-label="Appraisal period selector">
          <button
            type="button"
            className={`btn px-2 ${
              appraisalPeriod === 'Annual' ? 'btn-primary text-white' : 'btn-outline-primarys'
            }`}
            onClick={() => setAppraisalPeriod('Annual')}
          >
            Annual Year
          </button>
          <button
            type="button"
            className={`btn px-2 ${
              appraisalPeriod === 'Quarterly' ? 'btn-primary text-white' : 'btn-outline-primarys'
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
          heading="Appraisee Check-in"
          kpiData={[
            {
              value: appraisalPeriod === 'Quarterly'
                ? (data?.self_count_quarterly ?? 0)
                : (data?.completed_appraisal_count ?? 0),
              label: 'Appraisals to be filled'
            },
            {
              value: appraisalPeriod === 'Quarterly'
                ? (data?.self_pending_appraisal_count ?? 0)
                : (data?.pending_appraisal_count ?? 0),
              label: 'Pending Appraisals(s)'
            },
          ]}
          onClick={() => {
            navigate(
              `/appraisal/appraisee-check-in?financialYear=${financialYear}&appraisalPeriod=${appraisalPeriod}&quarter=${selectedQuarter}`
            );
          }}
        />
      </div>
      {/* Accordion for My Final Score */}
      <div className="myFinalScore-accordion mt-3">
        <AppraisalAccordion
          accordionItems={[{ heading: 'My Final Score' }]}
          scoreData={data?.appraisal_score_dash || []}
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
