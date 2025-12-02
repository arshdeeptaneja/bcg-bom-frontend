/**
 * Validator Update Utility
 * Allows HR admins to upload, download, and view error logs for validator updates
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaDownload } from "react-icons/fa";
import "../ReportingReviewBulk/ReportingReviewBulk.css";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { appraisalAPI } from "../../../../services/api";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../../components/Spinner";


const ValidatorUpdateUtility = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null); // Store upload response results

  const { getUserProperty } = useAuth();

  // Get user data from auth context
  const sol = getUserProperty("sol")
      || getUserProperty("LOCATION")
      || getUserProperty("solId");

  const empNo = getUserProperty("empNo")
      || getUserProperty("EMP_ID");

  const roleNameRaw = getUserProperty("ROLE_TYPE")
      || getUserProperty("roleType")
      || getUserProperty("designation")
      || getUserProperty("ROLE_NAME");
  
  // Decode URL-encoded roleName (e.g., "Administrative+Officers" -> "Administrative Officers")
  const roleName = roleNameRaw ? roleNameRaw.replace(/\+/g, ' ') : '';

  // Extract year from financial year string (e.g., "FY 2024" -> "2024")
  const extractYear = (fy) => {
    const match = fy?.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Get query params from URL
  const [searchParams] = useSearchParams();
  const quarter = searchParams.get("quarter"); // Q1, Q2, Q3, Q4
  const financialYear = searchParams.get("financialYear");

  // React Query mutation: Upload file
  const uploadMutation = useMutation({
    mutationFn: async ({ file }) => {
      // Validate file before upload
      if (!file) {
        throw new Error("No file selected");
      }
      if (file.size === 0) {
        throw new Error("File is empty");
      }
      
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileName = file.name || '';
      const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        throw new Error("Invalid file type. Please upload an Excel file (.xlsx or .xls)");
      }

      // Check authentication token
      const accessToken = localStorage.getItem('accessToken');
      console.log("Validator upload - Token check:", {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none'
      });

      console.log("Validator upload payload:", { 
        file: { 
          name: file.name, 
          size: file.size, 
          type: file.type,
          lastModified: file.lastModified,
          isFile: file instanceof File,
          isBlob: file instanceof Blob,
        },
        empNo 
      });

      // Validate required parameters
      if (!empNo) {
        console.error("Missing required parameter: empNo");
        throw new Error("Missing required parameter: empNo");
      }
      
      if (!accessToken) {
        console.error("No access token found in localStorage. User may need to log in again.");
        toast.error("Authentication token missing. Please log in again.");
        throw new Error("No access token found");
      }

      return await appraisalAPI.validatorUpdate.uploadFile({
        file,
        empNo: empNo,
      });
    },
    onSuccess: async (data) => {
      console.log("Validator upload success:", data);
      
      // Store upload results to display in table
      if (data?.results?.INVALID_ENTRY) {
        setUploadResults(data.results.INVALID_ENTRY);
      }
      
      // Show success message with details
      const message = data?.message || "File uploaded successfully!";
      const successCount = data?.successCount || 0;
      const totalCount = data?.totalCount || 0;
      toast.success(`${message} (${successCount}/${totalCount} records)`);
      
      setFile(null); // Clear selected file after successful upload
      
      // Refetch error logs after successful upload
      if (financialYear) {
        await queryClient.invalidateQueries({ queryKey: ["validatorUpdateErrorLogs"] });
        // Also manually refetch to ensure data is updated
        setTimeout(() => {
          refetchErrorLogs();
        }, 1000); // Wait 1 second for backend to process
      }
    },
    onError: (error) => {
      console.error("Validator upload error:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        headers: error?.response?.headers,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          hasAuth: !!error?.config?.headers?.Authorization,
          contentType: error?.config?.headers?.['Content-Type'],
          isFormData: error?.config?.data instanceof FormData,
        }
      });
      
      let errorMessage = "Upload failed!";
      if (error?.response?.status === 400) {
        // 400 Bad Request - usually means request format is wrong
        errorMessage = error?.response?.data?.message || 
                      error?.response?.data?.error || 
                      error?.response?.data?.detail ||
                      "Bad request. Please check the file format and try again.";
        console.error("400 Bad Request - Possible causes:");
        console.error("1. File format is incorrect (must be .xlsx)");
        console.error("2. File is empty or corrupted");
        console.error("3. Request format doesn't match backend expectations");
        console.error("4. Missing required parameters");
        console.error("Response data:", error?.response?.data);
      } else if (error?.response?.status === 403) {
        errorMessage = error?.response?.data?.message || 
                      error?.response?.data?.error || 
                      "Access forbidden. Please check your permissions or contact administrator.";
        console.error("403 Forbidden - Possible causes:");
        console.error("1. Token is missing or expired");
        console.error("2. User role doesn't have permission for this endpoint");
        console.error("3. Backend authorization check failed");
        console.error("Response data:", error?.response?.data);
      } else {
        errorMessage = error?.response?.data?.message || error?.message || "Upload failed!";
      }
      
      toast.error(errorMessage);
      setUploadResults(null); // Clear results on error
    },
  });

  // Auto-upload when file is selected
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-upload immediately
      uploadMutation.mutate({ file: selectedFile });
    }
  };

  // Manual upload handler (keeps button functionality)
  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    uploadMutation.mutate({ file });
  };

  // React Query mutation: Download sample file
  const downloadSampleMutation = useMutation({
    mutationFn: async () => {
      const blob = await appraisalAPI.validatorUpdate.downloadSample({
        roleName: roleName,
        regionCode: sol,
        quarter: quarter || "Q1",
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
        `validator_update_sample_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Sample file downloaded successfully!");
    },
    onError: (error) => {
      console.error("Download sample error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to download sample file!";
      toast.error(errorMessage);
    },
  });

  // React Query mutation: Download data table
  const downloadDataTableMutation = useMutation({
    mutationFn: async () => {
      const blob = await appraisalAPI.validatorUpdate.downloadDataTable({
        roleName: roleName,
        regionCode: sol,
        quarter: quarter || "Q1",
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
        `validator_update_data_table_${Date.now()}.xlsx`
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

  // Handle download sample button click
  const handleDownloadSample = () => {
    downloadSampleMutation.mutate();
  };

  // React Query: Fetch error logs
  const {
    data: errorLogs,
    isLoading,
    isError,
    error,
    refetch: refetchErrorLogs,
  } = useQuery({
    queryKey: ["validatorUpdateErrorLogs", extractYear(financialYear), roleName],
    queryFn: async () => {
      const year = extractYear(financialYear);
      // Ensure roleName is properly decoded before sending
      const decodedRoleName = roleName ? roleName.replace(/\+/g, ' ') : roleName;
      console.log("Fetching validator error logs for year:", year, "roleName:", decodedRoleName);
      const res = await appraisalAPI.validatorUpdate.getErrorLogs({
        financialYear: year,
        roleName: decodedRoleName,
      });
      console.log("Validator error logs response:", res);
      return res;
    },
    enabled: !!financialYear && !!roleName, // Only fetch if financialYear and roleName are available
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

  // Extract table data from error logs response - handle multiple response structures
  // Priority: upload results > error logs
  const tableData = uploadResults 
    || errorLogs?.files 
    || errorLogs?.list_data 
    || errorLogs?.data
    || (Array.isArray(errorLogs) ? errorLogs : []);
  
  // Debug: Log table data
  useEffect(() => {
    console.log("Table data for validator error logs:", tableData);
    console.log("Error logs raw response:", errorLogs);
    console.log("Financial year:", financialYear, "Extracted year:", extractYear(financialYear));
  }, [tableData, errorLogs, financialYear]);

  // Show loading spinner while fetching error logs
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Validator Update Utility
          </h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }


  return (
    <div className="pageWrapper">
            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                {/* Left Side: Breadcrumb */}
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active"> Validator Update Utility</span>
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
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Validator Update Utility </h1>
            </div>

            <section className="mt-4 card">

                {/* Upload Row */}
               <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
            <div className="d-flex align-items-center" style={{ border: "1px solid #3fa8e7" , padding: "2px"}}>
              <label className="btn" style={{ border: "1.5px solid #3fa8e7", borderRadius: "0px", color: "#3fa8e7"}}>
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
                disabled={uploadMutation.isPending || !file}
              >
                <IoMdDownload />
                {uploadMutation.isPending ? "UPLOADING..." : "UPLOAD"}
              </button>
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary d-flex align-items-center gap-2" 
                onClick={handleDownloadSample}
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
              </button>
              
              <button 
                className="btn btn-primary d-flex align-items-center gap-2" 
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
      <th className="text-center">Sr. No.</th>
      <th className="text-center">Validator Number</th>
      <th className="text-center">Employee ID</th>
      <th className="text-center">URL ID</th>
      <th className="text-center">Status</th>
      <th className="text-center">Financial Year</th>
      <th className="text-center">Quarter</th>
      <th className="text-center">Created Date</th>
      <th className="text-center">Error Message</th>
      <th className="text-center">Is Validated</th>
    </tr>
  </thead>

  <tbody>
    {/* Loading state for error logs (not for upload) */}
    {isLoading && !uploadResults && (
      <tr>
        <td colSpan="10" className="text-center text-muted py-3">
          <strong>Loading error logs...</strong>
        </td>
      </tr>
    )}

    {/* Error state */}
    {!isLoading && isError && !uploadResults && (
      <tr>
        <td colSpan="10" className="text-center text-danger py-3">
          <strong>Error loading logs: {error?.message || "Unknown error"}</strong>
        </td>
      </tr>
    )}

    {/* No data found case */}
    {!isLoading && !isError && !uploadResults && (!tableData || tableData.length === 0) && (
      <tr>
        <td colSpan="10" className="text-center text-muted py-3">
          <strong>No data found. Upload a file to see results.</strong>
        </td>
      </tr>
    )}

    {/* Show upload results or error logs when available */}
    {tableData && tableData.length > 0 &&
      tableData.map((row, index) => {
        // Handle upload response structure (INVALID_ENTRY)
        const validatorNum = row.VALIDATOR_NUM || row.validatorNum || row.validator_num || '-';
        const empId = row.EMP_ID || row.empId || row.emp_id || '-';
        const urlId = row.URL_ID || row.urlId || row.url_id || '-';
        const status = row.STATUS || row.status || '-';
        const fy = row.FY || row.fy || row.financialYear || '-';
        const quarter = row.QUARTER || row.quarter || '-';
        const createdDate = row.CREATED_DATE || row.createdDate || row.created_date || '-';
        const errorMessage = row.ERROR_MESSAGE || row.errorMessage || row.error_message || '-';
        const isValidated = row.IS_VALIDATED || row.isValidated || row.is_validated || '-';

        return (
          <tr key={row.URL_ID || row.urlId || row.id || index}>
            <td className="text-center">{index + 1}</td>
            <td className="text-center">{validatorNum}</td>
            <td className="text-center">{empId}</td>
            <td className="text-center">{urlId}</td>
            <td className={status === "success" || status === "SUCCESS" ? "status-success text-center" : "status-failed text-center"}>
              {status}
            </td>
            <td className="text-center">{fy}</td>
            <td className="text-center">{quarter}</td>
            <td className="text-center">{createdDate}</td>
            <td className="text-center">{errorMessage !== '-' && errorMessage ? errorMessage : '-'}</td>
            <td className="text-center">{isValidated}</td>
          </tr>
        );
      })}
  </tbody>
</table>

                </div>


            </section>
        </div>
    );
};

export default ValidatorUpdateUtility;
