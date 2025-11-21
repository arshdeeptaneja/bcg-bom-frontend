import { RoleTimeline } from '..';
import './CheckInDescriptionSection.css';

export default function CheckInDescriptionSection({ employee, dateRange, showDownloadButton = false, onDownload }) {
  return (
    <div className="check-in-description-section">

      {/* ✅ Download Button Positioned Top-Right (Only When Enabled) */}
      {showDownloadButton && (
        <div className="text-end mb-3">
          <button
            className="btn"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "#fff",
              borderRadius: "20px",
              padding: "6px 18px",
              fontSize: "14px"
            }}
            onClick={onDownload}
          >
            Download Attachment
          </button>
        </div>
      )}

      <div className="row">
        {/* Column 1 */}
     {employee.organisation && (
  <div className="d-flex align-items-start gap-3 mt-3">
    <div
      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
      style={{ width: 40, height: 40 }}
    >
      <i className="bi bi-building" />
    </div>
    <div>
      <div className="text-muted small">Organization</div>
      <div className="fw-semibold">{employee.organisation}</div>
    </div>
  </div>
)}

        {/* Column 2 */}
      {employee.appraiseeContact && (
  <div className="d-flex align-items-start gap-3 mt-3">
    <div
      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
      style={{ width: 40, height: 40 }}
    >
      <i className="bi bi-phone" />
    </div>
    <div>
      <div className="text-muted small">Contact No</div>
      <div className="fw-semibold">{employee.appraiseeContact}</div>
    </div>
  </div>
)}

{employee.appraiseeEmail && (
  <div className="d-flex align-items-start gap-3 mt-3">
    <div
      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
      style={{ width: 40, height: 40 }}
    >
      <i className="bi bi-envelope" />
    </div>
    <div>
      <div className="text-muted small">Email</div>
      <div className="fw-semibold">{employee.appraiseeEmail}</div>
    </div>
  </div>
)}


        {/* Column 3 */}
        <div className="col-md-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-graph-up" />
            </div>
            <div>
              <div className="text-muted small">Appraisee</div>
              <div className="fw-semibold">{employee.employeeName}</div>
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
              <div className="text-muted small">Primary Role</div>
              <div className="fw-semibold">{employee.primaryRole}</div>
            </div>
          </div>
        </div>

        {/* Column 4 */}
        {employee.validatorName && (
  <div className="d-flex align-items-start gap-3 mt-3">
    <div
      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
      style={{ width: 40, height: 40 }}
    >
      <i className="bi bi-person-check-fill" />
    </div>
    <div>
      <div className="text-muted small">Validator</div>
      <div className="fw-semibold">
        {employee.validatorName} ({employee.validatorNumber})
      </div>
    </div>
  </div>
)}


        {/* column5 */}

        {/* {employee.status && (
  <div className="mt-4">
    <div className="text-muted small">Status</div>
    <div className="fw-semibold text-danger">{employee.status}</div>
  </div>
)}

{employee.appealStatus && (
  <div className="mt-2">
    <div className="text-muted small">Appeal Status</div>
    <div className="fw-semibold text-primary">{employee.appealStatus}</div>
  </div>
)} */}

<div>
  
</div>



      </div>

      <div className="additional-roles-timeline mt-5">
        <RoleTimeline additionalRoles={employee.roles} />
      </div>
    </div>
  );
}
