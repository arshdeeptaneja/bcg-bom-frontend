import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
// import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
// import EmployeeModel from '../../../models/EmployeeModel';

// /**
//  *
//  * @param {Object} props - The component props.
//  * @param {string} props.financialYear - The financial year.
//  * @param {string} props.appraisalPeriod - The appraisal period.
//  * @param {string} props.quarter - The quarter.
//  * @returns
//  */
// export default function EmployeeExceptionList() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const financialYear = searchParams.get('financialYear');
//   const appraisalPeriod = searchParams.get('appraisalPeriod');
//   const quarter = searchParams.get('quarter');

//   // TODO: Get the average score and max score from the API
//   const averageScore = 70;
//   const maxScore = 100;

//   if (!financialYear || !appraisalPeriod || !quarter) {
//     return (
//       <div className="pageWrapper">
//         <div>No financial year, appraisal period, or quarter found</div>
//       </div>
//     );
//   }
//   return (
//     <div className="pageWrapper">
//       <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
//         <div className="headline d-flex flex-row justify-content-between align-items-center">
//           <BackButton />
//           <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
//             Appraiser Check-In Dashboard
//           </h1>
//         </div>
//         <h4 className="text-muted fw-bold mb-0 ms-3">
//           {`${
//             appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
//           } ${financialYear} ${appraisalPeriod} Check-In`}
//         </h4>
//       </div>

//       {/* --Appraisee Check-In Filters Row --*/}
//   <div class="row g-3 mb-4 appraiser-filter-bar">
//     <div class="col-md-2">
//       <label class="form-label fw-semibold">EMPLOYEE NUMBER</label>
//       <select class="form-select">
//         <option>-Select-</option>
//       </select>
//     </div>
//     <div class="col-md-2">
//       <label class="form-label fw-semibold">EMPLOYEE NAME</label>
//       <select class="form-select">
//         <option>-Select-</option>
//       </select>
//     </div>
//     <div class="col-md-2">
//       <label class="form-label fw-semibold">PRIMARY ROLE</label>
//       <select class="form-select">
//         <option>-Select-</option>
//       </select>
//     </div>
//     <div class="col-md-2">
//       <label class="form-label fw-semibold">APPRAISER</label>
//       <select class="form-select">
//         <option>-Select-</option>
//       </select>
//     </div>
//     <div class="col-md-2">
//       <label class="form-label fw-semibold">STATUS</label>
//       <select class="form-select">
//         <option>-Select-</option>
//       </select>
//     </div>
//     <div class="col-md-2 d-flex align-items-end">
//       <button class="btn primary-button px-4 w-100">
//         Reset <i class="bi bi-arrow-repeat ms-1"></i>
//       </button>
//     </div>
//   </div>

     
//     </div>
//   );
// }

import React, { useState } from "react";
import "./EmployeeExceptionList.css";

const EmployeeExceptionList = () => {

      const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter')
  const [filters, setFilters] = useState({
    employee: "",
    role: "",
    branch: "",
    status: "",
  });

  const [data] = useState([
    {
      ticketId: 101,
      empNumber: "K13949",
      empName: "KAMAL KANT",
      primaryRole: "Deputy Branch Head with locker",
      branch: "ROSHANARA ROAD, NEW DELHI",
      preScore: "5/7",
      postScore: "/7",
      status: "Exception registered and pending before Appraiser",
    },
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    console.log("Search with filters:", filters);
  };

  const handleClear = () => {
    setFilters({ employee: "", role: "", branch: "", status: "" });
  };

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraiser Check-In Dashboard
          </h1>
        </div>
        <h4 className="text-muted fw-bold mb-0 ms-3">
          {`${
            appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
          } ${financialYear} ${appraisalPeriod} Check-In`}
        </h4>
      </div>

      {/* Filters */}
      <div className="filter-section d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <label className="fw-semibold">Employee</label>
          <select
            name="employee"
            className="form-select"
            value={filters.employee}
            onChange={handleFilterChange}
          >
            <option>-Select-</option>
            <option>KAMAL KANT</option>
          </select>
        </div>

        <div>
          <label className="fw-semibold">Primary Role</label>
          <select
            name="role"
            className="form-select"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option>-Select-</option>
            <option>Deputy Branch Head</option>
          </select>
        </div>

        <div>
          <label className="fw-semibold">Branch</label>
          <select
            name="branch"
            className="form-select"
            value={filters.branch}
            onChange={handleFilterChange}
          >
            <option>-Select-</option>
            <option>ROSHANARA ROAD, NEW DELHI</option>
          </select>
        </div>

        <div>
          <label className="fw-semibold">Exception Status</label>
          <select
            name="status"
            className="form-select"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option>-Select-</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
        </div>

        <div className="d-flex align-items-end gap-2">
          <button
            className="btn search-btn px-4"
            onClick={handleSearch}
          >
            Search
          </button>
          <button className="btn clear-btn" onClick={handleClear}>
            Clear Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className='table-header'>
            <tr>
              <th>Ticket ID</th>
              <th>Employee Number</th>
              <th>Employee Name</th>
              <th>Primary Role</th>
              <th>Branch</th>
              <th>Pre Exception Score</th>
              <th>Post Exception Score</th>
              <th>Exception Status</th>
              <th>Exception Details</th>
            </tr>
          </thead>
          <tbody style={{marginTop:"0.5rem"}}>
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{item.ticketId}</td>
                  <td>{item.empNumber}</td>
                  <td>{item.empName}</td>
                  <td>{item.primaryRole}</td>
                  <td>{item.branch}</td>
                  <td>{item.preScore}</td>
                  <td>{item.postScore}</td>
                  <td>{item.status}</td>
                  <td>
                    <div className="d-flex flex-column gap-2">
                      <button className="btn view-btn">View Appraisal</button>
                      <button className="btn review-btn">Review Exception</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-section d-flex justify-content-end align-items-center gap-2">
        <button className="btn btn-light">&laquo;</button>
        <button className="btn active-page">1</button>
        <button className="btn btn-light">&raquo;</button>
      </div>
    </div>
  );
};

export default EmployeeExceptionList;
