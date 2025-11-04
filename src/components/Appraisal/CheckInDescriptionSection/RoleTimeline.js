import './RoleTimeline.css';

/**
 * This is the timeline section of the check-in form.
 * @param {Object} props - The properties of the component.
 * @param {Array} props.additionalRoles - The additional roles of the employee.
 * @returns
 */
export default function RoleTimeline({ additionalRoles }) {
  return (
    <div className="additional-roles-section">
      <div className="d-flex align-items-center mb-2">
        <span className="text-muted fw-semibold me-3">Roles</span>
        <div className="roles-timeline flex-grow-1 position-relative d-flex align-items-center">
          <hr className="m-0 flex-grow-1" style={{ borderTop: '1px solid #000000' }} />
          <div className="d-flex justify-content-between position-absolute w-100">
            {[1, 2, 3, 4].map((index) => (
              <div className="role-dot-container">
                <div
                  key={index}
                  className="role-dot bg-dark rounded-circle"
                  style={{ width: '8px', height: '8px', transform: 'translateX(-50%)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-3">
        {[1, 2, 3, 4].map((index) => {
          const role = additionalRoles[index - 1];
          return (
            <div key={index} className="text-center">
              <div className="text-muted small">
                Additional Role {String(index).padStart(2, '0')}
              </div>
              <div className="fw-semibold mt-1">{role || 'none'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
