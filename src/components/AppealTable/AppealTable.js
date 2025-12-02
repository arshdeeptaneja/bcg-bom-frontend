import React from "react";
import "./AppealTable.css";

/**
 * Helper to normalize status for comparison (case-insensitive)
 */
const normalizeStatus = (status) => (status || '').toLowerCase().trim();

/**
 * Determines button text based on appeal status
 * - "appeal_approved" -> "View Appeal"
 * - "pending" -> "Review Appeal"
 * - Other statuses default to "View Appeal"
 */
const getAppealButtonText = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'pending') return 'Review Appeal';
  return 'View Appeal';
};

/**
 * Gets display-friendly status text
 */
const getDisplayStatus = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'appeal_approved') return 'Approved';
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'rejected' || normalized === 'appeal_rejected') return 'Rejected';
  return status || 'Pending';
};

const AppealTable = ({ data, onViewAppeal, onReviewAppeal, onViewAppraisal }) => {
  /**
   * Handles appeal button click based on status
   */
  const handleAppealClick = (row) => {
    const normalized = normalizeStatus(row.appealStatus);
    if (normalized === 'pending') {
      onReviewAppeal?.(row);
    } else {
      onViewAppeal?.(row);
    }
  };

  return (
    <div className="appeal-table-container">
      <table className="appeal-table">
        <thead className="appeal-table-head">
          <tr className="appeal-table-header-row">
            <th className="appeal-table-header">Ticket ID</th>
            <th className="appeal-table-header">Employee Number</th>
            <th className="appeal-table-header">Employee Name</th>
            <th className="appeal-table-header">Primary Role</th>
            <th className="appeal-table-header">Branch</th>
            <th className="appeal-table-header">Pre Appeal Score / Grade</th>
            <th className="appeal-table-header">Post Appeal Score / Grade</th>
            <th className="appeal-table-header">Appeal Status</th>
            <th className="appeal-table-header">Appeal Details</th>
          </tr>
        </thead>
        <tbody className="appeal-table-body">
          {data && data.length > 0 ? (
            data.map((row, index) => {
              const normalizedStatus = normalizeStatus(row.appealStatus);
              const statusClass =
                normalizedStatus === 'appeal_approved' || normalizedStatus === 'approved'
                  ? 'appeal-status-accepted'
                  : normalizedStatus === 'pending'
                  ? 'appeal-status-pending'
                  : 'appeal-status-rejected';

              return (
                <tr className="appeal-table-row" key={index}>
                  <td className="appeal-table-cell appeal-table-ticketid">
                    {row.ticketId}
                  </td>
                  <td className="appeal-table-cell appeal-table-empnumber">
                    {row.empNumber}
                  </td>
                  <td className="appeal-table-cell appeal-table-empname">
                    {row.empName}
                  </td>
                  <td className="appeal-table-cell appeal-table-role">
                    {row.primaryRole}
                  </td>
                  <td className="appeal-table-cell appeal-table-branch">
                    {row.branch}
                  </td>
                  <td className="appeal-table-cell appeal-table-preappeal">
                    {row.preAppeal}
                  </td>
                  <td className="appeal-table-cell appeal-table-postappeal">
                    {row.postAppeal}
                  </td>
                  <td className={`appeal-table-cell appeal-table-status ${statusClass}`}>
                    {getDisplayStatus(row.appealStatus)}
                  </td>
                  <td className="appeal-table-cell appeal-table-actions">
                    <div className="appeal-table-btn-group">
                      <button
                        className="appeal-btn appeal-btn-view"
                        onClick={() => onViewAppraisal?.(row)}
                      >
                        View Appraisal
                      </button>
                      <button
                        className="appeal-btn appeal-btn-review"
                        onClick={() => handleAppealClick(row)}
                      >
                        {getAppealButtonText(row.appealStatus)}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="appeal-table-row-empty">
              <td
                className="appeal-table-cell appeal-table-empty"
                colSpan="9"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppealTable;
