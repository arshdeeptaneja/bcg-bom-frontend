import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnnualAppraiserCard.css';

import Modal from '../../../components/common/Modal/Modal';
import RoleTimeline from '../../../components/Appraisal/CheckInDescriptionSection/RoleTimeline';
/**
 * Employee Appraisal summary card
 * Accepts an EmployeeModel instance (`employee`) and renders key details with actions.
 */
export default function AnnualAppraiserCard({
  employee,
  dateRange,
  quarter,
  appraisalPeriod,
  primaryRole,
  additionalRoles = [],
  organization,
  appraisalStatus = 'PENDING AT APPRAISEE',
  exceptionStatus = 'NOT CREATED',
  onAddCheckIn,
  onAddAppraisal,
  annualButtons = false,
  onViewSummary,
  onAddException,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

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

  //download PDF handler
  const onDownloadPDF = () => {
    // window.open(`${BaseUrl}/api/v1/download-report/${employee.empNo}`, "_blank");
    alert('Download PDF functionality to be implemented.');
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
              <div className="fw-semibold">{employee.empNo}</div>
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
              <div className="fw-semibold">{dateRange}</div>
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
              <div className="fw-semibold">{employee.employeeName}</div>
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
              <div className="fw-semibold">{primaryRole}</div>
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
              <div className="fw-semibold">{employee.employeeScale}</div>
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
              <div className="fw-semibold">
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
          <p className="status-label fw-bold mt-3 mb-1">Exception Status</p>
          <span
            className="badge rounded-pill px-4 my-0"
            style={{ backgroundColor: getStatusColor(exceptionStatus), color: 'white' }}
          >
            {exceptionStatus}
          </span>
        </div>
      </div>

      {/* Actions (animated collapse) */}
      <div
        className={`actions-collapse row mt-5 ${isExpanded ? 'open' : ''}`}
        aria-hidden={!isExpanded}
      >
        {/* Role Description Section */}
        <div className="role-description col-md-6 col-12">
          {/* Primary Role */}
          <div className="primary-role-badge mb-3">
            <span className="badge bg-light text-dark px-3 py-2 d-inline-flex align-items-center gap-2">
              <i className="bi bi-star-fill text-success" />
              <span className="fw-semibold">{primaryRole || 'N/A'}</span>
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
 {/* <button
              type="button"
              className="butns "
              data-bs-toggle="modal"
            >
              View Appraisal Summary
              <span className="ms-2">→</span>
            </button>
            <button
              type="button"
              className="btn-fade"
              onClick={() => {
                if (typeof onAddAppraisal === "function") {
                  onAddAppraisal(); // calls parent function
                } else {
                  console.warn("onAddAppraisal not provided");
                }
              }}
            >
              Add Appraisal
              <span className="ms-2">→</span>
            </button> */}

            {annualButtons && (
              <div className="annual-buttons-wrapper mt-3">

                {/* Row 1 */}
                <div className="d-flex gap-3 mb-3 flex-wrap">

                  {/* Download PDF */}
                  <button
                    className="annual-btn outline-btn"
                    onClick={onDownloadPDF}
                  >
                    Download PDF Report
                    <span className="ms-2 arrow">→</span>
                  </button>

                  {/* Add Appeal */}
                  <button
                    className="annual-btn filled-btn"
                    onClick={() => navigate('/annual/add-appeal')}
                  >
                    Add Appeal
                    <span className="ms-2 arrow">→</span>
                  </button>

                </div>

                {/* Row 2 */}
                <div className="d-flex gap-3 flex-wrap">

                  {/* Add Appraisal */}
                  <button
                    className="annual-btn grey-btn"
                    onClick={() => navigate('/appraisal/add')}
                  >
                    Add Appraisal
                    <span className="ms-2 arrow">→</span>
                  </button>

                  {/* View Summary */}
                  <button
                    className="annual-btn outline-btn"
                    onClick={() => navigate('/appraisal/summary')}
                  >
                    View Appraisal Summary
                    <span className="ms-2 arrow">→</span>
                  </button>

                </div>

              </div>
            )}


          </div>

        </div>
      </div>
    </section>
  );
}

AnnualAppraiserCard.propTypes = {
  employee: PropTypes.shape({
    empNo: PropTypes.string,
    employeeName: PropTypes.string,
    employeeScale: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roles: PropTypes.any,
    appraiser: PropTypes.any,
  }).isRequired,
  dateRange: PropTypes.string,
  primaryRole: PropTypes.string,
  additionalRoles: PropTypes.arrayOf(PropTypes.string),
  organization: PropTypes.string,
  appraisalStatus: PropTypes.string,
  exceptionStatus: PropTypes.string,
  onAddCheckIn: PropTypes.func,
  onViewSummary: PropTypes.func,
  onAddException: PropTypes.func,
  onAddAppraisal: PropTypes.func,
    annualButtons: PropTypes.bool,
};
