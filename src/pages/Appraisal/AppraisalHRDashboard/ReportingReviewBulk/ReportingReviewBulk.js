/**
 * Reporting Authority and Reviewing Authority Update in Bulk
 * Allows HR admins to upload, download, and view error logs for bulk updates
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaDownload } from "react-icons/fa";
import "./ReportingReviewBulk.css";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import LoadingSpinner from "../../../../components/Spinner";
import { useAuth } from "../../../../contexts/AuthContext";
import { appraisalAPI } from "../../../../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const ReportingReviewBulk = () => {
  const queryClient = useQueryClient();
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);

  // Get employee number from auth context
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
  const sol = getUserProperty('LOCATION', employeeDetails?.currentUser?.[0]?.LOCATION || employeeDetails?.currentUser?.[0]?.solid || '');
  const roleNameRaw = getUserProperty('ROLE_NAME', employeeDetails?.currentUser?.[0]?.ROLE_NAME || '');
  // Decode URL-encoded roleName (e.g., "Administrative+Officers" -> "Administrative Officers")
  const roleName = roleNameRaw ? roleNameRaw.replace(/\+/g, ' ') : '';
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

    // const financialYears = getFinancialYears();
    // const [financialYear, setFinancialYear] = useState(financialYears[0]);

    // Extract the year as "2025"
    const extractYear = (fy) => {
        const match = fy.match(/FY (\d{4})/);
        return match ? match[1] : new Date().getFullYear().toString();
    };
    const [searchParams] = useSearchParams();

const quarter = searchParams.get("quarter");               // Q1
const financialYear = searchParams.get("financialYear"); 
    
  // React Query mutation: Upload file
  const uploadMutation = useMutation({
    mutationFn: async ({ file }) => {
      return await appraisalAPI.reportingAuthorityAndReviewAnnualUpload({
        file: file,
        sol: sol,
        roleName: roleName,
        empNo: empNo,
      });
    },
    onSuccess: () => {
      toast.success("Upload successful!");
      queryClient.invalidateQueries({ queryKey: ["reportingAuthorityAndReviewAnnualErrorLogs"] }); // Refresh error logs
      setSelectedFile(null); // Clear selected file after successful upload
    },
    onError: (error) => {
      console.error("Upload error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Upload failed!";
      toast.error(errorMessage);
    },
  });

  // Auto-upload when file is selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-upload immediately
      uploadMutation.mutate({ file });
    }
  };

  // Manual upload handler (keeps button functionality)
  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    uploadMutation.mutate({ file: selectedFile });
  };

  // React Query mutation: Download sample file
  const downloadSampleMutation = useMutation({
    mutationFn: async () => {
      const blob = await appraisalAPI.reportingAuthorityReviewingAuthorityBulkDownloadSample({
        roleName: roleName,
        regionCode: sol,
        quarter: quarter,
        financialYear: extractYear(financialYear),
      });
      return blob;
    },
    onSuccess: (blob) => {
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
      window.URL.revokeObjectURL(url);
      toast.success("Sample file downloaded successfully!");
    },
    onError: (error) => {
      console.error("Download sample error:", error);
      toast.error("Failed to download sample file!");
    },
  });

  // React Query mutation: Download data table
  const downloadDataTableMutation = useMutation({
    mutationFn: async () => {
      const blob = await appraisalAPI.reportingAuthorityAndReviewAnnualDownloadDataTable({
        roleName: roleName,
        regionCode: sol,
        quarter: "Q1",
        financialYear: extractYear(financialYear),
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `reporting_authority_bulk_data_table_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Data table downloaded successfully!");
    },
    onError: (error) => {
      console.error("Download data table error:", error);
      toast.error("Failed to download data table!");
    },
  });
      


  // React Query: Fetch error logs
  const {
    data: errorLogs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reportingAuthorityAndReviewAnnualErrorLogs", extractYear(financialYear)],
    queryFn: () =>
      appraisalAPI.reportingAuthorityAndReviewAnnualErrorLogs({
        financialYear: extractYear(financialYear),
      }),
    enabled: !!financialYear,
    retry: false,
  });

  // Show toast if API fails
  useEffect(() => {
    if (isError) {
      toast.error(
        `Failed to fetch error logs: ${error?.message || "Unknown error"}`
      );
    }
  }, [isError, error]);

  // Extract table data from error logs response
  const tableData = errorLogs?.files || errorLogs?.list_data || (Array.isArray(errorLogs) ? errorLogs : []);


    if (isLoading) {
        return (
        <div className="pageWrapper">
            <div className="pageWrapper-header">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                Reporting Authority update in bulk
            </h1>
            </div>
            <LoadingSpinner />
        </div>
        );
    }
    // const tableData = [
    //     {
    //         id: 1,
    //         fileName: "admin_hr_update_repa_sample_success_log_2025-10-21-15-48-50.xlsx",
    //         date: "21-OCT-2025 03:48 PM",
    //         status: "SUCCESS",
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
                    <span className="breadcrumb-active">Reporting Authority update in bulk</span>
                </div>

                {/* Right Side: Info Section */}
                <div className="breadcrumb-info d-flex align-items-center">
                    <span className="breadcrumb-fy me-2">FY 2025-2026</span>
                    <button className="blue-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark">
                        <FaInfoCircle size={13} /> Info
                    </button>
                </div>
            </div>

            <div className="pageWrapper-header">
                <BackButton />
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Reporting Authority update in bulk</h1>
            </div>

            <section className="mt-4 card">

                {/* Upload Row */}
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                    <div className="d-flex align-items-center" style={{ border: "1px solid #3fa8e7", padding: "2px" }}>
                        <label className="btn" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7" }}>
                            SELECT A FILE
                            <input
                                type="file"
                                hidden
                                accept=".xlsx"
                                onChange={handleFileChange}
                            />
                        </label>
                        <button 
                            className="btn" 
                            style={{ color: "#2a2929ff" }} 
                            onClick={handleUpload}
                            disabled={uploadMutation.isPending || !selectedFile}
                        >
                            {uploadMutation.isPending ? "UPLOADING..." : "UPLOAD"}
                        </button>
                    </div>

                    <div className="d-flex gap-2">
                        {/* <button 
                            className="btn btn-primary d-flex align-items-center gap-2" 
                            onClick={() => downloadSampleMutation.mutate()}
                            disabled={downloadSampleMutation.isPending}
                        >
                            {downloadSampleMutation.isPending ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </>
                            ) : (
                                "Download Sample"
                            )}
                        </button> */}
                        <button 
                            className="btn btn-primary d-flex align-items-center gap-2 " 
                            onClick={() => downloadDataTableMutation.mutate()}
                            disabled={downloadDataTableMutation.isPending}
                        >
                            {downloadDataTableMutation.isPending ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </>
                            ) : (
                                "Download Data Table"
                            )}
                        </button>
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

export default ReportingReviewBulk;
