// AppraiserPage.jsx
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { BackButton } from '../../../../components/common';
import { FaInfoCircle } from "react-icons/fa";
import { appraisalAPI } from '../../../../services/api';

import "./AppraisalStatus.css";
import { useState } from 'react';

const AppraiserStatus = () => {
  const [appraisalPeriod, setAppraisalPeriod] = useState('Quarterly');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [ecNumber, setEcNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [noData, setNoData] = useState(false);

  const mapQuarterToCycle = (q) => {
  switch (q) {
    case "Q1": return "JUNE";       // Q1 closes in June
    case "Q2": return "SEPTEMBER";  // Q2 closes in Sep
    case "Q3": return "DECEMBER";   // Q3 closes in Dec
    case "Q4": return "MARCH";      // Q4 closes in March
    default: return "";
  }
};

    const extractYear = (fy) => {
        const match = fy.match(/FY (\d{4})/);
        return match ? match[1] : new Date().getFullYear().toString();
    };

      const { getUserProperty } = useAuth();
    
    // these are directly stored in userData in AuthContext.localStorage
    const sol = getUserProperty("sol") 
             || getUserProperty("LOCATION") 
             || getUserProperty("solId");
             
    const empNo = getUserProperty("empNo") 
               || getUserProperty("EMP_ID");
    
    const roleName = getUserProperty("ROLE_TYPE") 
                  || getUserProperty("roleType") 
                  || getUserProperty("designation")
                  || getUserProperty("ROLE_NAME");
    
    console.log({roleName, sol, empNo});

// const cycle = mapQuarterToCycle(selectedQuarter);

const [searchParams] = useSearchParams();

const quarter = searchParams.get("quarter");               // Q1
const financialYear = searchParams.get("financialYear"); 

const handleSearch = async () => {
  if (!ecNumber.trim()) {
    alert("Please enter EC Number");
    return;
  }

  try {
    setLoading(true);
    setNoData(false);

    // Convert selected quarter to cycle month
    const cycle = mapQuarterToCycle(selectedQuarter);

    const res = await appraisalAPI.searchHRStatusUpdate({
     financialYear: extractYear(financialYear),                 // Later you can use extractYear if FY dropdown added
      appraisalPeriod: "JUNE",                 // <----- HERE
      // quarter: quarter,                         // <----- HERE
      empNo: ecNumber,                        // HR EC / user EC
      searchEmpNo: ecNumber,                  // search input value
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



  const handleReset = () => {
    setEcNumber("");
    setTableData([]);
    setNoData(false);
  };


const handleStatusChange = async (item, newStatus) => {
  if (!newStatus) return;

  try {
    const confirmUpdate = window.confirm(
      `Are you sure you want to update status to "${newStatus}"?`
    );

    if (!confirmUpdate) return;

    // Quarter → Cycle mapping
    const cycle = mapQuarterToCycle(selectedQuarter);

    // Get values from Auth Context
    const roleName = getUserProperty("roleType") || getUserProperty("ROLE_TYPE");
    const sol = getUserProperty("sol") || getUserProperty("LOCATION");
    const empNo = getUserProperty("empNo");
    const empName = getUserProperty("name");

    // Extract year number from FY dropdown if needed
    const numericFY = "2025"; // or extractYear(financialYear)

    // Prepare payload EXACTLY as backend expects
    const payload = {
      statusUpdates: [
        {
          urlid: item.urlId,
          rolecode: item.roleCode || "", // ensure correct field name
          status: newStatus,
          comment: item.reason || ""     // or "" if no comment
        }
      ],
      roleName: roleName,
      solId: sol,
      appraisalPeriod: appraisalPeriod === "Annual" ? "annual" : cycle.toLowerCase(),
      quarter: appraisalPeriod === "Annual" ? null : cycle,
      financialYear: Number(numericFY),
      empNo: empNo,
      empName: empName
    };

    console.log("Final Payload Sent:", payload);

    const res = await appraisalAPI.updateHRStatus(payload);

    alert("Status updated successfully!");

    // Update UI instantly
    setTableData((prev) =>
      prev.map((row) =>
        row.urlId === item.urlId ? { ...row, action: newStatus } : row
      )
    );

  } catch (error) {
    console.error(error);
    alert("Failed to update status!");
  }
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
                  onChange={(e) => setEcNumber(e.target.value)}
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
        </div>

        {/* No data found */}
        <div className="mb-2">
          <small className="text-muted">No data found!</small>
        </div>

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
                          value={item.action}
                        onChange={(e) => handleStatusChange(item, e.target.value)}

                        >
                          <option value="">-Select-</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>

                      <td>{item.reason}</td>
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
