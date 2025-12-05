/**
 * The `EmployeeAppealList` component in React fetches and displays appeal committee data for an
 * employee, allowing filtering and pagination of the results.
 * @returns The `EmployeeAppealList` component is being returned. It includes conditional rendering
 * based on the loading and error states of the API call. If the data is still loading, a loading
 * spinner is displayed. If there is an error in fetching the data, an error message is shown.
 * Otherwise, the main content of the component is displayed, which includes a form for filtering data,
 * a table displaying appeal
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BackButton } from '../../../../components/common';
import { FaInfoCircle } from 'react-icons/fa';
import AppealTable from '../../../../components/AppealTable/AppealTable';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import LoadingSpinner from '../../../../components/Spinner';
import { toast } from 'react-toastify';

const EmployeeAppealList = () => {
  const [filters, setFilters] = useState({
    moduleName: '',
    financialYear: '',
    quarter: '',
    scale: '',
  });

  // Get employee details from auth context using getUserProperty
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  const navigate = useNavigate();

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025" or "2025" -> "2025")
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

  // Get financial year from filter or use default
  const financialYearForAPI = filters.financialYear || new Date().getFullYear().toString();

  const enabled = !!empNo && !!financialYearForAPI;
  console.log('ENABLED', enabled);

  // React Query to fetch appeal committee data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appealCommittee', empNo, financialYearForAPI],
    queryFn: () =>
      appraisalAPI.getAppealCommittee({
        empNo: empNo,
        financialYear: parseInt(extractYear(financialYearForAPI)),
      }),
    enabled: enabled, // Only run query if required params are available
  });

  console.log('DATA', data);
  const filterData = data?.filter_data;

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch appeal committee data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Extract and map data from API response
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (!data) return;

    // Some axios calls wrap in .data, support both
    const responseData = data?.data || data;

    // New API structure:
    // {
    //   filter_data: { ... },
    //   results: {
    //     data_out: [...],
    //     count_out: [...],
    //     COMMITEE_LIST_OUT: [...]
    //   }
    // }

    const dataOut = responseData?.results?.data_out;

    if (Array.isArray(dataOut)) {
      const mappedData = dataOut.map((item) => ({
        roleId: item.URL_ID || item.roleId || '',
        ticketId: item.CUST_TICKET_ID || item.TICKET_ID || item.ticket_id || item.ticketId || '',
        empNumber: item.EC_NUMBER || item.EMP_NUMBER || item.emp_number || item.empNo || '',
        empName: item.EMP_NAME || item.emp_name || item.employeeName || item.employee_name || '',
        primaryRole: item.PRIMARY_ROLE || item.primary_role || item.role || item.ROLE || '',
        branch:
          item.BRNAME ||
          item.branch ||
          item.BRANCH ||
          item.branch_name ||
          item.BRANCH_NAME ||
          item.ORG_NAME ||
          '',
        appraiser: item.REP_NAME,
        // Use score + grade where available, fallback to grade only
        preAppeal: `${item.TOTAL_SCORE}/${item.TOTAL_MAX_SCORE}`,
        postAppeal: `${item.POST_APPEAL_FINAL_GRADE || 0}/${item.TOTAL_MAX_SCORE}`,
        duration: item.duration,
        // Preserve raw status for conditional button rendering
        appealStatus:
          item.FINAL_APPEAL_STATUS ||
          item.STATUS ||
          item.appeal_status ||
          item.APPEAL_STATUS ||
          item.appealStatus ||
          'Pending',
      }));

      setData(mappedData);
      return;
    }

    // Fallbacks for older shapes if needed
    if (responseData?.result && Array.isArray(responseData.result)) {
      const mappedData = responseData.result.map((item) => ({
        ticketId: item.ticket_id || item.TICKET_ID || item.ticketId || '',
        empNumber: item.emp_number || item.EMP_NUMBER || item.empNo || item.EMP_ID || '',
        empName: item.emp_name || item.EMP_NAME || item.employeeName || item.employee_name || '',
        primaryRole: item.primary_role || item.PRIMARY_ROLE || item.role || item.ROLE || '',
        branch: item.branch || item.BRANCH || item.branch_name || item.BRANCH_NAME || '',
        preAppeal: item.pre_appeal || item.PRE_APPEAL || item.preAppeal || '',
        postAppeal: item.post_appeal || item.POST_APPEAL || item.postAppeal || '',
        appealStatus: item.appeal_status || item.APPEAL_STATUS || item.appealStatus || 'Pending',
      }));
      setData(mappedData);
    } else if (Array.isArray(responseData)) {
      const mappedData = responseData.map((item) => ({
        ticketId: item.ticket_id || item.TICKET_ID || item.ticketId || '',
        empNumber: item.emp_number || item.EMP_NUMBER || item.empNo || item.EMP_ID || '',
        empName: item.emp_name || item.EMP_NAME || item.employeeName || item.employee_name || '',
        primaryRole: item.primary_role || item.PRIMARY_ROLE || item.role || item.ROLE || '',
        branch: item.branch || item.BRANCH || item.branch_name || item.BRANCH_NAME || '',
        preAppeal: item.pre_appeal || item.PRE_APPEAL || item.preAppeal || '',
        postAppeal: item.post_appeal || item.POST_APPEAL || item.postAppeal || '',
        appealStatus: item.appeal_status || item.APPEAL_STATUS || item.appealStatus || 'Pending',
      }));
      setData(mappedData);
    }
  }, [data]);

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

  /**
   * Handle "View Appeal" button click (for appeal_approved status)
   */
  const handleViewAppeal = (row) => {
    navigate('/appeal/review', {
      state: {
        roleId: row.roleId,
        ticketId: row.ticketId,
        duration: row.duration,
        empNo: row.empNumber,
        empName: row.empName,
        appraiser: row.appraiser,
        primaryRole: row.primaryRole,
        branch: row.branch,
        financialYear: financialYearForAPI,
        quarter: filters.quarter,
        appealStatus: row.appealStatus,
        preAppeal: row.preAppeal,
        postAppeal: row.postAppeal,
        viewOnly: true, // View mode for approved appeals
      },
    });
  };

  /**
   * Handle "Review Appeal" button click (for pending status)
   */
  const handleReviewAppeal = (row) => {
    navigate('/appeal/review', {
      state: {
        roleId: row.roleId,
        ticketId: row.ticketId,
        duration: row.duration,
        empNo: row.empNumber,
        empName: row.empName,
        appraiser: row.appraiser,
        primaryRole: row.primaryRole,
        branch: row.branch,
        financialYear: financialYearForAPI,
        quarter: filters.quarter,
        appealStatus: row.appealStatus,
        preAppeal: row.preAppeal,
        postAppeal: row.postAppeal,
        viewOnly: false, // Review mode for pending appeals
      },
    });
  };

  /**
   * Handle "View Appraisal" button click
   */
  const handleViewAppraisal = (row) => {
    // Navigate to appraisal view (adjust route as needed)

    // // Annual: pass as query params
    // const queryParams = new URLSearchParams({
    //   financialYear,
    //   appraisalPeriod,
    //   urlId: employee.id || '',
    //   roleName: employee.primary || '',
    //   roleType: employee.primary || 'Administrative Officers',
    // }).toString();
    navigate(`/appraisal/check-in-form`, {
      state: {
        financialYear: 'FY 2025-26',
        appraisalPeriod: 'Annual',
        quarter: 'quarter',
        page_type: 'reva',
        dateRange: '',
        employee: {
          empNo: row?.empNumber,
        },
        organizationName: row?.branch,
        urlId: row?.roleId,
        roleType: 'Reviewer',
        pageType: 'reva',
        intent: 'Review',
        appraisalStatus: 'complete_reva',
        task: 'view',
      },
    });

    console.log('vSDpvapvadmv:', row);

    // const empNumber = row.empNumber;
    // const primaryRole = row.primaryRole;
    // const queryParams = new URLSearchParams({
    //                 financialYearForAPI,
    //                 empNumber,
    //                 urlId:  row.empID || '',
    //                 roleName: primaryRole || '',
    //                 roleType: primaryRole || 'Administrative Officers',
    //               }).toString();
    // navigate(`/appraisal/check-in-form?${queryParams}`, {
    //       state: {
    //         employee: employeeModel,
    //         dateRange: cardDateRange,
    //         financialYear,
    //         appraisalPeriod,
    //         quarter,

    //         pageType: 'self',
    //         appraisalStatus: employee.status,
    //       },
    //     });
  };

  const handleReset = () => {
    setFilters({ employeeName: '', primaryRole: '', branch: '', appealStatus: '' });
  };

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="AppraiserContaniner">
        <div className="d-flex justify-content-between align-items-center px-2">
          <div className="pageWrapper-header">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              {' '}
              Employee Appeal List{' '}
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
      <div className="AppraiserContaniner">
        <div className="d-flex justify-content-between align-items-center px-2">
          <div className="pageWrapper-header">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              {' '}
              Employee Appeal List{' '}
            </h1>
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load appeal list data</p>
          <p className="text-muted">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="AppraiserContaniner ">
      <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
        {/* Left Side: Breadcrumb */}
        <div className="breadcrumb-path"></div>

        {/* Right Side: Info Section */}
        <div className="breadcrumb-info d-flex align-items-center">
          <span className="breadcrumb-fy me-2">FY 2025-2026</span>
          <button className="blue-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark">
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

      {console.log('FILTER DATA', filterData)}
      <section className="mb-4 p-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Employee Name</label>
            <select
              className="form-select"
              value={filters.employeeName}
              onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
            >
              <option>-Select-</option>
              {filterData?.employee_names
                ?.filter((item) => item !== '')
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Primary Role</label>
            <select
              className="form-select"
              value={filters.primaryRole}
              onChange={(e) => setFilters({ ...filters, primaryRole: e.target.value })}
            >
              <option>-Select-</option>
              {filterData?.primary_roles
                ?.filter((item) => item !== '')
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Branch</label>
            <select
              className="form-select"
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            >
              <option>-Select-</option>
              {filterData?.branch_names
                ?.filter((item) => item !== '')
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Appeal Status</label>
            <select
              className="form-select"
              value={filters.appealStatus}
              onChange={(e) => setFilters({ ...filters, appealStatus: e.target.value })}
            >
              <option>-Select-</option>
              {filterData?.ticket_statuses
                ?.filter((item) => item !== '')
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn reset-btn me-2" onClick={handleReset}>
              Reset ↻
            </button>
          </div>
        </div>
        <AppealTable
          data={Data}
          onViewAppeal={handleViewAppeal}
          onReviewAppeal={handleReviewAppeal}
          onViewAppraisal={handleViewAppraisal}
        />

        {/* pagination */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3">
          <small className="text-muted">
            Showing {Data.length === 0 ? 0 : startIndex + 1} to{' '}
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
