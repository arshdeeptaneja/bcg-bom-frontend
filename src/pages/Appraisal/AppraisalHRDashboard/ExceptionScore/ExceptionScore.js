/**
 * The ExceptionScore component renders a page with breadcrumb navigation, info section, back button,
 * and a table section displaying file upload information.
 * @returns The `ExceptionScore` component is being returned, which contains JSX elements for
 * displaying a page layout with breadcrumb navigation, info section, back button, page title, and a
 * table section. The table currently displays a message "No records found" as there are no records to
 * display.
 */

import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";


const ExceptionScore = () => {
  return (
    <div className="AppraiserContaniner">
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        {/* Left Side: Breadcrumb */}
        <div className="breadcrumb-path">
          <span className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Appraisal HR Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Exception Score Update Utility</span>
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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exception Score Update Utility</h1>
        </div>

        {/* Page Title */}
        <section className="card">


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

export default ExceptionScore;
