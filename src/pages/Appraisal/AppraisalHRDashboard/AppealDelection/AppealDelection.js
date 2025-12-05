/**
 * The `AppealDeletion` component in React handles searching and deleting exceptions related to
 * employee appraisals.
 * @returns The `AppealDeletion` component is being returned. It contains JSX elements for a page that
 * includes a breadcrumb header, search section, and table section for managing appeal deletion
 * utility. The component includes state variables for `empNumber`, `loading`, `tableData`, and
 * `noData`, as well as functions for handling search and deletion of exceptions.
 */
/**
 * Appeal Deletion Utility
 * Allows HR admins to search and delete appeal records by employee number
 */
import React, { useState } from "react";
import { appraisalAPI } from "../../../../services/api";
import { BackButton } from "../../../../components/common";
import { FaInfoCircle } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const AppealDeletion = () => {
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
  const financialYear = searchParams.get("financialYear");

  // React Query: Search appeal deletion records
  const {
    data: searchResponse,
    isLoading: loading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["appealDeleteSearch", empNumber, roleName, sol, extractYear(financialYear)],
    queryFn: async () => {
      const res = await appraisalAPI.searchAppealDeleteURL({
        searchEmpNo: empNumber,
        roleName: "Super Admin",
        sol: "25896",
        financialYear: extractYear(financialYear),
      });
      // Handle response structure: { "list_data": [...] } or { "list_data": null }
      return res || {};
    },
    enabled: shouldSearch && !!empNumber.trim() && !!roleName && !!sol,
    retry: false,
  });

  // Extract and normalize list_data from response for table rendering
  const rawList =
    (searchResponse && Array.isArray(searchResponse.list_data)
      ? searchResponse.list_data
      : []) || [];

  const tableData = rawList.map((item) => ({
    // Normalize keys to what the table expects
    ecNumber: item.EMP_NUMBER || item.empnumber || "",
    employeeName: item.EMP_NAME || item.emp_name || "",
    urlId: item.E_URL_ID || item.urlId || "",
    period: item.PERIOD || "",
    zoneName: item.ZNNAME || item.REGNM || "",
    status: item.APPRAISAL_STATUS || "",
    // Keep original item if needed later
    _raw: item,
  }));

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
    queryClient.removeQueries({ queryKey: ["appealDeleteSearch"] });
  };

  // React Query mutation: Delete appeal record
  const deleteAppealMutation = useMutation({
    mutationFn: async ({ urlId }) => {
      const item = tableData.find((r) => r.urlId === urlId);
      const payload = {
        deleteRequests: [
          {
            empnumber: empNumber,
            urlid: item.urlId,
            period: item?.period || "annual",
            comment: "Deleting appeal as per HR request"
          },
        ],
        roleName: roleName,
        solId: sol,
        appraisalPeriod: "annual",
        quarter: null,
        financialYear: extractYear(financialYear),
        empNo: empNo,
        empNoToDelete: empNumber,
        empName: item?.employeeName || ""
      };

      return await appraisalAPI.deleteAppealURL(payload);
    },
    onSuccess: () => {
      toast.success("Appeal deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["appealDeleteSearch"] }); // Refresh search results
    },
    onError: (error) => {
      console.error("Delete appeal error:", error);
      toast.error("Failed to delete appeal!");
    },
  });

  // Handle delete with confirmation
  const handleDelete = (urlId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appeal?"
    );
    if (!confirmDelete) return;

    deleteAppealMutation.mutate({ urlId });
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
                    <span className="breadcrumb-active"> Appeal Deletion Utility </span>
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
                <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appeal Deletion Utility </h1>
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
                                                onClick={() => handleDelete(item.urlId)}
                                                disabled={deleteAppealMutation.isPending}
                                            >
                                                {deleteAppealMutation.isPending ? "Deleting..." : "Delete"}
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

export default AppealDeletion;
