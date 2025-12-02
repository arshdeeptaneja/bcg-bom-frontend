/**
 * Appraiser, Reviewer and Acceptor Update by Emp Number
 * Allows HR admins to search and update appraiser/reviewer/acceptor assignments
 */
import { useSearchParams } from "react-router-dom";
import { BackButton } from '../../../../components/common';
import { FaInfoCircle } from "react-icons/fa";
import { useAuth } from "../../../../contexts/AuthContext";
import { appraisalAPI } from '../../../../services/api';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import "./AppraiserUpdate.css";
import { useState } from 'react';

const AppraiserUpdate = () => {
  // State management
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly'); // 'Quarterly' or 'Annual'
  const [selectedQuarter, setSelectedQuarter] = useState('Q1'); // Q1, Q2, Q3, Q4
  const [ecNumber, setEcNumber] = useState(""); // Employee EC number for search
  const [shouldSearch, setShouldSearch] = useState(false); // Controls when to trigger search query
  const queryClient = useQueryClient();

  // Get user data from auth context
  const { getUserProperty } = useAuth();
  const empNo = getUserProperty("empNo") 
             || getUserProperty("EMP_ID");
  const solId = getUserProperty("sol")
             || getUserProperty("LOCATION")
             || getUserProperty("solId");
  const roleNameRaw = getUserProperty("ROLE_TYPE")
                   || getUserProperty("roleType")
                   || getUserProperty("designation")
                   || getUserProperty("ROLE_NAME");
  // Decode URL-encoded roleName (e.g., "Administrative+Officers" -> "Administrative Officers")
  const roleName = roleNameRaw ? roleNameRaw.replace(/\+/g, ' ') : '';
  const zoneName = getUserProperty("zone") 
                || getUserProperty("ZONE") 
                || getUserProperty("zoneName");
  const regionName = getUserProperty("region") 
                  || getUserProperty("REGION") 
                  || getUserProperty("regionName")
                  || getUserProperty("LOCATION");

  // Extract year from financial year string (e.g., "FY 2024" -> "2024")
  const extractYear = (fy) => {
    const match = fy?.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Format ISO-like dates (e.g. "2023-06-29T18:30:00.000+00:00") to "yyyy-mm-dd"
  const formatDate = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  // Get query params from URL
  const [searchParams] = useSearchParams();
  const quarter = searchParams.get("quarter"); // Q1, Q2, Q3, Q4
  const financialYear = searchParams.get("financialYear");

  // Determine appraisal period value for API: "quarterly" or "annual"
  // (quarter itself is sent separately via selectedQuarter)
  const appraisalPeriodValue = appraisalPeriod === "Quarterly"
    ? "quarterly"
    : "annual";

  // React Query: Search HR Repa/Reva by EC Number
  const {
    data: tableData = [],
    isLoading: loading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: [
      "hrRepaRevaByEC",
      ecNumber,
      empNo,
      appraisalPeriodValue,
      selectedQuarter,
     extractYear(financialYear),
    ],
    queryFn: async () => {
      const res = await appraisalAPI.searchHRRepaRevaByEC({
        searchEmpNo: ecNumber,
        empNo: empNo,
        appraisalPeriod: appraisalPeriodValue, // "q1", "q2", etc. or "annual"
        quarter: appraisalPeriod === "Quarterly" ? selectedQuarter : null,
        financialYear: extractYear(financialYear),
      });

      // API response shape (from curl):
      // {
      //   filter_result: { ... },
      //   results: {
      //     DATA_OUT: [ { ...row... } ]
      //   }
      // }

      const rawRows = Array.isArray(res?.results?.DATA_OUT)
        ? res.results.DATA_OUT
        : [];

      // Map backend fields into the table row shape used in tbody
      const mapped = rawRows.map((item) => ({
        assignmentId: item.ASSIGNMENT_ID || item.assignmentId || "",
        urlId: item.URL_ID || item.urlId || "",
        ecNumber: item.EMP_ID || item.empNo || "",
        employeeName: item.EMP_NAME || item.empName || "",
        mainRole: item.PRIMARY_ROLE || "",
        solId: item.LOCATION_ID || item.SOL_ID || "",
        repaEmpNumber: item.VALIDATOR_NUMBER || "",
        zone: item.ZNNAME || item.REGNM || "",
        action: item.APPRAISAL_STATUS || "",
        additionalRole1: item.SECONDARY_ROLE || "",
        additionalRole2: item.TERTIARY_ROLE || "",
        startDate: formatDate(item.ROLE_START_DATE),
        endDate: formatDate(item.ROLE_END_DATE),
        repaName: item.VALIDATOR_NAME || "",
        branch: item.BRNAME || item.ORGANIZATION_NAME || "",
        // keep raw reference if needed for future logic
        raw: item,
      }));

      return mapped;
    },
    enabled: shouldSearch && !!ecNumber.trim() && !!empNo && !!appraisalPeriodValue,
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
    queryClient.removeQueries({ queryKey: ["hrRepaRevaByEC"] });
  };

  // React Query mutation: Update HR Repa/Reva by EC
  const updateMutation = useMutation({
    mutationFn: async (updateData) => {
      return await appraisalAPI.updateHRRepaRevaByEC(updateData);
    },
    onSuccess: (data) => {
      console.log("Update success:", data);
      toast.success("Update successful!");
      // Refetch search results after successful update
      if (shouldSearch) {
        refetchSearch();
      }
    },
    onError: (error) => {
      console.error("Update error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Update failed!";
      toast.error(errorMessage);
    },
  });

  // Handle update - update all rows in tableData
  const handleUpdate = () => {
    if (!tableData || tableData.length === 0) {
      toast.error("No data to update");
      return;
    }

    if (!ecNumber || !empNo || !solId || !roleName) {
      toast.error("Missing required user information");
      return;
    }

    // Update each row in the table
    const updatePromises = tableData.map((row) => {
      const updatePayload = {
        ecno: row.ecNumber || ecNumber,
        urlId: row.urlId || row.assignmentId || "",
        RA_Ecno: row.repaEmpNumber || row.RA_Ecno || "",
        RE_Ecno: row.RE_Ecno || "",
        AC_Ecno: row.AC_Ecno || "",
        financialYear: Number(extractYear(financialYear)),
        appraisalPeriod: appraisalPeriodValue === "annual" ? "annual" : "quarterly",
        quarter: appraisalPeriod === "Quarterly" ? selectedQuarter : "Q1",
        empNo: String(empNo),
        selfEmpNo: String(empNo),
        solId: String(solId),
        roleName: roleName,
      };

      return updateMutation.mutateAsync(updatePayload);
    });

    // Execute all updates
    Promise.all(updatePromises)
      .then(() => {
        toast.success(`Successfully updated ${tableData.length} record(s)`);
      })
      .catch((error) => {
        console.error("Batch update error:", error);
      });
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
          <span className="breadcrumb-active">Appraiser, Reviewer and Acceptor update by Emp Number Appraisal & Reviewing Update by Emp Number </span>
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
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser, Reviewer and Acceptor update by Emp Number  </h1>
          </div>
      <div className="appraiser-page container-fluid p-4">


        {/* Top row: Back + Title + FY badge */}
        <div className="d-flex align-items-center mb-4">
         


        </div>

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
                  aria-label="Enter EC Number"
                  value={ecNumber}
                  onChange={(e) => {
                    setEcNumber(e.target.value);
                    // Avoid auto-search while typing; require Search button click
                    setShouldSearch(false);
                  }}
                />
              </div>

              <div className="me-2 mb-2">
                <button className="btn-search" onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              <div className="mb-2">
                <button className="btn-reset" onClick={handleReset}>Reset</button>
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

          {/* <div className="col-12 col-md-2">
            <div className="mb-2">
              <button 
                className="btn-reset d-flex" 
                style={{justifyContent:'left'}}
                onClick={handleUpdate}
                disabled={tableData.length === 0 || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </div> */}
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
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-header">
                <tr>
                  <th>ASSIGNMENT ID</th>
                  <th>URL ID</th>
                  <th>EC Number</th>
                  <th>Employee Name</th>
                  <th>Main Role</th>
                  <th>SOL ID</th>
                  <th>Repa EMP Number</th>
                  <th>Zone</th>
                  <th>Action</th>
                  <th>Additional Role 1</th>
                  <th>Additional Role 2</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Repa Name</th>
                  <th>Branch</th>
                  <th>Update</th>

                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => (
                    <tr key={item.assignmentId || index}>
                      <td>{item.assignmentId}</td>
                      <td>{item.urlId}</td>
                      <td>{item.ecNumber}</td>
                      <td>{item.employeeName}</td>
                      <td>{item.mainRole}</td>
                      <td>{item.solId}</td>
                      <td>{item.repaEmpNumber}</td>
                      <td>{item.zone}</td>
                      <td>{item.action}</td>
                      <td>{item.additionalRole1}</td>
                      <td>{item.additionalRole2}</td>
                      <td>{item.startDate}</td>
                      <td>{item.endDate}</td>
                      <td>{item.repaName}</td>
                      <td>{item.branch}</td>
                      <td>
                      <button 
                className="btn-reset d-flex" 
                onClick={handleUpdate}
                disabled={tableData.length === 0 || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </button>                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15" className="text-center text-muted">
                      {noData ? "No data found!" : "Enter EC Number & click Search"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* horizontal green progress bar like in screenshot */}

        </div>
      </div>
    </div>
  );
};

export default AppraiserUpdate;
