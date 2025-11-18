import React, { useState } from "react";
import { appraisalAPI } from "../../../../services/api";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";

const AppealDeletion = () => {
    const [empNumber, setEmpNumber] = useState("");
      const [loading, setLoading] = useState(false);
        const [tableData, setTableData] = useState([]);
        const [noData, setNoData] = useState(false);

    const handleSearch = async (e) => {
          e.preventDefault();
  
          if (!empNumber.trim()) {
              alert("Please enter EMP Number");
              return;
          }
  
          try {
              setLoading(true);
              setNoData(false);
  
              const res = await appraisalAPI.searchAppealDeleteURL({
                  empNo: empNumber,
              });
  
              if (res && res.length > 0) {
                  setTableData(res);
              } else {
                  setTableData([]);
                  setNoData(true);
              }
          } catch (error) {
              console.error(error);
              setNoData(true);
          } finally {
              setLoading(false);
          }
      };
  
      const handleDelete = async (urlId) => {
          const confirmDelete = window.confirm(
              "Are you sure you want to delete this exception?"
          );
  
          if (!confirmDelete) return;
  
          try {
              setLoading(true);
  
              const res = await appraisalAPI.deleteAppealDeleteURL({ urlId });
  
              alert("Exception deleted successfully!");
  
              // remove deleted row from UI
              setTableData((prev) => prev.filter((row) => row.urlId !== urlId));
  
              if (tableData.length === 1) {
                  setNoData(true);
              }
  
          } catch (error) {
              alert("Failed to delete exception!");
              console.error(error);
          } finally {
              setLoading(false);
          }
      };

    return (
        <div className="exception-page pageWrapper">
            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                {/* Left Side: Breadcrumb */}
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active"> Appeal Delection Utility </span>
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
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appeal Delection Utility </h1>
            </div>
            {/* Search Section */}
            <section className="exception-section p-4">
                <form onSubmit={handleSearch}>
                    <div className="mb-3">
                        <label htmlFor="empNumber" className="form-label fw-semibold">
                            Enter EMP Number
                        </label>

                        <div className="d-flex align-items-center gap-2" style={{ width: "40%" }}>
                            <input
                                type="text"
                                id="empNumber"
                                className="form-control flex-grow-1 exception-input"
                                placeholder="Enter EMP Number"
                                value={empNumber}
                                onChange={(e) => setEmpNumber(e.target.value)}
                            />

                            <button type="submit" className="btn btn-accents px-4 fw-semibold">
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            {/* Table Section */}
            <section className="p-4">
                {loading && <p className="text-muted">Loading...</p>}

                {!loading && noData && (
                    <p className="text-danger fw-semibold">No data found!</p>
                )}

                {tableData.length > 0 && (
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered align-middle">
                            <thead className="table-header">
                                <tr>
                                    <th>EC Number</th>
                                    <th>Employee Name</th>
                                    <th>URL ID</th>
                                    <th>Quarter</th>
                                    <th>Zone</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tableData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.ecNumber}</td>
                                        <td>{item.employeeName}</td>
                                        <td>{item.urlId}</td>
                                        <td>{item.quarter}</td>
                                        <td>{item.zoneName}</td>
                                        <td>{item.status}</td>

                                        {/* DELETE BUTTON */}
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(item.urlId)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AppealDeletion;
