import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './HrDashboard.css';
import { KpiTab } from '../../../components/common';
import { BackButton } from '../../../components/common';
import UtilitiesSection from './PanelUtilities/Utilities';
import ReportingAuthority from './ReportingAuthority/ReportingAuthority';
import AppraiserUpdate from './AppraiserUpdate/AppraiserUpdate';
import { useNavigate } from 'react-router-dom';


const HrDashboard = () => {
 
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

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
  const navigate = useNavigate();


  return (
    <div className="page">
      <div className="dashboard-wrapper">
       <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisal Home</h1>
      </div>

      {/* Filters Selection Row */}

      {/* Filter Selection Row */}
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
        <span className="text-muted fw-semibold ms-4">Appraisal HR Dashboard</span>
        <div className="btn-group" role="group" aria-label="Appraisal period selector">
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
        {/* Overall Summary Section */}
        <section className="overall-summary-gradient">
          <h2 className="summary-heading">Overall Summary</h2>
          <div className="summary-content-grid">
            <div className="summary-stat-box">
              <div className="stat-number-large">1839</div>
              <div className="stat-label-white">Total Number of<br/>Employees</div>
            </div>

            <div className="vertical-divider"></div>

            <div className="summary-stat-box">
              <div className="stat-number-large">1839</div>
              <div className="stat-label-white">The Number of<br/>Pending Employees</div>
            </div>

            <div className="vertical-divider"></div>

            <div className="summary-stat-box">
              <div className="stat-number-large">0</div>
              <div className="stat-label-white">Number of Days to<br/>Deadline</div>
            </div>

            <div className="vertical-divider"></div>

            <div className="summary-stat-box">
              <div className="stat-label-white-small">Deadline for Completion</div>
            </div>

            <div className="completion-circle-wrapper">
              <div className="completion-circle-border">
                <div className="completion-inner">
                  <div className="completion-percent">0.0%</div>
                  <div className="completion-text">Completion</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Completion Cards Grid */}
        <div className="completion-cards-grid">
          {/* Appraisee Completion */}
          <section className="completion-card-white">
            <h2 className="card-title-accent">Appraisee Completion</h2>
            <div className="stats-row">
              <div className="stat-column">
                <div className="stat-number-green">0.1%</div>
                <div className="stat-description">Appraisee Completed Employees in Percentage</div>
              </div>
              <div className="stat-column">
                <div className="stat-number-green">2</div>
                <div className="stat-description">Appraisee Completed Employees</div>
              </div>
              <div className="stat-column">
                <div className="stat-number-green">1837</div>
                <div className="stat-description">Pending Officers</div>
              </div>
            </div>
            <div className="card-footer-section">
              <div className="deadline-info">
                Deadline: <span className="no-deadline-red">No deadline set</span>
              </div>
              <button className="download-list-btn">
                Download Pending List
                <FaArrowRight className="ms-2" />
              </button>
            </div>
          </section>

          {/* Appraiser Completion */}
          <section className="completion-card-white">
            <h2 className="card-title-accent">Appraiser Completion</h2>
            <div className="stats-row">
              <div className="stat-column">
                <div className="stat-number-green">100.0%</div>
                <div className="stat-description">Appraiser Completed Employees in Percentage</div>
              </div>
              <div className="stat-column">
                <div className="stat-number-green">2</div>
                <div className="stat-description">Appraiser Completed Employees</div>
              </div>
              <div className="stat-column">
                <div className="stat-number-green">0</div>
                <div className="stat-description">Pending Officers</div>
              </div>
            </div>
            <div className="card-footer-section">
              <div className="deadline-info">
                Deadline: <span className="no-deadline-red">No deadline set</span>
              </div>
              <button className="download-list-btn">
                Download Pending List
                <FaArrowRight className="ms-2" />
              </button>
            </div>
          </section>
        </div>

        {/* Reviewer Completion - Full Width */}
        <section className="completion-card-white">
          <h2 className="card-title-accent">Reviewer Completion</h2>
          <div className="stats-row">
            <div className="stat-column">
              <div className="stat-number-green">100.0%</div>
              <div className="stat-description">Reviewer Completed Employees in Percentage</div>
            </div>
            <div className="stat-column">
              <div className="stat-number-green">2</div>
              <div className="stat-description">Reviewer Completed Employees</div>
            </div>
            <div className="stat-column">
              <div className="stat-number-green">0</div>
              <div className="stat-description">Pending Officers</div>
            </div>
          </div>
          <div className="card-footer-section">
            <div className="deadline-info">
              Deadline: <span className="no-deadline-red">No deadline set</span>
            </div>
            <button className="download-list-btn">
              Download Pending List
              <FaArrowRight className="ms-2" />
            </button>
          </div>
        </section>
         <UtilitiesSection/>

         <ReportingAuthority/>

         {/* <AppraiserUpdate/> */}
      </div>
     
    </div>
  );
};

export default HrDashboard;