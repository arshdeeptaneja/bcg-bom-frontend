import React, { useState } from "react";
import "./ExceptionDelection.css"; // custom overrides
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";

const ExceptionDeletion = () => {
    const [empNumber, setEmpNumber] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Searching for EMP Number:", empNumber);
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
                    <span className="breadcrumb-active"> Exception Delection Utility </span>
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
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exception Delection Utility </h1>
            </div>
            {/* Search Section */}
            <section className="exception-section p-4">
                <form onSubmit={handleSearch}>
                    <div className="mb-3">
                        <label htmlFor="empNumber" className="form-label fw-semibold">
                            Enter EMP Number
                        </label>
                        <div className="d-flex align-items-center gap-2" style={{width:"40%"}}>
                            <input
                                type="text"
                                id="empNumber"
                                className="form-control flex-grow-1 exception-input"
                                placeholder="Enter EMP Number"
                                value={empNumber}
                                onChange={(e) => setEmpNumber(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn btn-accents px-4 fw-semibold"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default ExceptionDeletion;
