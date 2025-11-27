/**
 * The `ReportingReviewBulk` component in React handles bulk upload and download functionalities for
 * reporting authority data with error log display.
 * @returns The `ReportingReviewBulk` component is being returned. It contains JSX elements for a page
 * that allows users to upload, download, and view error logs for reporting authority updates in bulk.
 * The page includes file upload functionality, buttons to download sample and data table files, a
 * table displaying error logs, and some informational sections.
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { FaDownload } from "react-icons/fa";
// import "./ReportingReviewBulk.css";
import { BackButton } from "../../../../components/common";
import { useAuth } from "../../../../contexts/AuthContext";
import { appraisalAPI } from "../../../../services/api";
import LoadingSpinner from "../../../../components/Spinner";
import { useQuery } from "@tanstack/react-query";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { toast } from "react-toastify";

const ReportingAuthorityReviewBulk = () => {

  
  const [selectedFile, setSelectedFile] = useState(null);


  const { getUserProperty } = useAuth();

// these are directly stored in userData in AuthContext.localStorage
const sol = getUserProperty("sol") 
         || getUserProperty("LOCATION") 
         || getUserProperty("solId");
         
const empNo = getUserProperty("empNo") 
           || getUserProperty("EMP_ID");

const roleName = getUserProperty("ROLE_TYPE") 
              || getUserProperty("roleType") 
              || getUserProperty("designation")
              || getUserProperty("ROLE_NAME");

console.log({roleName, sol, empNo});


const [searchParams] = useSearchParams();

const quarter = searchParams.get("quarter");               // Q1
const financialYear = searchParams.get("financialYear");   // FY 2025-26


  // UI + Loader State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");


  // ---- Financial year dropdown logic (same as ExceptionVerify.jsx) ----
  const getFinancialYears = () => {
    const years = [];
    const now = new Date();
    const currentYear =
      now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

    for (let i = 0; i < 6; i++) {
      const start = currentYear - i;
      const end = (start + 1).toString().slice(2);
      years.push(`FY ${start}-${end}`);
    }
    return years;
  };



  // // Extract the year as "2025"
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };
const numericYear = extractYear(financialYear);   // → "2025"

  
  //handles file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    try {
      await appraisalAPI.reportingAuthorityAndReviewAnnualUpload({
        file: selectedFile,
        sol: sol,
        roleName: roleName,
        empNo: empNo,
      });

      toast.success("Upload successful!");
    } catch (err) {
      toast.error("Upload failed.");
      console.error(err);
    }
  };

  //CANNOT FIND QUARTER.

  // downloads sample file
  const handleDownloadSample = async () => {
    try {
      const blob = await appraisalAPI.reportingAuthorityBulkDownloadSample({
        roleName: roleName,
        regionCode: sol,
        quarter: quarter,              // Coming from URL
      financialYear: numericYear, 
      });

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `reporting_authority_bulk_sample_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("File downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download sample file.");
    }
  };

  // downloads data table


  const handleDownloadDataTable = async () => {
    try {
      setIsDownloading(true);
      setDownloadMessage("Preparing your file... Please wait.");

      const blob = await appraisalAPI.reportingAuthorityAndReviewAnnualDownloadDataTable({
       roleName: roleName,       
  regionCode: sol,
        quarter: quarter,              // Coming from URL
      financialYear: numericYear, 
      });


      setDownloadMessage("Generating download...");

      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sample_data_table.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean Up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadMessage("Download ready!");
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadMessage("");
      }, 1500);

    } catch (error) {
      console.error("Download error:", error);
      setDownloadMessage("Failed to download. Please try again.");
      setIsDownloading(false);
    }
  };


  const {
    data: errorLogs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reportingAuthorityAndReviewAnnualErrorLogs", financialYear],
    queryFn: () =>
      appraisalAPI.reportingAuthorityAndReviewAnnualErrorLogs({
        financialYear: extractYear(financialYear),
      }),
    enabled: !!financialYear,
  });

  // Show toast if API fails
  useEffect(() => {
    if (isError) {
      toast.error(
        `Failed to fetch error logs: ${error?.message || "Unknown error"}`
      );
    }
  }, [isError, error]);

  const tableData = errorLogs?.files || [];


  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
Reporting Authority and Reviewing Authority update in bulk          </h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // const tableData = [
  //     {
  //         id: 1,
  //         fileName: "admin_hr_update_repa_reva_surl_sample_success_log_2025-10-21-15-48-50.xlsx",
  //         date: "21-OCT-2025 03:48 PM",
  //         status: "FAILED",
  //         records: 5,
  //         uploadedBy: "ANCHAL NAYAR"
  //     },
  //     {
  //         id: 2,
  //         fileName: "admin_hr_update_repa_reva_failed_2025-10-21-16-12-11.xlsx",
  //         date: "21-OCT-2025 04:12 PM",
  //         status: "FAILED",
  //         records: 0,
  //         uploadedBy: "RAHUL KHANNA"
  //     }
  // ];


  return (
    <div className="pageWrapper">
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        {/* Left Side: Breadcrumb */}
        <div className="breadcrumb-path">
          <span className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Appraisal HR Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active"> Reporting Authority and Reviewing Authority update in bulk</span>
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
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <div className="d-flex align-items-center" style={{ border: "1px solid #3fa8e7", padding: "2px" }}>
            <label className="btn" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7" }}>
              SELECT A FILE
              <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </label>
            <button className="btn" style={{ color: "#2a2929ff" }} onClick={handleUpload}
            >
              <IoMdDownload />
              UPLOAD</button>
          </div>

          <div className="d-flex gap-2">


            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleDownloadDataTable}
              disabled={isDownloading}
            >
              {isDownloading && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              {isDownloading ? "Downloading..." : "Download Data Table"}
            </button>

            {downloadMessage && (
              <p className="mt-2 text-muted">{downloadMessage}</p>
            )}

            {/* <button className="btn btn-outline-primary primary-button" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7"}}        onClick={handleDownloadSample}
>
                Download Sample
              </button> */}
          </div>
        </div>


        <p className="text-muted small">NOTE: Please upload file with .xlsx extension only</p>

        {/* Table */}
        <div className="table-responsive mt-4">
          <table className="table custom-table mb-0">
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
  {/* No logs found case */}
  {(!tableData || tableData.length === 0) && (
    <tr>
      <td colSpan="7" className="text-center text-muted py-3">
        <strong>No logs found</strong>
      </td>
    </tr>
  )}

  {/* Show logs when available */}
  {tableData && tableData.length > 0 &&
    tableData.map((row, index) => (
      <tr key={row.id || index}>
        <td className="text-center">{index + 1}</td>
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

export default ReportingAuthorityReviewBulk;
