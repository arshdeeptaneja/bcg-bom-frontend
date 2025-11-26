/**
 * The QuarterlyAppraiserBulk component renders a page for managing quarterly appraiser details in
 * bulk, including file upload and download functionalities.
 * @returns The `QuarterlyAppraiserBulk` functional component is being returned. It contains JSX
 * elements for a page that allows users to upload, download, and view quarterly appraiser details in
 * bulk. The page includes a breadcrumb header, info section, back button, page title, upload section
 * for files, download buttons, a note about file extensions, and a table section (currently displaying
 * "No records
 */
import React from "react";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

const QuarterlyAppraiserBulk = () => {
  return (
    <div className="AppraiserContaniner">
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        {/* Left Side: Breadcrumb */}
        <div className="breadcrumb-path">
          <span className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Appraisal HR Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Quarterly Appraiser details in bulk</span>
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

      <div className="page ">
        {/* Back Button */}
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Appraiser details in bulk</h1>
        </div>

        {/* Page Title */}
        <section className="card">


          {/* Upload Section */}
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
            <div className="d-flex align-items-center" style={{ border: "1px solid #3fa8e7" , padding: "2px"}}>
              <label className="btn" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7"}}>
                SELECT A FILE
                <input type="file" hidden />
              </label>           
                 <button className="btn" style={{color:"#2a2929ff"}}>
                  <IoMdDownload />
                  UPLOAD</button>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary text-button" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7"}}>
                Download Data Table
              </button>
              <button className="btn btn-outline-primary primary-button" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7"}}>
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
    </div>
  );
};

export default QuarterlyAppraiserBulk;
