import React from "react";
import { FaDownload } from "react-icons/fa";
import "./ReportingReviewBulk.css";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";

const ReportingReviewBulk = () => {
    const tableData = [
        {
            id: 1,
            fileName: "admin_hr_update_repa_sample_success_log_2025-10-21-15-48-50.xlsx",
            date: "21-OCT-2025 03:48 PM",
            status: "SUCCESS",
            records: 5,
            uploadedBy: "ANCHAL NAYAR"
        },
        {
            id: 2,
            fileName: "admin_hr_update_repa_reva_failed_2025-10-21-16-12-11.xlsx",
            date: "21-OCT-2025 04:12 PM",
            status: "FAILED",
            records: 0,
            uploadedBy: "RAHUL KHANNA"
        }
    ];


    return (
        <div className="AppraiserContaniner">
            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                {/* Left Side: Breadcrumb */}
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active"> Reporting Authority and Reviewing Authority update in bulk </span>
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
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3"> Reporting Authority and Reviewing Authority update in bulk </h1>
            </div>

            <section className="mt-4 card">

                {/* Upload Row */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                    <div className="d-flex gap-2">
                        <label className="btn btn-outline-secondary">
                            SELECT A FILE
                            <input type="file" hidden />
                        </label>

                        <button className="primary-button">UPLOAD</button>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn primary-button">Download Sample</button>
                        <button className="btn primary-button">Download Data Table</button>
                    </div>
                </div>

                <p className="text-muted small">NOTE: Please upload file with .xlsx extension only</p>

                {/* Table */}
                <div className="table-responsive mt-4">
                    <table className="table custom-table mb-0">
                        <thead>
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
                            {tableData.map((row) => (
                                <tr key={row.id}>
                                    <td className="text-center">{row.id}</td>
                                    <td className="file-name">{row.fileName}</td>
                                    <td>{row.date}</td>
                                    <td className={row.status === "SUCCESS" ? "status-success" : "status-failed"}>
                                        {row.status}
                                    </td>
                                    <td>{row.records}</td>
                                    <td>{row.uploadedBy}</td>
                                    <td className="download-cell">
                                        <FaDownload className="download-icon" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


            </section>
        </div>
    );
};

export default ReportingReviewBulk;
