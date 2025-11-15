import React from "react";
import "./AppealTable.css";

const AppealTable = ({ data }) => {
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
            data.map((row, index) => (
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
                <td
                  className={`appeal-table-cell appeal-table-status ${
                    row.appealStatus === "Accepted"
                      ? "appeal-status-accepted"
                      : row.appealStatus === "Pending"
                      ? "appeal-status-pending"
                      : "appeal-status-rejected"
                  }`}
                >
                  {row.appealStatus}
                </td>
                <td className="appeal-table-cell appeal-table-actions">
                  <div className="appeal-table-btn-group">
                    <button className="appeal-btn appeal-btn-view">
                      View Appraisal
                    </button>
                    <button className="appeal-btn appeal-btn-review">
                      {row.appealStatus === "Pending"
                        ? "Review Appeal"
                        : "View Appeal"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
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
