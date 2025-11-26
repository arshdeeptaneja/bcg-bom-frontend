/**
 * The `AppraiserUpdate` component in JavaScript renders a dashboard for updating appraisals and
 * reviews by employee number.
 * @returns The `AppraiserUpdate` component is being returned. It contains JSX elements for a page
 * layout with breadcrumb navigation, info section, title, input controls, appraisal period selection,
 * quarterly period selection, a message for no data found, and a table structure.
 */
// AppraiserPage.jsx
import { BackButton } from '../../../../components/common';
import { FaInfoCircle } from "react-icons/fa";

import "./AppraiserUpdate.css";
import { useState } from 'react';

const AppraiserUpdate = () => {
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');


  return (
    <div className="AppraiserContaniner">
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        {/* Left Side: Breadcrumb */}
        <div className="breadcrumb-path">
          <span className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Appraisal HR Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Appraisal & Reviewing Update by Emp Number </span>
        </div>

        {/* Right Side: Info Section */}
        <div className="breadcrumb-info d-flex align-items-center">
          <span className="breadcrumb-fy me-2">FY 2025-2026</span>
          <button className="blue-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark"

          >
            <FaInfoCircle size={13} /> Info
          </button>
        </div>
      </div>
       <div className="pageWrapper-header">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisal & Reviewing Update by Emp Number </h1>
          </div>
      <div className="appraiser-page container-fluid p-4">


        {/* Top row: Back + Title + FY badge */}
        <div className="d-flex align-items-center mb-4">
         


        </div>

        {/* Controls row */}
        <div className="row gx-4 align-items-center mb-3">
          {/* Left area: input + search/reset */}
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center flex-wrap controls-left">
              <div className="ec-wrap me-3 mb-2 border">
                <input
                  type="text"
                  className="form-control ec-input"
                  placeholder="Enter EC Number"
                  aria-label="Enter EC Number"
                />
              </div>

              <div className="me-2 mb-2">
                <button className="btn-search">Search</button>
              </div>

              <div className="mb-2">
                <button className=" btn-reset">Reset</button>
              </div>
            </div>
          </div>

          {/* Right boxed options */}
          <div className="col-12 col-md-5">
             <div className="appraisal-box d-flex justify-content-between align-items-start p-3">
              {/* Appraisal Period */}
              <div className="period-section">
                <label className="period-title">Appraisal Period</label>
                <div className="period-btns mt-2" role="group">
                  <div
                    onClick={() => setAppraisalPeriod('Quarterly')}
                    className={`period-btn ${appraisalPeriod === 'Quarterly' ? 'active' : ''}`}>
                    Quarterly
                  </div>
                  <div
                    onClick={() => setAppraisalPeriod('Annual')}
                    className={`period-btn ${appraisalPeriod === 'Annual' ? 'active' : ''}`}>
                    Annual Year
                  </div>
                </div>
              </div>

              {/* Quarterly Period */}
              {appraisalPeriod === 'Quarterly' &&
                <div className="period-section">
                  <label className="period-title">Quarterly Period</label>
                  <div className="period-btns mt-2" role="group">
                    <div 
                     className={`period-btn ${selectedQuarter === 'Q1' ? 'active' : ''
                    }`}
                  onClick={() => setSelectedQuarter('Q1')}
                    >
                      Q1
                    </div>
                    <div
                       className={`period-btn ${selectedQuarter === 'Q2' ? 'active' : ''
                    }`}
                  onClick={() => setSelectedQuarter('Q2')}
                    >
                      Q2
                    </div>
                    <div 
                      className={`period-btn ${selectedQuarter === 'Q3' ? 'active' : ''
                    }`}
                  onClick={() => setSelectedQuarter('Q3')}
                    >
                      Q3
                    </div>
                    <div 
                     className={`period-btn ${selectedQuarter === 'Q4' ? 'active' : ''
                    }`}
                  onClick={() => setSelectedQuarter('Q4')}
                    >
                      Q4
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        {/* No data found */}
        <div className="mb-2">
          <small className="text-muted">No data found!</small>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-header">
                <tr>
                  <th>ASSIGNMENT ID</th>
                  <th>URL ID</th>
                  <th>EC Number</th>
                  <th>Employee Name</th>
                  <th>Main Role</th>
                  <th>SOL ID</th>
                  <th>Repa EMP Number</th>
                  <th>Zone</th>
                  <th>Action</th>
                  <th>Additional Role 1</th>
                  <th>Additional Role 2</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Repa Name</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {/* empty body (matching "No data found!") */}
              </tbody>
            </table>
          </div>

          {/* horizontal green progress bar like in screenshot */}

        </div>
      </div>
    </div>
  );
};

export default AppraiserUpdate;
