import React, { useState, useEffect } from "react";
import "./AppealComittee.css";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import { appraisalAPI } from "../../../../services/api";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

const AppealComittee = () => {
  const [file, setFile] = useState(null);
  const [downloading, setDownloading] = useState(false);


  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

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

  console.log({ roleName, sol, empNo });


  const [searchParams] = useSearchParams();
  const quarter = searchParams.get("quarter");               // Q1
  // Q1
  const financialYear = searchParams.get("financialYear");
  const requestBody = {
    moduleName: "appraisal",
    selectedYear: "2024",
    selectedQuater: quarter,
    selectedScale: "1",
    activeDate: "2024-04-01",
    inActiveDate: "2024-06-30",
    employeeNumber: empNo
  };



  // React Query mutation: Download sample file
  const downloadSampleMutation = useMutation({
    mutationFn: async () => {
      const blob = await appraisalAPI.appealCommittee.downloadSample({
        roleName: roleName,
        regionCode: empNo, // Using empNo as regionCode as per cURL
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
        `appeal_committee_sample_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Sample file downloaded successfully!");
    },
    onError: (error) => {
      console.error("Download sample error:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to download sample file!";
      toast.error(errorMessage);
    },
  });

  // Handle download sample button click
  const handleDownloadSample = () => {
    // Validate required parameters
    if (!roleName) {
      toast.error("Role name is missing. Please check your authentication.");
      return;
    }
    if (!empNo) {
      toast.error("Employee number is missing. Please check your authentication.");
      return;
    }
    if (!quarter) {
      toast.error("Quarter is missing. Please check URL parameters.");
      return;
    }
    if (!financialYear) {
      toast.error("Financial year is missing. Please check URL parameters.");
      return;
    }
    
    downloadSampleMutation.mutate();
  };



  // React Query: fetch error logs
  const {
    data: errorLogs,
    isLoading: isLogsLoading,
    isError: isLogsError,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: [
      "appealCommitteeErrorLogs",
      extractYear(financialYear),
      roleName,
    ],
    queryFn: () =>
      appraisalAPI.appealCommittee.getErrorLogs({
        financialYear: extractYear(financialYear),
        roleName,
      }),
    enabled: !!financialYear && !!roleName,
    retry: false,
  });

  // Optional: show toast if logs fetch fails
  useEffect(() => {
    if (isLogsError) {
      const msg =
        logsError?.response?.data?.message ||
        logsError?.message ||
        "Failed to fetch appeal committee logs";
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error("AppealCommittee logs error:", logsError);
    }
  }, [isLogsError, logsError]);

  // React Query mutation: upload file
  const uploadMutation = useMutation({
    mutationFn: async ({ file }) => {
      if (!file) {
        throw new Error("Please select a file");
      }

      // Optional: basic size guard
      if (file.size === 0) {
        throw new Error("Selected file is empty");
      }

      return appraisalAPI.appealCommittee.uploadFile({
        file,
        sol,
        roleName,
        empNo,
      });
    },
    onSuccess: (data) => {
      const message =
        data?.message ||
        data?.results?.[0]?.MESSAGE ||
        "File uploaded successfully!";
      toast.success(message);
      setFile(null);
      // reload table
      refetchLogs();
    },
    onError: (error) => {
      console.error("AppealCommittee upload error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Upload failed!";
      toast.error(errorMessage);
    },
  });

  // Handle Upload button click
  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    uploadMutation.mutate({ file });
  };

  // Download Data Table
  const downloadData = async () => {
    try {
      setDownloading(true);

      const blob = await appraisalAPI.appealCommittee.downloadDataTable({
        // Let axios handle URL encoding; pass plain text values
        roleName: roleName,
        regionCode: empNo, // or hardcode "36663" if that’s required
        quarter: quarter,
    financialYear: extractYear(financialYear)
      });

      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "AppealCommitteeData.xlsx";
      a.click();
    } catch (error) {
      alert("Failed to download data table");
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };




  return (
    <div className="AppraiserContaniner">

      {/* BREADCRUMB */}
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        <div className="breadcrumb-path">
          <span className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Appraisal HR Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Update Appellate Authority details in bulk</span>
        </div>

        <div className="breadcrumb-info d-flex align-items-center">
          <span className="breadcrumb-fy me-2">FY 2025-2026</span>
          <button className="blue-button d-inline-flex align-items-center gap-1 bg-white px-2 py-1 border border-dark">
            <FaInfoCircle size={13} /> Info
          </button>
        </div>
      </div>

      <div className="page">
        {/* Header */}
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
          Update Appellate Authority details in bulk          </h1>
        </div>

        {/* Upload + Buttons */}
        <section className="cards">

          <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">

            {/* FILE UPLOAD */}
            <div className="d-flex align-items-center" style={{ border: "1px solid #3fa8e7", borderRadius: "9px" }}>
              <label className="btn">
                SELECT A FILE
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              <button
                className="primary-button btn"
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "UPLOAD"}
              </button>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="d-flex gap-2">
              <button
  className=" btn primary-button text-button"
  onClick={downloadData}
  disabled={downloading}
>
  {downloading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Preparing file...
    </>
  ) : (
    "Download Data Table"
  )}
</button>


              <button
                className="btn primary-button text-button"
                onClick={handleDownloadSample}
                disabled={downloadSampleMutation.isPending}
              >
                {downloadSampleMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Preparing file...
                  </>
                ) : (
                  "Download Sample"
                )}
              </button>
            </div>
          </div>

          <p className="text-muted">
            NOTE: Please upload file with <strong>.xlsx</strong> extension only
          </p>

          {/* TABLE */}
          <div className="table-responsive mt-3">
            <table className="table table-bordered text-center align-middle">
              <thead className="table-header">
                <tr>
                  <th>Sr. No.</th>
                  <th>File Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Records Inserted</th>
                  <th>Uploaded By</th>
                  <th>Download File</th>
                </tr>
              </thead>

              <tbody>
                {isLogsLoading ? (
                  <tr>
                    <td colSpan="7" className="text-muted">
                      Loading logs...
                    </td>
                  </tr>
                ) : (
                  (() => {
                    // Normalize API response shape to an array
                    const logsArray =
                      (Array.isArray(errorLogs) && errorLogs) ||
                      errorLogs?.files ||
                      errorLogs?.list_data ||
                      errorLogs?.results ||
                      [];

                    if (!logsArray || logsArray.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" className="text-muted">
                            No records found
                          </td>
                        </tr>
                      );
                    }

                    return logsArray.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item.fileName || item.FILE_NAME}</td>
                        <td>{item.date || item.UPLOADED_DATE}</td>
                        <td>{item.status || item.STATUS}</td>
                        <td>{item.recordsInserted || item.RECORDS_INSERTED}</td>
                        <td>{item.uploadedBy || item.UPLOADED_BY}</td>
                        <td>
                          <button className="btn btn-sm btn-primary">
                            Download
                          </button>
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>

        </section>
      </div>
    </div>
  );
};

export default AppealComittee;
