/**
 * The `EditRoleLeftSide` component in React handles the display and selection of various roles, along
 * with associated data, for a user in an employee management system.
 * @returns The `EditRoleLeftSide` component is being returned. It contains JSX elements for rendering
 * a form with role selection dropdowns, date inputs, and buttons for submitting and adding more roles.
 * It also displays KRAs and their weights if available. The component includes conditional rendering
 * based on certain conditions like `isEdit`, `rc_mpp_status`, and the number of visible roles.
 * Additionally, it handles
 */

import React, { useEffect, useState } from 'react';
import { HiMiniArrowLongLeft } from 'react-icons/hi2';
import { Navigate, useNavigate } from 'react-router-dom';

const EditRoleLeftSide = ({
  formData,
  primaryRolesList = [],
  secondaryRolesList = [],
  tertiaryRolesList = [],
  quaternaryRolesList = [],
  quinaryRolesList = [],
  onChange,
  selectedPrimaryRole,
  selectedSecondaryRole,
  selectedTertiaryRole,
  selectedQuaternaryRole,
  selectedQuinaryRole,
  selectedKraList = [],
  totalWeight = 0,
  showRoleForm,
  handleSubmitRole,
  isNewAddRole,
  SelectedRolesData,
  employeeHistory,
  isEdit,
  selectedURLId,
  selectedSolId,
  showKraList,
  onBackToHistory
}) => {
  // visibleRolesCount decides how many role dropdowns to show (primary, secondary, ...)
  const [visibleRolesCount, setVisibleRolesCount] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      // In edit mode, only show roles that actually have values
      let count = 1; // Primary role is always visible

      if (formData?.secondary && formData.secondary !== "" && formData.secondary !== "None") count++;
      if (formData?.tertiary && formData.tertiary !== "" && formData.tertiary !== "None") count++;
      if (formData?.quaternary && formData.quaternary !== "" && formData.quaternary !== "None") count++;
      if (formData?.quinary && formData.quinary !== "" && formData.quinary !== "None") count++;

      setVisibleRolesCount(count);
    } else {
      // In add mode, use the simple count
      let count = 1;
      if (formData?.secondary) count++;
      if (formData?.tertiary) count++;
      if (formData?.quaternary) count++;
      if (formData?.quinary) count++;
      setVisibleRolesCount(count);
    }
  }, [formData, isEdit]);

  const handleBackClick = () => {
    onBackToHistory();
  };

  const handleAddMore = () => {
    if (visibleRolesCount < 5) setVisibleRolesCount(visibleRolesCount + 1);
  };

  const formatToShortDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
  };

  // ... existing helper function
  const formatToInputDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  // EFFECTIVE_START_DATE / END_DATE extraction
  const EFFECTIVE_START_DATE = employeeHistory?.empRoles?.EFFECTIVE_START_DATE;
  const EFFECTIVE_END_DATE = employeeHistory?.empRoles?.EFFECTIVE_END_DATE;
  const DURATION = employeeHistory?.empRoles?.DURATION;
  const { empRoles } = employeeHistory || {};
  const { roledata, } = empRoles;
  const ROLE_START_DATE = roledata[0]?.ROLE_START_DATE;
  // const ROLE_EFFECTIVE_START_DATE = roledata[0]?.EFFECTIVE_START_DATE;

  // Helper function to check if a role field should be visible
  const shouldShowRoleField = (roleType) => {
    if (isEdit) {
      // In edit mode, only show if it has a real value
      const value = formData[roleType];
      return value && value !== "" && value !== "None";
    } else {
      // In add mode, show based on visible count
      switch (roleType) {
        case 'secondary': return visibleRolesCount >= 2;
        case 'tertiary': return visibleRolesCount >= 3;
        case 'quaternary': return visibleRolesCount >= 4;
        case 'quinary': return visibleRolesCount >= 5;
        default: return false;
      }
    }
  };

  const rc_mpp_status = employeeHistory?.rc_mpp_status;

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getTodayDateForInput = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getThirtyDaysPriorDate = (dateStr) => {
    if (!dateStr) return '';
    const originalDate = new Date(dateStr);
    if (isNaN(originalDate.getTime())) return '';

    originalDate.setDate(originalDate.getDate() - 30);

    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const hasRoles = roledata && roledata.length > 0;

  const currentDateForLogic = hasRoles
    ? getTodayDateForInput()
    : EFFECTIVE_START_DATE;

  const thirtyDaysPriorDate = getThirtyDaysPriorDate(currentDateForLogic);
  const formattedCurrentRoleStartDate = formatDateForInput(ROLE_START_DATE);

  const calculateInputDateValue = () => {
    if (!roledata || roledata.length === 0) {
      return formattedCurrentRoleStartDate;
    } else {
      return thirtyDaysPriorDate;
    }
  };

  const getMinMaxDate = () => {
    if (roledata && roledata.length > 0) {
      return {
        min: thirtyDaysPriorDate,
        max: formattedCurrentRoleStartDate
      };
    }
    return { min: undefined, max: undefined };
  }

  const dateRestrictions = {
    min: hasRoles
      ? thirtyDaysPriorDate
      : formatDateForInput(EFFECTIVE_START_DATE),

    max: hasRoles
      ? getTodayDateForInput()
      : undefined,
  };
  const inputDateValue = hasRoles
    ? formatDateForInput(formData.startDate)
    : formatDateForInput(EFFECTIVE_START_DATE);

  const verticalData = employeeHistory.empRoles.vertical_roles;

  return (<>
    {roledata.length !== 0 &&
      <button
        className="back-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm rounded-pill bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark"
        onClick={handleBackClick}
      >
        <HiMiniArrowLongLeft size={20} className='lh-1' /> <span className='small fw-semibold'>BACK</span>
      </button>
    }

    <div className="container-fluid py-3">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <h5 className="text-primary fw-bold mb-3">Joining Date:</h5>
          <div className="col-12 mb-4">
            {/* <div className="role-duration">
              <div className="role-start"><p className="timestamp" id="start_date">{formatToShortDate(
                (!roledata || roledata.length === 0)
                  ? EFFECTIVE_START_DATE
                  : ROLE_START_DATE
              )}</p></div>
              <div className="role-status "><span></span><p>{DURATION}</p><img src="/static/media/accepted-check.ae298b4f897319a57bc23e346cd9338a.svg" alt="" /><span></span></div>
              <div className="role-end"><p className="timestamp" id="end_date">{EFFECTIVE_END_DATE ? formatToShortDate(EFFECTIVE_END_DATE) : 'Till Present'}</p></div>
            </div> */}
          </div>

          <form className="form-horizontal select-container" onSubmit={(e) => e.preventDefault()}>
            <div className="row g-3">
              <div className="col-6">
                <label htmlFor="startDate" className="form-label">Role Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  className="form-control rounded"
                  value={inputDateValue}
                  onChange={(e) => onChange('startDate', e.target.value)}
                  disabled={!roledata || roledata.length === 0}
                  min={dateRestrictions.min}
                  max={dateRestrictions.max}
                />
              </div>

              <div className="col-6"></div>

              {formData.userType === 10 &&
                <div className="col-12 col-lg-6">
                  <label htmlFor="verticalRole" className="form-label">Vertical</label>
                  <select
                    id="verticalRole"
                    className="form-select rounded"
                    value={formData.vertical || ''}
                    onChange={(e) => onChange('vertical', e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {Array.isArray(verticalData) && verticalData.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              }

              {/* Primary Role - Always visible */}
              <div className="col-12 col-lg-6">
                <label htmlFor="primaryRole" className="form-label">Primary Role</label>
                <select id="primaryRole" className="form-select rounded" value={formData.primary || ''} onChange={(e) => onChange('primary', e.target.value)}>
                  <option value="">Choose...</option>
                  {Array.isArray(primaryRolesList) && primaryRolesList.map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Secondary Role */}
              {(shouldShowRoleField('secondary') || visibleRolesCount >= 2) && (
                <div className="col-12 col-lg-6">
                  <label htmlFor="secondaryRole" className="form-label">Secondary Role</label>
                  <select id="secondaryRole" className="form-select rounded" value={formData.secondary || ''} onChange={(e) => onChange('secondary', e.target.value)}>
                    <option value="">Choose...</option>
                    {Array.isArray(secondaryRolesList) && secondaryRolesList.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tertiary Role */}
              {(shouldShowRoleField('tertiary') || visibleRolesCount >= 3) && (
                <div className="col-12 col-lg-6">
                  <label htmlFor="tertiaryRole" className="form-label">Tertiary Role</label>
                  <select id="tertiaryRole" className="form-select rounded" value={formData.tertiary || ''} onChange={(e) => onChange('tertiary', e.target.value)}>
                    <option value="">Choose...</option>
                    {Array.isArray(tertiaryRolesList) && tertiaryRolesList.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quaternary Role */}
              {rc_mpp_status.toLowerCase() == 'yes' && (shouldShowRoleField('quaternary') || visibleRolesCount >= 4) && (
                <div className="col-12 col-lg-6">
                  <label htmlFor="quaternaryRole" className="form-label">Quaternary Role</label>
                  <select id="quaternaryRole" className="form-select rounded" value={formData.quaternary || ''} onChange={(e) => onChange('quaternary', e.target.value)}>
                    <option value="">Choose...</option>
                    {Array.isArray(quaternaryRolesList) && quaternaryRolesList.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quinary Role */}
              {rc_mpp_status.toLowerCase() == 'yes' && (shouldShowRoleField('quinary') || visibleRolesCount >= 5) && (
                <div className="col-12 col-lg-6">
                  <label htmlFor="quinaryRole" className="form-label">Quinary Role</label>
                  <select id="quinaryRole" className="form-select rounded" value={formData.quinary || ''} onChange={(e) => onChange('quinary', e.target.value)}>
                    <option value="">Choose...</option>
                    {Array.isArray(quinaryRolesList) && quinaryRolesList.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* {visibleRolesCount < 5 && (rc_mpp_status.toLowerCase() == 'yes' && visibleRolesCount < 5) || rc_mpp_status.toLowerCase() == 'no' && visibleRolesCount < 3 && (
                (isEdit || isNewAddRole || formData.secondary || formData.tertiary || formData.quaternary || formData.quinary) && (
                  <>
                    <div className="col-12">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleAddMore}
                      >
                        + Add More Role
                      </button>
                    </div>
                  </>
                )
              )} */}

              {visibleRolesCount < 5 &&
                ((rc_mpp_status.toLowerCase() == 'yes' && visibleRolesCount < 5) ||
                  (rc_mpp_status.toLowerCase() == 'no' && visibleRolesCount < 3)) && (
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddMore}
                    >
                      + Add More Role
                    </button>
                  </div>
                )
              }
            </div>

            <button type="button" className="btn btn-primary mt-3" onClick={handleSubmitRole}>
              Submit
            </button>
          </form>
        </div>

        {selectedKraList && selectedKraList.length > 0 ? (
          <div className="col-md-6 col-12">
            <div className="row">
              <div className="col-10"><p className="fw-bold m-0">KRAs</p></div>
              <div className="col-2"><p className="fw-bold m-0 text-center">Wgt</p></div>
            </div>
            <div className="kra-list mt-3">
              {selectedKraList.map((item, index) => (
                <div className="row my-3" key={index}>
                  <div className="col-10"><p className="m-0">{item.KRA_NAME}</p></div>
                  <div className="col-2"><p className="m-0 text-center">{item.KRA_WEIGHT}</p></div>
                </div>
              ))}
            </div>
            <div className="row text-primary mt-2">
              <div className="col-10"><p className="fw-bold m-0">Total</p></div>
              <div className="col-2"><p className="fw-bold m-0 text-center">{totalWeight}</p></div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  </>
  );
};

export default EditRoleLeftSide;
