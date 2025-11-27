import React, { useState, useEffect } from "react";
import "./AppealComittee.css";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import { appraisalAPI } from "../../../../services/api";

const AppealComittee = () => {
  const [file, setFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch error logs on load
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await appraisalAPI.appealCommittee.getErrorLogs();
      setLogs(res || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setLoading(true);
      const res = await appraisalAPI.appealCommittee.uploadFile({ file });
      alert("File uploaded successfully!");
      fetchLogs(); // reload table
    } catch (err) {
      alert("Upload failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download Data Table
  const downloadData = async () => {
    try {
      const blob = await appraisalAPI.appealCommittee.downloadDataTable();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "AppealCommitteeData.xlsx";
      a.click();
    } catch (err) {
      alert("Failed to download data table");
    }
  };

  // Download Sample File
  const downloadSample = async () => {
    try {
      const blob = await appraisalAPI.appealCommittee.downloadSample();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Sample.xlsx";
      a.click();
    } catch (err) {
      alert("Failed to download sample");
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
          <span className="breadcrumb-active">Appeal Committee</span>
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
            Appeal Committee
          </h1>
        </div>

        {/* Upload + Buttons */}
        <section className="card">

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

              <button className="primary-button btn" onClick={handleUpload}>
                {loading ? "Uploading..." : "UPLOAD"}
              </button>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary text-button" onClick={downloadData}>
                Download Data Table
              </button>

              <button className="btn btn-outline-primary primary-button" onClick={downloadSample}>
                Download Sample
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
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-muted">No records found</td>
                  </tr>
                ) : (
                  logs.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item.fileName}</td>
                      <td>{item.date}</td>
                      <td>{item.status}</td>
                      <td>{item.recordsInserted}</td>
                      <td>{item.uploadedBy}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
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
