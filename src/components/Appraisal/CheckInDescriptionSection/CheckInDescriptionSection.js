import { RoleTimeline } from '..';
import './CheckInDescriptionSection.css';
/**
 * This is the description section of the check-in form.
 * @param {Object} props - The properties of the component.
 * @param {Object} props.employee - The employee object.
 * @param {string} props.dateRange - The date range of the appraisal.
 * @returns
 */
export default function CheckInDescriptionSection({ employee, dateRange }) {
  console.log(employee);
  console.log(dateRange);
  return (
    <div className="check-in-description-section">
      <div className="row">
        {/* Column 1: Employee Number and Duration */}
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

        {/* Column 2: Employee Name and Branch/Office */}
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

        {/* Column 3: Primary Role and Appraiser */}
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

        {/* Column 3: Appraiser */}
        <div className="col-md-3">
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
          <div className="d-flex align-items-start gap-3"></div>
        </div>
      </div>

      {/* Additional Roles Timeline */}
      <div className="additional-roles-timeline mt-5">
        <RoleTimeline additionalRoles={employee.roles} />
      </div>
    </div>
  );
}
