import React from "react";
import "./ReportingAuthority.css";

const ReportingAuthority = () => {
  return (
    <div className="page container-fluid py-4">
      {/* Back Button */}
      <div className="mb-3">
        <button className="back-button btn btn-outline-secondary">
          ← BACK
        </button>
      </div>

      {/* Page Title */}
      <section className="card">
        <h2 className="mb-4 fw-bold">Reporting Authority update in bulk</h2>

        {/* Upload Section */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <div className="d-flex align-items-center gap-2">
            <input type="file" className="form-control w-auto" />
            <button className="primary-button btn">UPLOAD</button>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary text-button">
              Download Data Table
            </button>
            <button className="btn btn-outline-primary primary-button">
              Download Sample
            </button>
          </div>
        </div>

        <p className="text-muted">
          NOTE: Please upload file with <strong>.xlsx</strong> extension only
        </p>

        {/* Table Section */}
        <div className="table-responsive mt-3">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-header">
              <tr>
                <th>Sr. No.</th>
                <th>Files Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>No. Of Records Inserted</th>
                <th>Uploaded By</th>
                <th>Download File</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="text-muted">
                  No records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ReportingAuthority;
