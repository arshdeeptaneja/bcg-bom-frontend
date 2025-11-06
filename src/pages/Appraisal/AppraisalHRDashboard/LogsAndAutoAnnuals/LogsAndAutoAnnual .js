import React from "react";
import "./LogsAndAutoAnnuals.css";

const LogsAndAutoAnnuals = () => {
  return (
    <div className="container-fluid py-4 page">

      {/* Logs Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="section-title mb-4">Logs</h5>

          <div className="row g-3">

            {[
              "Quarterly Appraisal Status Log",
              "Annual Appraisal Status Log",
              "Download annual appraiser details",
              "Appeal Report",
              "Q1 appraisal score log",
              "Q2 appraisal score log",
              "Q3 appraisal score log",
              "Q4 appraisal score log",
              "Annual Score Log",
              "Final Score Log",
              "Q1 appraisal status log",
              "Q2 appraisal status log",
              "Q3 appraisal status log",
              "Q4 appraisal status log",
              "Quarterly Exception Log",
              "Development Inputs Log",
              "Integrity Inputs Log",
              "Repa, Reva, and AC Remarks Log",
              "Exception approval List",
            ].map((item, index) => (
              <div className="col-md-3 col-sm-6" key={index}>
                <button className="log-btn w-100 d-flex align-items-center justify-content-between">
                  {item} <span className="download-icon">⭳</span>
                </button>
              </div>
            ))}

          </div>

        </div>
      </div>

      {/* Auto Annual Appraisal Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <h5 className="section-title mb-4">Auto Annual Appraisal</h5>

          <div className="row">
            <div className="col-md-3 fw-bold blue-text ">
              APPRAISAL PERIOD
            </div>
            <div className="col fw-bold blue-text">
              ACTION
            </div>
          </div>

          <hr />

          <div className="row align-items-center mb-3">
            <div className="col-md-3">
              Annual Appraisal
            </div>
            <div className="col-md-9">
              <div className="row g-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div className="col-md-3 col-sm-6" key={i}>
                    <button className="action-btn w-100">
                      Auto Submit Appraisee Scale {i + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LogsAndAutoAnnuals;
