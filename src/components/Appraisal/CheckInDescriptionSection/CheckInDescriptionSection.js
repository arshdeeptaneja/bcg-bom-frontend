import { RoleTimeline } from '..';
import './CheckInDescriptionSection.css';

export default function CheckInDescriptionSection({ employee, dateRange, showDownloadButton = false, onDownload }) {
  return (
    <div className="check-in-description-section" style={{padding: '16px'}}>

      <div className="row">
        {/* Column 1 */}
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
              <div className="text-muted small">Duration</div>
              <div className="fw-semibold">{dateRange}</div>
            </div>
          </div>

          

        </div>

        {/* Column 2 */}
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
              <div className="text-muted small">Branch/Office</div>
              <div className="fw-semibold">{employee.branch}</div>
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="col-md-2">
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

        {/* Column 4 - Appraiser */}
        <div className="col-md-2">
          <div className="d-flex align-items-start gap-3">
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

        {/* Column 5 - Download Button */}
        {showDownloadButton && (
          <div className="col-md-2 d-flex align-items-start justify-content-end">
            <button
              className="btn"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "#fff",
                borderRadius: "20px",
                padding: "8px 20px",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}
              onClick={onDownload}
            >
              Download Attachment
            </button>
          </div>
        )}
      </div>

      <div className="additional-roles-timeline mt-5">
        <RoleTimeline additionalRoles={employee.roles} />
      </div>
    </div>
  );
}
