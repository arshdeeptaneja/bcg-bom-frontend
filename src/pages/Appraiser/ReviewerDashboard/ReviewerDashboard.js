import React, { useMemo, useState } from 'react';
import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './ReviewerDashboard.css';

// TODO: Replace with reviewer dashboard API response when endpoint is available.
const mockAssignments = [
  {
    empNo: '36663',
    employeeName: 'Demo User',
    primaryRole: 'Branch Manager',
    branch: 'Mumbai Main',
    appraisalStatus: 'Pending at Reviewer',
    exceptionStatus: 'N/A',
    urlId: 'URL-36663',
    dateRange: '01 Apr 2024 - 31 Mar 2025',
  },
];

const buildDateRange = (fyLabel, quarter) => {
  if (!fyLabel) return '';
  const match = `${fyLabel}`.match(/FY\s(\d{4})/);
  if (!match) return '';
  const startYear = Number(match[1]);
  switch (quarter) {
    case 'Q1':
      return `01 Apr ${startYear} - 30 Jun ${startYear}`;
    case 'Q2':
      return `01 Jul ${startYear} - 30 Sep ${startYear}`;
    case 'Q3':
      return `01 Oct ${startYear} - 31 Dec ${startYear}`;
    case 'Q4':
      return `01 Jan ${startYear + 1} - 31 Mar ${startYear + 1}`;
    default:
      return `01 Apr ${startYear} - 31 Mar ${startYear + 1}`;
  }
};

function ReviewerDashboard() {
  const [filters, setFilters] = useState({ employee: '', role: '', branch: '', status: '' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const loggedInEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.EMP_ID || '');

  const financialYear = searchParams.get('financialYear') || 'FY 2024-25';
  const appraisalPeriod = searchParams.get('appraisalPeriod') || 'Annual';
  const quarter = searchParams.get('quarter') || '';

  const assignments = useMemo(() => {
    const dataset = mockAssignments.map((item) => ({
      ...item,
      dateRange: item.dateRange || buildDateRange(financialYear, quarter),
    }));

    return dataset.filter((item) => {
      const matchesEmployee = filters.employee
        ? item.employeeName?.toLowerCase().includes(filters.employee.toLowerCase()) ||
          item.empNo?.toLowerCase().includes(filters.employee.toLowerCase())
        : true;
      const matchesRole = filters.role
        ? item.primaryRole?.toLowerCase().includes(filters.role.toLowerCase())
        : true;
      const matchesBranch = filters.branch
        ? item.branch?.toLowerCase().includes(filters.branch.toLowerCase())
        : true;
      const matchesStatus = filters.status
        ? item.appraisalStatus?.toLowerCase().includes(filters.status.toLowerCase())
        : true;

      return matchesEmployee && matchesRole && matchesBranch && matchesStatus;
    });
  }, [filters, financialYear, quarter]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({ employee: '', role: '', branch: '', status: '' });
  };

  const handleReview = (assignment) => {
    navigate('/appraiser/reviewer-mode', {
      state: {
        financialYear,
        appraisalPeriod,
        quarter,
        dateRange: assignment.dateRange,
        role: 'REVIEWER',
        employee: {
          empNo: assignment.empNo,
          employeeName: assignment.employeeName,
          branch: assignment.branch,
          primaryRole: assignment.primaryRole,
          appraiser: assignment.appraiser,
          reviewer: loggedInEmpNo,
        },
        urlId: assignment.urlId,
        appraisalStatus: assignment.appraisalStatus,
      },
    });
  };

  return (
    <div className="pageWrapper reviewer-dashboard">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Reviewer Dashboard</h1>
        </div>
        <h5 className="text-muted fw-bold mb-0">
          {appraisalPeriod === 'Quarterly' && quarter ? `${quarter}, ` : ''}
          {financialYear} {appraisalPeriod} Appraisals
        </h5>
      </div>

      <div className="filters-card shadow-sm p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold text-primary">Employee</label>
            <input
              type="text"
              className="form-control"
              name="employee"
              value={filters.employee}
              onChange={handleFilterChange}
              placeholder="Search by name / number"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold text-primary">Primary Role</label>
            <input
              type="text"
              className="form-control"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              placeholder="Role"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold text-primary">Branch</label>
            <input
              type="text"
              className="form-control"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              placeholder="Branch"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold text-primary">Status</label>
            <input
              type="text"
              className="form-control"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              placeholder="Pending / Completed"
            />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-primary" onClick={handleClear}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table align-middle reviewer-table">
          <thead className="table-primary">
            <tr>
              <th>Employee No</th>
              <th>Employee Name</th>
              <th>Primary Role</th>
              <th>Branch</th>
              <th>Appraisal Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No assignments found for the selected filters.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.empNo}>
                  <td>{assignment.empNo}</td>
                  <td>{assignment.employeeName}</td>
                  <td>{assignment.primaryRole}</td>
                  <td>{assignment.branch}</td>
                  <td>{assignment.appraisalStatus}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleReview(assignment)}>
                      Review Appraisal
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReviewerDashboard;
