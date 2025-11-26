/**
 * The `EmployeeExceptionList` component in JavaScript fetches and displays exception quarterly
 * validator review data for employees based on various filters and allows for searching and clearing
 * filters.
 * @returns The `EmployeeExceptionList` component is being returned. It includes functionality to fetch
 * data using React Query, handle filters, display loading spinners and error messages, and render a
 * table with data fetched from an API. The component also includes filter options for employee, role,
 * branch, and status, as well as buttons for searching and clearing filters. The table displays
 * information such as Ticket ID, Employee Number
 */
import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';
import "./EmployeeExceptionList.css";

const EmployeeExceptionList = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');
  
  // Get employee details from auth context using getUserProperty
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
  
  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025" or "2024-2025" -> "2024")
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    // Try FY format first
    const fyMatch = fy.match(/FY (\d{4})/);
    if (fyMatch) return fyMatch[1];
    // Try range format (e.g., "2024-2025")
    const rangeMatch = fy.match(/(\d{4})-\d{4}/);
    if (rangeMatch) return rangeMatch[1];
    // Try single year
    const yearMatch = fy.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
  };

  const buildQuarterDateRange = (fyLabel, quarterLabel) => {
    if (!fyLabel || !quarterLabel) return '';
    const base = parseInt(extractYear(fyLabel), 10);
    if (!base) return '';

    switch (quarterLabel) {
      case 'Q1':
        return `01 Apr ${base} - 30 Jun ${base}`;
      case 'Q2':
        return `01 Jul ${base} - 30 Sep ${base}`;
      case 'Q3':
        return `01 Oct ${base} - 31 Dec ${base}`;
      case 'Q4':
        return `01 Jan ${base + 1} - 31 Mar ${base + 1}`;
      default:
        return '';
    }
  };

  // Get role and zone information using getUserProperty
  // @TODO: Confirm with Arsh - roleName, roleId, and zone field names
  const roleName = getUserProperty('roleName', 
    employeeDetails?.currentUser?.[0]?.ROLE_NAME || 
    employeeDetails?.currentUser?.[0]?.roleName || 
    ''
  );
  const roleId = getUserProperty('roleId', 
    employeeDetails?.currentUser?.[0]?.ROLE_ID || 
    employeeDetails?.currentUser?.[0]?.roleId || 
    ''
  );
  const zone = getUserProperty('zone', 
    employeeDetails?.currentUser?.[0]?.ZONE || 
    employeeDetails?.currentUser?.[0]?.ZONE_NAME || 
    employeeDetails?.currentUser?.[0]?.zone || 
    employeeDetails?.currentUser?.[0]?.zoneName || 
    ''
  );

  // React Query to fetch exception quarterly validator review data
  const { data: apiData, isLoading, isError, error } = useQuery({
    queryKey: ['exceptionQuarterlyValidatorReview', financialYear, quarter, empNo, roleName, roleId, zone],
    queryFn: () =>
      appraisalAPI.getExceptionQuarterlyValidator({
        fy: parseInt(extractYear(financialYear)),
        quarter: quarter || 'Q1',
        empNo: empNo,
        // roleName: roleName,
        // roleId: roleId,
        // zone: zone,
      }),
    enabled: !!empNo && !!financialYear //&& !!roleName && !!roleId && !!zone, // Only run query if required params are available
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch exception list data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  const [filters, setFilters] = useState({
    employee: "",
    role: "",
    branch: "",
    status: "",
  });

  // Extract and map data from API response
  const [data, setData] = useState([]);
  
  useEffect(() => {
    if (apiData) {
      const responseData = apiData?.data || apiData;
      
      // Map API response to table data structure
      // Adjust field names based on actual API response structure
      if (responseData?.result && Array.isArray(responseData.result)) {
        const mappedData = responseData.result.map((item) => ({
          ticketId: item.cust_ticket_id || item.ticket_id || item.TICKET_ID || item.ticketId || '',
          empNumber: item.empnumber || item.ecnumber || item.emp_number || item.EMP_NUMBER || item.empNo || item.EMP_ID || '',
          empName: item.emp_name || item.EMP_NAME || item.employeeName || item.employee_name || '',
          primaryRole: item.primary || item.primary_role || item.PRIMARY_ROLE || item.role || item.ROLE || '',
          branch: item.organisation || item.branch || item.BRANCH || item.branch_name || item.BRANCH_NAME || '',
          preScore: item.measurable_score_total || item.pre_score || item.PRE_SCORE || item.preExceptionScore || '',
          postScore: item.new_measurable_score_total || item.post_score || item.POST_SCORE || item.postExceptionScore || '',
          status: item.status || item.STATUS || item.exception_status || item.EXCEPTION_STATUS || '',
        }));
        setData(mappedData);
      } else if (Array.isArray(responseData)) {
        // Handle case where response is directly an array
        const mappedData = responseData.map((item) => ({
          ticketId: item.cust_ticket_id || item.ticket_id || item.TICKET_ID || item.ticketId || '',
          empNumber: item.empnumber || item.ecnumber || item.emp_number || item.EMP_NUMBER || item.empNo || item.EMP_ID || '',
          empName: item.emp_name || item.EMP_NAME || item.employeeName || item.employee_name || '',
          primaryRole: item.primary || item.primary_role || item.PRIMARY_ROLE || item.role || item.ROLE || '',
          branch: item.organisation || item.branch || item.BRANCH || item.branch_name || item.BRANCH_NAME || '',
          preScore: item.measurable_score_total || item.pre_score || item.PRE_SCORE || item.preExceptionScore || '',
          postScore: item.new_measurable_score_total || item.post_score || item.POST_SCORE || item.postExceptionScore || '',
          status: item.status || item.STATUS || item.exception_status || item.EXCEPTION_STATUS || '',
        }));
        setData(mappedData);
      }
    }
  }, [apiData]);

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

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Exmployee Exception List
            </h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if API call fails
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Exmployee Exception List
            </h1>
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load exception list data</p>
          <p className="text-muted">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Exmployee Exception List
          </h1>
        </div>
        <h4 className="text-muted fw-bold mb-0 ms-3">
          {`${appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
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
          <tbody style={{ marginTop: "0.5rem" }}>
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  <td className='Tds'>{item.ticketId}</td>
                  <td className='Tds'>{item.empNumber}</td>
                  <td className='Tds'>{item.empName}</td>
                  <td className='Tds'>{item.primaryRole}</td>
                  <td className='Tds'>{item.branch}</td>
                  <td className='Tds'>{item.preScore}</td>
                  <td className='Tds'>{item.postScore}</td>
                  <td className='Tds'>{item.status}</td>
                  <td>
                    <div className="d-flex flex-column gap-2">
                      <button className="btn view-btn">View Appraisal</button>
                      <button
                        className="btn review-btn"
                        onClick={() =>
                          navigate('/appraisal/employee-review-quarterly-exception', {
                            state: {
                              financialYear,
                              appraisalPeriod,
                              quarter,
                              dateRange: buildQuarterDateRange(financialYear, quarter),
                              employee: {
                                empNo: item.empNumber,
                                employeeName: item.empName,
                                branch: item.branch,
                                primaryRole: item.primaryRole,
                              },
                              role: 'VALIDATOR',
                              roleName: 'VALIDATOR',
                              roleId: 'VALIDATOR',
                              custTicketId: item.ticketId,
                              exceptionId: item.ticketId,
                            },
                          })
                        }
                      >
                        Review Exception
                      </button>
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
