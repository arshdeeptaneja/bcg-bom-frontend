import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ModuleActiveInactiveDate.css"; // your custom CSS
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";

const ModuleActiveInactiveDate = () => {
    const [filters, setFilters] = useState({
        moduleName: "",
        financialYear: "",
        quarter: "",
        scale: "",
    });

    const data = [
        {
            moduleName: "Appeal",
            quarter: "ANNUAL",
            scale: "N/A",
            financialYear: "2026",
            activeDate: "01-SEP-25",
            inactiveDate: "30-NOV-25",
        },
        {
            moduleName: "REPA Appraisal",
            quarter: "Q4",
            scale: "3",
            financialYear: "2025",
            activeDate: "01-JUL-24",
            inactiveDate: "01-NOV-25",
        },
        {
            moduleName: "REPA Appraisal",
            quarter: "Q1",
            scale: "N/A",
            financialYear: "2026",
            activeDate: "01-SEP-25",
            inactiveDate: "30-NOV-25",
        },
    ];

    // sample data (empty for demonstration)
  const [datas, setDatas] = useState([]);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // derived pagination data
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);



  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

    const handleReset = () => {
        setFilters({ moduleName: "", financialYear: "", quarter: "", scale: "" });
    };

    return (
        <div className="AppraiserContaniner ">



            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                {/* Left Side: Breadcrumb */}
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active"> Module Active Inactive Date </span>
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
            <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                <div className="pageWrapper-header">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3"> Module Active Inactive Date </h1>
                </div>
                <button className="btn btn-success primary-button">Add Module</button>
            </div>


            <section className="mb-4 p-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Module NAME</label>
                        <select
                            className="form-select"
                            value={filters.moduleName}
                            onChange={(e) =>
                                setFilters({ ...filters, moduleName: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>Appeal</option>
                            <option>REPA Appraisal</option>
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Financial year</label>
                        <select
                            className="form-select"
                            value={filters.financialYear}
                            onChange={(e) =>
                                setFilters({ ...filters, financialYear: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>2025</option>
                            <option>2026</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">QUARTER</label>
                        <select
                            className="form-select"
                            value={filters.quarter}
                            onChange={(e) =>
                                setFilters({ ...filters, quarter: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>Q1</option>
                            <option>Q2</option>
                            <option>Q3</option>
                            <option>Q4</option>
                            <option>ANNUAL</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">SCALE</label>
                        <select
                            className="form-select"
                            value={filters.scale}
                            onChange={(e) =>
                                setFilters({ ...filters, scale: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        
                         <button className="btn reset-btn me-2" onClick={handleReset}>
                        Reset ↻
                    </button>


                    </div>
                      
                </div>

                {/* <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-outline-secondary me-2" onClick={handleReset}>
                        Reset ↻
                    </button>
                </div> */}

                 <div className="d-flex justify-content-end mt-5">
                <table className="table mb-0 align-middle">
                    <thead className="table-header">
                        <tr>
                            <th>Module Name</th>
                            <th>Quarter</th>
                            <th>Scale</th>
                            <th>Financial Year</th>
                            <th>Active Date</th>
                            <th>Inactive Date</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.moduleName}</td>
                                <td>{row.quarter}</td>
                                <td>{row.scale}</td>
                                <td>{row.financialYear}</td>
                                <td>{row.activeDate}</td>
                                <td>{row.inactiveDate}</td>
                                <td className="text-center">
                                    <button className="btn btn-sm edit-button me-2">Edit</button>
                                    <button className=" btn-sm delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

 

                
            </div>
              {/* pagination */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3">
          <small className="text-muted">
            Showing {data.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
          </small>
          <div>
            <button
              className="btn btn-link text-decoration-none p-0 me-3"
              disabled={currentPage === 1}
              onClick={handlePrev}
            >
              Previous
            </button>
            <button
              className="btn btn-link text-decoration-none p-0"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
</div>
            </section>

           
        </div>
    );
};

export default ModuleActiveInactiveDate;
