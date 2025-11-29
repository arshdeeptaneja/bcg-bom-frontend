/**
 * Exception Deletion Utility
 * Allows HR admins to search and delete exception records by employee number
 */
import React, { useState } from "react";
import "./ExceptionDelection.css";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { BackButton } from "../../../../components/common";
import { appraisalAPI } from "../../../../services/api";
import { FaInfoCircle } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const ExceptionDeletion = () => {
    // State management
    const [empNumber, setEmpNumber] = useState("");
    const [shouldSearch, setShouldSearch] = useState(false);
    const queryClient = useQueryClient();

    // Extract year from financial year string (e.g., "FY 2024" -> "2024")
    const extractYear = (fy) => {
        const match = fy?.match(/FY (\d{4})/);
        return match ? match[1] : new Date().getFullYear().toString();
    };

    // Get user data from auth context
    const { getUserProperty } = useAuth();
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

    // Get query params from URL
    const [searchParams] = useSearchParams();
    const quarter = searchParams.get("quarter"); // Q1, Q2, Q3, Q4
    const financialYear = searchParams.get("financialYear"); 

    // React Query: Search exception deletion records
    const {
        data: searchResponse,
        isLoading: loading,
        isError: isSearchError,
        error: searchError,
        refetch: refetchSearch,
    } = useQuery({
        queryKey: ["exceptionDeleteSearch", empNumber, roleName, sol, extractYear(financialYear)],
        queryFn: async () => {
            const res = await appraisalAPI.searchExceptionDeleteURL({
                searchEmpNo: empNumber,
                roleName: roleName,
                sol: sol,
                financialYear: extractYear(financialYear),
            });
            // Handle response structure: { "list_data": [...] } or { "list_data": null } or direct array
            return res || {};
        },
        enabled: shouldSearch && !!empNumber.trim() && !!roleName && !!sol,
        retry: false,
    });

    // Extract list_data from response, handle null case
    const tableData = searchResponse?.list_data 
        || (Array.isArray(searchResponse) ? searchResponse : []);

    // Check if no data found after search
    const noData = shouldSearch && !loading && (!tableData || tableData.length === 0);

    // Trigger search query
    const handleSearch = (e) => {
        e.preventDefault();
        if (!empNumber.trim()) {
            toast.error("Please enter EMP Number");
            return;
        }
        setShouldSearch(true);
        refetchSearch();
    };


    // Reset search form and clear query cache
    const handleReset = () => {
        setEmpNumber("");
        setShouldSearch(false);
        queryClient.removeQueries({ queryKey: ["exceptionDeleteSearch"] });
    };

    // React Query mutation: Delete exception record
    const deleteExceptionMutation = useMutation({
        mutationFn: async ({ item }) => {
            const payload = {
                deleteRequests: [
                    {
                        empnumber: item.ecNumber || item.empNumber,
                        urlid: item.urlId,
                        period: item.quarter === "ANNUAL" ? "annual" : (item.quarter || item.period || "annual"),
                        comment: "Deleting exception as per HR request"
                    }
                ],
                roleName: roleName,
                solId: sol,
                appraisalPeriod: item.quarter === "ANNUAL" ? "annual" : (item.quarter || item.period || "annual"),
                quarter: item.quarter === "ANNUAL" ? null : (item.quarter || null),
                financialYear: Number(extractYear(financialYear)),
                empNo: empNo,
                empNoToDelete: item.ecNumber || item.empNumber,
                empName: item.employeeName || item.empName || ""
            };

            return await appraisalAPI.deleteExceptionURL(payload);
        },
        onSuccess: () => {
            toast.success("Exception deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["exceptionDeleteSearch"] }); // Refresh search results
        },
        onError: (error) => {
            console.error("Delete exception error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete exception!";
            toast.error(errorMessage);
        },
    });

    // Handle delete with confirmation
    const handleDelete = (item) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this exception?"
        );
        if (!confirmDelete) return;

        deleteExceptionMutation.mutate({ item });
    };



    return (
        <div className="exception-page pageWrapper">
            {/* Breadcrumb */}
            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active">Exception Delection Utility</span>
                </div>

                <div className="breadcrumb-info d-flex align-items-center">
                    <span className="breadcrumb-fy me-2">FY 2025-2026</span>
                    <button className="blue-button d-inline-flex align-items-center gap-1 fw-medium bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark">
                        <FaInfoCircle size={13} /> Info
                    </button>
                </div>
            </div>

            <div className="pageWrapper-header">
                <BackButton />
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                    Exception Delection Utility
                </h1>
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

            {/* Error message */}
            {isSearchError && (
                <section className="p-4">
                    <p className="text-danger fw-semibold">
                        Error: {searchError?.message || "Failed to fetch data"}
                    </p>
                </section>
            )}

            {/* Table Section */}
            <section className="p-4">
                {loading && <p className="text-muted">Loading...</p>}

                {!loading && noData && (
                    <p className="text-danger fw-semibold">No data found!</p>
                )}

                {!loading && !noData && tableData.length > 0 && (
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
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tableData.map((item, index) => (
                                    <tr key={item.urlId || index}>
                                        <td>{item.ecNumber || item.empNumber || '-'}</td>
                                        <td>{item.employeeName || item.empName || '-'}</td>
                                        <td>{item.urlId || '-'}</td>
                                        <td>{item.quarter || item.period || '-'}</td>
                                        <td>{item.zoneName || item.zone || '-'}</td>
                                        <td>{item.status || '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(item)}
                                                disabled={deleteExceptionMutation.isPending}
                                            >
                                                {deleteExceptionMutation.isPending ? "Deleting..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !noData && tableData.length === 0 && shouldSearch && (
                    <p className="text-muted">Enter EMP Number & click Search</p>
                )}
            </section>
        </div>
    );
};

export default ExceptionDeletion;
