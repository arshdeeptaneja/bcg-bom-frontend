import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import AppealTable from "../../../../components/AppealTable/AppealTable";

const Data = [
  {
    ticketId: 1,
    empNumber: "R25494",
    empName: "RAMA M.S.",
    primaryRole: "ZO Retail/MSME Loans Officer",
    branch: "CHENNAI ZO",
    preAppeal: "1.6/30 A",
    postAppeal: "1.4/30",
    appealStatus: "Accepted",
  },
  {
    ticketId: 22,
    empNumber: "R12992",
    empName: "RAJIV KUMAR BANSAL",
    primaryRole: "Zonal Head",
    branch: "CHENNAI ZO",
    preAppeal: "2.8/5.0",
    postAppeal: "3.4/5.0",
    appealStatus: "Pending",
  },
  {
    ticketId: 81,
    empNumber: "N12875",
    empName: "NISHA",
    primaryRole: "Deposit Officer",
    branch: "VERPAL",
    preAppeal: "3.2/5.0",
    postAppeal: "4.4/5.0",
    appealStatus: "Pending",
  },
];
const EmployeeAppealList = () => {
    const [filters, setFilters] = useState({
        moduleName: "",
        financialYear: "",
        quarter: "",
        scale: "",
    });

 

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // derived pagination data
  const totalPages = Math.ceil(Data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;



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
            <div className="d-flex justify-content-between align-items-center  px-2">
                <div className="pageWrapper-header">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3"> Employee Appeal List </h1>
                </div>
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
                <AppealTable data={Data} />

              
              {/* pagination */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3">
          <small className="text-muted">
            Showing {Data.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, Data.length)} of {Data.length} entries
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

export default EmployeeAppealList;
