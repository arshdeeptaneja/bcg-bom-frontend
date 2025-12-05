/**
 * Appraisal Status Change Utility
 * Allows HR admins to search and update appraisal status for employees
 */
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { BackButton } from '../../../../components/common';
import { FaInfoCircle } from "react-icons/fa";
import { appraisalAPI } from '../../../../services/api';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import "./AppraisalStatus.css";
import { useState } from 'react';

const AppraiserStatus = () => {
  // State management
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly'); // 'Quarterly' or 'Annual'
  const [selectedQuarter, setSelectedQuarter] = useState('Q1'); // Q1, Q2, Q3, Q4
  const [ecNumber, setEcNumber] = useState(""); // Employee EC number for search
  const [shouldSearch, setShouldSearch] = useState(false); // Controls when to trigger search query
  const [rowStatus, setRowStatus] = useState({}); // Local selected status per row (by urlId)
  const queryClient = useQueryClient();

  // Format date strings like "2024-06-29T18:30:00.000+00:00" -> "2024-06-30"
  const formatDate = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      // Handle invalid date
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  // Extract year from financial year string (e.g., "FY 2024" -> "2024")
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Get user data from auth context
  const { getUserProperty } = useAuth();
  const sol = getUserProperty("sol") 
           || getUserProperty("LOCATION") 
           || getUserProperty("solId");
  const empNo = getUserProperty("empNo") 
             || getUserProperty("EMP_ID");
  const roleName = getUserProperty("ROLE_TYPE") 
                || getUserProperty("roleType") 
                || getUserProperty("designation")
                || getUserProperty("ROLE_NAME");

  // Get query params from URL
  const [searchParams] = useSearchParams();
  const quarter = searchParams.get("quarter"); // Q1, Q2, Q3, Q4
  const financialYear = searchParams.get("financialYear"); 

  // Determine appraisal period value to send in API:
  // use the selectedQuarter from UI when Quarterly, else "Annual"
  const appraisalPeriodValue = appraisalPeriod === "Quarterly" ? selectedQuarter : "Annual";

  // React Query: Search HR status records
  const {
    data: tableData = [],
    isLoading: loading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["hrStatusSearch", ecNumber, extractYear(financialYear), appraisalPeriodValue],
    queryFn: async () => {
      const res = await appraisalAPI.searchHRStatusUpdate({
        financialYear: extractYear(financialYear),
        appraisalPeriod: appraisalPeriodValue, // Q1/Q2/Q3/Q4 or "Annual"
        empNo: empNo,
        searchEmpNo: ecNumber,
      });

      // API response shape:
      // {
      //   results: [
      //     {
      //       VARFY: 2025,
      //       ROLE_END_DATE: "...",
      //       APPRAISAL_STATUS: "NA",
      //       PRIMARY_ROLE: "...",
      //       ORGANIZATION_NAME: "...",
      //       EMP_NAME: "...",
      //       EMP_ID: "36663",
      //       URL_ID: "S-29364",
      //       LOCATION_ID: 903400,
      //       BRNAME: "...",
      //       ZNNAME: "Central Zone",
      //       ...
      //     }
      //   ]
      // }

      const rawRows = Array.isArray(res?.results) ? res.results : [];

      // Map backend fields into the shape used by the table body
      const mapped = rawRows.map((item) => ({
        urlId: item.URL_ID || item.urlId || item.UrlId || "",
        ecNumber: item.EMP_ID || item.empNo || item.EC_NUMBER || "",
        employeeName: item.EMP_NAME || item.empName || "",
        solId: item.LOCATION_ID || item.SOL_ID || "",
        zone: item.ZNNAME || item.REGNM || "",
        appraisalstatus: item.APPRAISAL_STATUS || item.appraisalStatus || "",
        score:item.TOTAL_MEASURABLE_PERFORMANCE_SCORE??
          item.MEASURABLE_PERFORMANCE_SCORE ??
          "0.0",
        // Format dates to "yyyy-mm-dd"
        startDate: formatDate(item.ROLE_START_DATE),
        endDate: formatDate(item.ROLE_END_DATE),
        reason: item.REMARKS || item.reason || "",
        // Keep original fields if needed later (e.g., for payload)
        raw: item,
        roleCode: item.ROLE_CODE || item.ROLECODE || "",
      }));

      return mapped;
    },
    // Only run automatically when user has initiated a search;
    // prevents calls while typing before Search is clicked.
    enabled: shouldSearch && !!ecNumber.trim() && !!appraisalPeriodValue,
    retry: false,
  });

  // Check if no data found after search
  const noData = shouldSearch && !loading && tableData.length === 0;

  // Trigger search query
  const handleSearch = () => {
    if (!ecNumber.trim()) {
      toast.error("Please enter EC Number");
      return;
    }
    setShouldSearch(true);
    refetchSearch();
  };



  // Reset search form and clear query cache
  const handleReset = () => {
    setEcNumber("");
    setShouldSearch(false);
    queryClient.removeQueries({ queryKey: ["hrStatusSearch"] });
  };


  // React Query mutation: Update appraisal status (can send multiple rows in one payload)
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ statusUpdates }) => {
      const empName = getUserProperty("name");
      const numericFY = Number(extractYear(financialYear));

      const payload = {
        statusUpdates,
        roleName: roleName,
        solId: sol,
        // Match backend expectations: "annual" or "quarterly"
        appraisalPeriod: appraisalPeriod === "Annual" ? "annual" : "quarterly",
        quarter: appraisalPeriod === "Annual" ? null : selectedQuarter,
        financialYear: Number(numericFY),
        empNo: empNo,
        empName: empName
      };

      return await appraisalAPI.updateHRStatus(payload);
    },
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["hrStatusSearch"] }); // Refresh search results
      setRowStatus({}); // clear local selections
    },
    onError: (error) => {
      console.error("Status update error:", error);
      toast.error("Failed to update status!");
    },
  });

  // Track dropdown selection per row (but don't call API yet)
  const handleStatusSelectChange = (item, newStatus) => {
    setRowStatus((prev) => ({
      ...prev,
      [item.urlId]: newStatus,
    }));
  };

  // Trigger update API for all rows that have a selected status
  const handleBulkUpdate = () => {
    const statusUpdates = (tableData || [])
      .map((item) => {
        const selectedStatus = rowStatus[item.urlId];
        if (!selectedStatus) return null;
        return {
          urlid: item.urlId,
          rolecode: item.roleCode || "",
          status: (selectedStatus || "").toLowerCase(),
          comment: item.reason || "",
        };
      })
      .filter(Boolean);

    if (!statusUpdates.length) {
      toast.error("Please select a status for at least one row before updating.");
      return;
    }

    const confirmUpdate = window.confirm(
      `Are you sure you want to update status for ${statusUpdates.length} record(s)?`
    );
    if (!confirmUpdate) return;

    statusUpdateMutation.mutate({ statusUpdates });
  };




  return (
    <div className="AppraiserContaniner">
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        {/* Left Side: Breadcrumb */}
        <div className="breadcrumb-path">
          <span className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Appraisal HR Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Appraisal Status Change Utility</span>
        </div>

        {/* Right Side: Info Section */}
        <div className="breadcrumb-info d-flex align-items-center">
          <span className="breadcrumb-fy me-2">FY 2025-2026</span>
          <button className="blue-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm bg-white  shadow-sm border border-opacity-10 border-dark"

          >
            <FaInfoCircle size={13} /> Info
          </button>
        </div>
      </div>

      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraisal Status Change Utility</h1>
      </div>
      <div className="appraiser-page container-fluid p-4">


        {/* Controls row */}
        <div className="row gx-4 align-items-center mb-3">
          {/* Left area: input + search/reset */}
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center flex-wrap controls-left">
              <div className="ec-wrap me-3 mb-2 border">
                <input
                  type="text"
                  className="form-control ec-input"
                  placeholder="Enter EC Number"
                  value={ecNumber}
                  onChange={(e) => {
                    setEcNumber(e.target.value);
                    // Avoid triggering search while typing; require Search button click
                    setShouldSearch(false);
                  }}
                />

              </div>

              <div className="me-2 mb-2">
                <button className="btn-search" onClick={handleSearch}>
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              <div className="mb-2">
                <button className="btn-reset" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right boxed options */}
          <div className="col-12 col-md-5">
            <div className="appraisal-box d-flex justify-content-between align-items-start p-3">
              {/* Appraisal Period */}
              <div className="period-section">
                <label className="period-title">Appraisal Period</label>
                <div className="period-btns mt-2" role="group">
                  <div
                    onClick={() => setAppraisalPeriod('Quarterly')}
                    className={`period-btn ${appraisalPeriod === 'Quarterly' ? 'active' : ''}`}>
                    Quarterly
                  </div>
                  <div
                    onClick={() => setAppraisalPeriod('Annual')}
                    className={`period-btn ${appraisalPeriod === 'Annual' ? 'active' : ''}`}>
                    Annual Year
                  </div>
                </div>
              </div>

              {/* Quarterly Period */}
              {appraisalPeriod === 'Quarterly' &&
                <div className="period-section">
                  <label className="period-title">Quarterly Period</label>
                  <div className="period-btns mt-2" role="group">
                    <div 
                      className={`period-btn ${selectedQuarter === 'Q1' ? 'active' : ''
                        }`}
                      onClick={() => setSelectedQuarter('Q1')}
                    >
                      Q1
                    </div>
                    <div
                      className={`period-btn ${selectedQuarter === 'Q2' ? 'active' : ''
                        }`}
                      onClick={() => setSelectedQuarter('Q2')}
                    >
                      Q2
                    </div>
                    <div
                      className={`period-btn ${selectedQuarter === 'Q3' ? 'active' : ''
                        }`}
                      onClick={() => setSelectedQuarter('Q3')}
                    >
                      Q3
                    </div>
                    <div
                      className={`period-btn ${selectedQuarter === 'Q4' ? 'active' : ''
                        }`}
                      onClick={() => setSelectedQuarter('Q4')}
                    >
                      Q4
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
          <div className="col-12 col-md-2">

              <div className="mb-2">
                <button
                  className="btn-reset d-flex"
                  style={{ justifyContent: 'left' }}
                  onClick={handleBulkUpdate}
                  disabled={statusUpdateMutation.isPending}
                >
                  {statusUpdateMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
              </div>

        </div>

        {/* Error message */}
        {isSearchError && (
          <div className="mb-2">
            <small className="text-danger">
              Error: {searchError?.message || "Failed to fetch data"}
            </small>
          </div>
        )}

        {/* Table */}
        <div className="table-wrap">
          <div className="table-responsive">
            <table className="table appraisal-table align-middle mb-0">
              <thead className='table-header'>
                <tr>
                  <th>Select</th>
                  <th>URL ID</th>
                  <th>EMP Number</th>
                  <th>EMP Name</th>
                  <th>SOL ID</th>
                  <th>Zone</th>
                  <th>Appraisal Status</th>
                  <th>Score</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Select Status</th>
                  <th>Reason</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <input type="checkbox" />
                      </td>

                      <td>{item.urlId}</td>
                      <td>{item.ecNumber}</td>
                      <td>{item.employeeName}</td>
                      <td>{item.solId}</td>
                      <td>{item.zone}</td>
                      <td>{item.appraisalstatus}</td>
                      <td>{item.score}</td>
                      <td>{item.startDate}</td>
                      <td>{item.endDate}</td>
                      <td>
                        <select
                          className="form-select custom-select"
                          value={rowStatus[item.urlId] || ""}
                          onChange={(e) => handleStatusSelectChange(item, e.target.value)}
                        >
                          <option value="">-Select-</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>

                      <td>{item.reason}</td>

                      <td>
                      <button 
                className="btn-reset d-flex" 
                onClick={handleBulkUpdate}
                disabled={tableData.length === 0 || statusUpdateMutation.isPending}
              >
                {statusUpdateMutation.isPending ? "Updating..." : "Update"}
              </button>                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center text-muted">
                      {noData ? "No data found!" : "Enter EC & click Search"}
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppraiserStatus;
