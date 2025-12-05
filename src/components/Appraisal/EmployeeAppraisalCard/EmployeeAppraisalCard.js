import PropTypes from 'prop-types';
import './EmployeeAppraisalCard.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Modal from '../../common/Modal/Modal';
import RoleTimeline from '../../../components/Appraisal/CheckInDescriptionSection/RoleTimeline';
/**
 * Employee Appraisal summary card
 * Accepts an EmployeeModel instance (`employee`) and renders key details with actions.
 */
export default function EmployeeAppraisalCard({
  employee,
  dateRange,
  quarter,
  appraisalPeriod,
  primaryRole,
  organization,
  appraisalStatus = 'PENDING AT APPRAISEE',
  exceptionStatus = 'NOT CREATED',

  userType = 'self', // Two options - self, appraiser
  // Individual additional roles

  additionalRoles = [],
  scoreData = [],
  redResult = [],
  onAddCheckIn,
  onViewSummary,
  onAddException,
  onAddAppeal,
  isViewAppealOnly=false,
  onViewAppeal,
  isViewOnly = false,
  isCheckInDisabled = false,
  isAppealEnabled = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Helper function to format ISO date to readable format
  const formatDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    try {
      const date = new Date(isoDateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return isoDateString;
    }
  };

  // Format the date range properly
  const getFormattedDateRange = () => {
    if (!dateRange) return 'N/A';

    // Check if it contains ISO dates (with T and Z)
    if (dateRange.includes('T')) {
      // Split by → separator
      const parts = dateRange.split(' → ').map((d) => d.trim());
      if (parts.length === 2) {
        const startDate = formatDate(parts[0]);
        const endDate = formatDate(parts[1]);
        return `${startDate} → ${endDate}`;
      }
    }

    // If already formatted, return as is
    return dateRange;
  };

  // Helper method to toggle the expansion state
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Helper function to get badge color based on status
  const getStatusColor = (status) => {
    if (!status) return '#800000'; // default maroon

    const statusUpper = status.toUpperCase();

    // Red/Danger statuses
    if (
      statusUpper.includes('PENDING') ||
      statusUpper.includes('NOT CREATED') ||
      statusUpper.includes('REJECTED') ||
      statusUpper.includes('CANCELLED')
    ) {
      return '#800000'; // maroon/dark red
    }

    // Yellow/Warning statuses
    if (
      statusUpper.includes('IN PROGRESS') ||
      statusUpper.includes('PROCESSING') ||
      statusUpper.includes('REVIEW')
    ) {
      return '#ffc107'; // warning yellow
    }

    // Green/Success statuses
    if (
      statusUpper.includes('COMPLETED') ||
      statusUpper.includes('APPROVED') ||
      statusUpper.includes('SUBMITTED') ||
      statusUpper.includes('CREATED')
    ) {
      return '#198754'; // success green
    }

    // Default
    return '#800000';
  };

  if (!employee) return null;

  return (
    <section className="employee-appraisal-card p-3 mt-4">
      {/** Bootstrap modal trigger wiring via id */}
      {(() => {
        const addCheckInModalId = `addCheckInModal-${employee.empNo}`;
        return (
          <>
            <div className="d-none" />
            <Modal
              id={addCheckInModalId}
              title="Alert"
              body={`${employee.appraiser} is your appraising authority for ${quarter} ${appraisalPeriod} Performance Appraisal. If it is found correct, Please click on "Yes" for submission of appraisal. Click on "NO" If it is not correct and raise the issue through the HO HR.`}
              actions={{
                primary: {
                  label: 'Yes',
                  onClick: () => {
                    onAddCheckIn();
                  },
                },
                secondary: {
                  label: 'No',
                  onClick: () => {
                    // Close modal
                    document.getElementById(addCheckInModalId).dataset.bsDismiss = 'modal';
                  },
                },
              }}
            />
          </>
        );
      })()}
      {/* Top detail grid */}
      <div className="row g-3 align-items-center">
        <div className="col-md-1">
          <button
            type="button"
            className="toggle-button btn d-flex flex-column align-items-center gap-2"
            onClick={toggleExpand}
          >
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
            Click to Proceed
          </button>
        </div>
        <div className="col-md-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-person" />
            </div>
            <div>
              <div className="text-muted small">Employee Number</div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {employee.empNo}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-start gap-3 mt-3">
            <div
              className="rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-calendar-event" />
            </div>
            <div>
              <div className="text-muted small">Date</div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {getFormattedDateRange()}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-person-check" />
            </div>
            <div>
              <div className="text-muted small">Employee Name</div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {employee.employeeName}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-start gap-3 mt-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-briefcase" />
            </div>
            <div>
              <div className="text-muted small">Primary Role</div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {primaryRole}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-graph-up" />
            </div>
            <div>
              <div className="text-muted small">Employee Scale</div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {employee.employeeScale}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-start gap-3 mt-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-person-badge" />
            </div>
            <div>
              <div className="text-muted small">Appraiser</div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {employee.appraiser?.name || employee.appraiser || 'N/A'}
              </div>
            </div>
          </div>
        </div>
        {/* Status badges */}
        <div className="col-md-2 d-flex flex-column justify-content-evenly align-items-center">
          <p className="status-label fw-bold my-0 mb-1">Appraisal Status</p>
          <span
            className="badge rounded-pill px-4 my-0"
            style={{ backgroundColor: getStatusColor(appraisalStatus), color: 'white' }}
          >
            {appraisalStatus}
          </span>
          {}
          {userType === 'self' && (
            <>
              <p className="status-label fw-bold mt-3 mb-1">
                {appraisalPeriod === 'Quarterly' ? 'Exception Status' : 'Appeal Status'}
              </p>

              <span
                className="badge rounded-pill px-4 my-0"
                style={{
                  backgroundColor: getStatusColor(exceptionStatus),
                  color: 'white',
                }}
              >
                {exceptionStatus}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions (animated collapse) */}
      <div
        className={`actions-collapse row mt-5 ${isExpanded ? 'open' : ''}`}
        aria-hidden={!isExpanded}
      >
        {/* Red Result Section (if available) */}

        {/* Score Breakdown Section */}
        {/* {scoreData && scoreData.length > 0 && (
          <div className="score-breakdown-section col-12 mb-4">
            <h5 className="text-primary fw-bold mb-3">Score Breakdown</h5>
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="table-primary">
                  <tr>
                    <th>Cycle</th>
                    <th>Percentage Score</th>
                    <th>Weightage</th>
                    <th>Weighted Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreData.map((score, scoreIndex) => (
                    <tr key={scoreIndex}>
                      <td>{score.CYCLE || '-'}</td>
                      <td>{score.PERCENTAGE_SCORE ?? 0}</td>
                      <td>{score.WEIGHTAGE ?? 0}</td>
                      <td>{score.WEIGHTED_SCORE ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {/* Role Description Section */}
        <div className="role-description col-md-6 col-12">
          {/* Primary Role */}
          <div className="primary-role-badge mb-3">
            <span className="badge bg-light text-dark px-3 py-2 d-inline-flex align-items-center gap-2">
              <i className="bi bi-star-fill text-success" />
              <span className="fw-semibold" style={{ fontSize: '1rem' }}>
                {primaryRole || 'N/A'}
              </span>
            </span>
          </div>

          {/* Additional Roles Timeline */}
          <RoleTimeline additionalRoles={additionalRoles} />

          {/* Organization */}
          <div className="organization-section">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark">Organization</span>
              <span className="text-muted">{organization || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="spacer col-md-1 col-12"></div>

        {/* Action Buttons Section */}
        <div className="action-buttons col-md-5 col-12 d-flex flex-column">
          <div className="button-row">
            <button
              type="button"
              className={`btns btn-primarys ${(isCheckInDisabled) ? 'disabled-btn' : ''}`}
              data-bs-toggle="modal"
              data-bs-target={`#${`addCheckInModal-${employee.empNo}`}`}
              disabled={isCheckInDisabled}
            >
              Add Check-In Summary
              <span className="ms-2">→</span>
            </button>
            <button type="button" 
            className={`btns btn-primarys ${(!isViewOnly) ? 'disabled-btn' : ''}`} 
            onClick={onViewSummary}
            disabled={!isViewOnly}
            >
              View Check-In Summary
              <span className="ms-2">→</span>
            </button>
          </div>
          <div className="button-row">
            {userType === 'self' &&
              appraisalPeriod === 'Quarterly' &&
              appraisalStatus?.toUpperCase() === 'COMPLETED' &&
              onAddException && (
                <button
                  type="button"
                  className="btn-fade"
                  onClick={() => {
                    onAddException();
                  }}
                >
                  Add Exception
                  <span className="ms-2">→</span>
                </button>
              )}
            {userType === 'self' && appraisalPeriod === 'Annual' && (
              <button
                type="button"
                // className="btn-fade"
                className={`btns btn-primarys ${(!isAppealEnabled) ? 'disabled-btn' : ''}`}
                onClick={() => {
                  onAddAppeal && onAddAppeal();
                }}
                disabled={!isAppealEnabled}
              >
                Add Appeal
                <span className="ms-2">→</span>
              </button>
            )}


            {userType === 'self' && appraisalPeriod === 'Annual' && (
              <button
                type="button"
                // className="btn-fade"
                className={`btns btn-primarys ${(!isViewAppealOnly) ? 'disabled-btn' : ''}`}
                onClick={() => {
                  onViewAppeal && onViewAppeal();
                }}
                disabled={!isViewAppealOnly}
              >
                View Appeal
                <span className="ms-2">→</span>
              </button>
            )}


          </div>
        </div>
      </div>
    </section>
  );
}

EmployeeAppraisalCard.propTypes = {
  employee: PropTypes.shape({
    empNo: PropTypes.string,
    employeeName: PropTypes.string,
    employeeScale: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roles: PropTypes.any,
    appraiser: PropTypes.any,
  }).isRequired,
  dateRange: PropTypes.string,
  primaryRole: PropTypes.string,
  additionalRoles: PropTypes.arrayOf(PropTypes.string), // <-- Correct
  organization: PropTypes.string,
  appraisalStatus: PropTypes.string,
  exceptionStatus: PropTypes.string,
  scoreData: PropTypes.arrayOf(
    PropTypes.shape({
      CYCLE: PropTypes.string,
      PERCENTAGE_SCORE: PropTypes.number,
      WEIGHTAGE: PropTypes.number,
      WEIGHTED_SCORE: PropTypes.number,
    })
  ),
  onAddCheckIn: PropTypes.func,
  onViewSummary: PropTypes.func,
  onAddException: PropTypes.func,
  onAddAppeal: PropTypes.func,
  redResult: PropTypes.array,
  isCheckInDisabled: PropTypes.bool,
  isAppealEnabled: PropTypes.bool,
};
