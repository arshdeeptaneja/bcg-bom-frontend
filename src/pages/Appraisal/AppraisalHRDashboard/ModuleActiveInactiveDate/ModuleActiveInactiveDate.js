/**
 * The `ModuleActiveInactiveDate` component in React manages modules with active and inactive dates,
 * allowing users to add, edit, and delete modules while providing pagination and filtering options.
 * @returns The `ModuleActiveInactiveDate` component is being returned. It contains JSX elements for
 * displaying a module active and inactive date management interface. The component includes filters
 * for module name, financial year, quarter, and scale, as well as a table displaying module data with
 * options to edit, delete, and add modules. Pagination functionality is also implemented to navigate
 * through the data entries. Additionally, there is a loading
 */
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ModuleActiveInactiveDate.css";
import { BackButton } from "../../../../components/common";
import { useQuery } from "@tanstack/react-query";
import { appraisalAPI } from "../../../../services/api";
import { FaInfoCircle } from "react-icons/fa";
import LoadingSpinner from "../../../../components/Spinner";

const ModuleActiveInactiveDate = () => {
    const [filters, setFilters] = useState({
        moduleName: "",
        financialYear: "",
        quarter: "",
        scale: "",
    });

    // React Query → DEFAULT VALUE ADDED (fixes undefined error)
    const { data = [], isLoading, refetch } = useQuery({
        queryKey: ["module-active-inactive"],
        queryFn: () => appraisalAPI.moduleActiveInactiveDateGetList(),
    });


    // Add Module
    const handleAdd = async () => {
        const payload = {
            moduleName: filters.moduleName,
            financialYear: filters.financialYear,
            quarter: filters.quarter,
            scale: filters.scale,
        };

    // const data = [
    //     {
    //         moduleName: "Appeal",
    //         quarter: "ANNUAL",
    //         scale: "N/A",
    //         financialYear: "2026",
    //         activeDate: "01-SEP-25",
    //         inactiveDate: "30-NOV-25",
    //     },
    //     {
    //         moduleName: "REPA Appraisal",
    //         quarter: "Q4",
    //         scale: "3",
    //         financialYear: "2025",
    //         activeDate: "01-JUL-24",
    //         inactiveDate: "01-NOV-25",
    //     },
    //     {
    //         moduleName: "REPA Appraisal",
    //         quarter: "Q1",
    //         scale: "N/A",
    //         financialYear: "2026",
    //         activeDate: "01-SEP-25",
    //         inactiveDate: "30-NOV-25",
    //     },
    // ];

        try {
            await appraisalAPI.moduleActiveInactiveDateUpdate({
                intent: "INSERT",
                payload,
            });

            alert("Module added successfully!");
            refetch(); // refresh list
        } catch (error) {
            alert("Failed to add module");
        }
    };

    // Update Module
    const handleEdit = async (row) => {
        const updated = window.prompt("Enter new Active Date (YYYY-MM-DD):", row.activeDate);
        if (!updated) return;

        const payload = {
            id: row.id,       // assuming backend requires ID
            activeDate: updated,
        };

        try {
            await appraisalAPI.moduleActiveInactiveDateUpdate({
                intent: "UPDATE",
                payload,
            });

            alert("Module updated!");
            refetch();
        } catch (error) {
            alert("Update failed");
        }
    };

    // Delete Module
    const handleDelete = async (row) => {
        const confirmDel = window.confirm("Delete this module?");
        if (!confirmDel) return;

        const payload = { id: row.id };

        try {
            await appraisalAPI.moduleActiveInactiveDateUpdate({
                intent: "DELETE",
                payload,
            });

            alert("Module deleted!");
            refetch();
        } catch (error) {
            alert("Delete failed");
        }
    };





    // ---------------- PAGINATION ----------------
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // ---------------- LOADER ----------------
    if (isLoading) {
        return (
            <div className="pageWrapper">
                <div className="pageWrapper-header">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Appraisal Home
                    </h1>
                </div>
                <LoadingSpinner />
            </div>
        );
    }

    // ---------------- UI ----------------
    return (
        <div className="AppraiserContaniner">
            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active">
                        Module Active Inactive Date
                    </span>
                </div>

                <div className="breadcrumb-info d-flex align-items-center">
                    <span className="breadcrumb-fy me-2">FY 2025-2026</span>
                    <button className="blue-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm bg-white px-2 py-1 border border-opacity-10 border-dark">
                        <FaInfoCircle size={13} /> Info
                    </button>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                <div className="pageWrapper-header">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Module Active Inactive Date
                    </h1>
                </div>
                <button className="btn btn-success primary-button" onClick={handleAdd}>
                    Add Module</button>
            </div>

            {/* ---------------- FILTERS ---------------- */}
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
                        <label className="form-label fw-semibold">Financial Year</label>
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
                        <button className="reset-btn me-2" onClick={handleReset}>
                            Reset ↻
                        </button>
                    </div>
                </div>

                {/* ---------------- TABLE ---------------- */}
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
                            {currentData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.moduleName}</td>
                                    <td>{row.quarter}</td>
                                    <td>{row.scale}</td>
                                    <td>{row.financialYear}</td>
                                    <td>{row.activeDate}</td>
                                    <td>{row.inactiveDate}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm edit-button me-2"
                                            onClick={() => handleEdit(row)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-sm delete-button"
                                            onClick={() => handleDelete(row)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ---------------- PAGINATION ---------------- */}
                <div className="d-flex justify-content-between align-items-center px-4 py-3">
                    <small className="text-muted">
                        Showing {data.length === 0 ? 0 : startIndex + 1} to{" "}
                        {Math.min(startIndex + itemsPerPage, data.length)} of {data.length}{" "}
                        entries
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
