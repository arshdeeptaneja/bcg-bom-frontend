import React from 'react';
import RoleTimeline from '../../../../components/Appraisal/CheckInDescriptionSection/RoleTimeline';

const InfoItem = ({ icon, label, value, subtext }) => (
  <div className="d-flex align-items-start gap-3">
    <div
      className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center"
      style={{ width: 40, height: 40, minWidth: 40 }}
    >
      <i className={`bi ${icon}`} style={{ fontSize: '1.2rem' }} />
    </div>
    <div>
      <div className="text-muted small fw-bold text-uppercase">{label}</div>
      <div className="fw-bold text-dark">{value}</div>
      {subtext && <div className="text-muted small">{subtext}</div>}
    </div>
  </div>
);

const QuarterlyHeader = ({ employee, dateRange, primaryRole, additionalRoles }) => {
  if (!employee) return null;

  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <InfoItem
            icon="bi-person"
            label="EMP NUMBER"
            value={employee.empNo || employee.EMP_ID}
          />
        </div>
        <div className="col-md-3">
          <InfoItem
            icon="bi-person-circle"
            label="EMPLOYEE NAME"
            value={employee.employeeName || employee.EMP_NAME}
          />
        </div>
        <div className="col-md-3">
          <InfoItem
            icon="bi-person-badge"
            label="APPRAISEE"
            value={employee.employeeName || employee.EMP_NAME}
            subtext={
              <>
                <div>EMP #{employee.empNo || employee.EMP_ID}</div>
                <div>Appraisee Date :</div>
              </>
            }
          />
        </div>
        <div className="col-md-3">
          <InfoItem
            icon="bi-person-check"
            label="APPRAISER"
            value={employee.appraiserName || employee.appraiser || 'N/A'}
            subtext={
              employee.appraiserId ? <div>EMP #{employee.appraiserId}</div> : null
            }
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <InfoItem
            icon="bi-clock"
            label="DURATION"
            value={dateRange}
          />
        </div>
        <div className="col-md-3">
          <InfoItem
            icon="bi-building"
            label="BRANCH/OFFICE"
            value={employee.branch || employee.SOL_DESC || 'N/A'}
          />
        </div>
        <div className="col-md-6">
          <InfoItem
            icon="bi-briefcase"
            label="PRIMARY ROLE"
            value={primaryRole}
          />
        </div>
      </div>

      <div className="mt-4">
        <RoleTimeline additionalRoles={additionalRoles} />
      </div>
    </div>
  );
};

export default QuarterlyHeader;
