/**
 * The `RoleClarity` component in React displays user roles with additional details and allows toggling
 * to view role history.
 * @returns The `RoleClarity` component is being returned. It contains JSX elements to display role
 * information based on the `dashboardData` prop passed to it. The component renders the main role
 * details, role start and end dates, role status, and additional roles if present. It also provides a
 * button to toggle and view role history if there are multiple roles available.
 */
import React, { useEffect, useState } from "react";
import "./RoleClarity.css";
import accepted from "../../assets/accepted-check.svg";
import { BsChevronDoubleDown, BsChevronDoubleUp } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";

const RoleClarity = ({ dashboardData }) => {
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const { user, getEmployeeDetails, getUserProperty } = useAuth();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state?.dashboard);

  const { ROLE_NAME } = user || {};

  // Get employee data from AuthContext
  const employeeDetails = getEmployeeDetails();

  const empNo = getUserProperty("empNo", employeeDetails.currentUser[0].EMP_ID);
  const sol = getUserProperty("sol", employeeDetails.currentUser[0].LOCATION);
  const unitType = getUserProperty(
    "unitType",
    employeeDetails.currentUser[0].BRANCH_UNIT_TYPE
  );
  const empDsg = getUserProperty(
    "empDsg",
    employeeDetails.currentUser[0].POSITION_DESIGNATION
  );
  const userName = getUserProperty("name");

  const toggleHistory = (e) => {
    e.stopPropagation();
    setShowHistory(!showHistory);
  };

  function dateConvert(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: "2-digit", month: "short", year: "2-digit" };
    return date
      .toLocaleDateString("en-IN", options)
      .toUpperCase()
      .replace(",", "");
  }

  const handleClickRoleCard = (roleData) => {
    const { URL_ID, ...rest } = roleData;
    const { LOCATION_ID } = rest;
    const encodedURLId = btoa(URL_ID);
    navigate(`/bcg-bom/role-acceptance/get-kra-details/${encodedURLId}`, {
      state: { URL_ID: URL_ID, empNo: empNo },
    });
  };

  //   useEffect(() => {
  //   if (dashboardData?.status_count) {
  //     dispatch(fetchStatus(dashboardData?.status_count));
  //   }
  // }, [dashboardData]);

  const showReportingAuthoritySection =
    ROLE_NAME === "Branch Head" ||
    ROLE_NAME === "Zonal Head" ||
    ROLE_NAME === "Vertical Head";

  const conditionForNewTag =
    !showReportingAuthoritySection &&
    dashboardData?.rolelist[0]?.STATUS !== "green" &&
    dashboardData?.rolelist[0]?.status_text !== "Accepted";

  const role1 = dashboardData?.rolelist[0]?.ADDITIONAL_ROLE_1;
  const role2 = dashboardData?.rolelist[0]?.ADDITIONAL_ROLE_2;
  const role3 = dashboardData?.rolelist[0]?.ADDITIONAL_ROLE_3;

  const shouldDisplayRole = (roleValue) => {
    return roleValue && roleValue.toString().toLowerCase() !== "none";
  };

  // console.log(dashboardData?.rolelist[0].STATUS ,'dashb2oardData')
  // const showReportingAuthoritySection =  ROLE_NAME && (ROLE_NAME === 'Branch Head' || ROLE_NAME === 'Zonal Head' || ROLE_NAME === 'Vertical Head' );
  // const conditionForNewTag =  (dashboardData?.rolelist[0].STATUS !== 'green' || dashboardData?.rolelist[0].status_text  !== 'Accepted') && !showReportingAuthoritySection ? true: false
  return (
    <div className="role-clarity bg-white shadow-sm mb-0">
      <h2 className="text-primary mb-0">My Roles</h2>
      <div
        className="role-card px-2 pb-0 position-relative"
        onClick={() => handleClickRoleCard(dashboardData?.rolelist[0])}
      >
        {conditionForNewTag ? (
          <span className="role-status-ribbon px-3 rejected">New</span>
        ) : (
          ""
        )}
        <div className="role-header">
          <div className="role-info">
            <div className="role-title">
              <span className="role-label">Main Role</span>
              <h3>{dashboardData?.rolelist[0]?.MAIN_ROLE}</h3>
            </div>
            <div className="role-details">
              <span className="scale">
                Scale {dashboardData?.rolelist[0]?.SCALE}
              </span>
              <span className="unit">
                Unit - {dashboardData?.rolelist[0]?.USERTYPE}
              </span>
            </div>
            <div className="role-details mt-3">
              {shouldDisplayRole(role1) && (
                <span className="unit">{role1}</span>
              )}
              {shouldDisplayRole(role2) && (
                <span className="unit">{role2}</span>
              )}
              {shouldDisplayRole(role3) && (
                <span className="unit">{role3}</span>
              )}
            </div>
          </div>
          <div className="role-duration position-relative">
            <div className="role-start">
              <div className="role-heading">
                Start Date
              </div>
              <p className="timestamp" id="start_date">
                {dateConvert(dashboardData?.rolelist[0]?.ROLE_START_DATE)}
              </p>
            </div>
            <div className="role-status ">
              <span></span>
              {dashboardData?.rolelist[0]?.STATUS == null ? (
                <p style={{ color: "#9f1d35" }}>Pending</p>
              ) : (
                dashboardData?.rolelist[0]?.STATUS
              )}

              <img src={accepted} />
              <span></span>
            </div>
            <div className="role-end">
              <div className="role-heading">
                End Date
              </div>
              <p
                className="timestamp"
                id="end_date"
                style={{ marginLeft: "10px" }}
              >
                Till Present{" "}
              </p>
            </div>
          </div>
        </div>
        {showHistory && (
          <div className="role-history overflow-hidden px-2 border-0">
            {dashboardData?.rolelist.map(
              (role, index) =>
                index > 0 && (
                  <div
                    key={role.id}
                    className="history-role-card px-0"
                    onClick={() => handleClickRoleCard(role)}
                  >
                    <div className="role-header">
                      <div className="role-info">
                        <div className="role-title">
                          <span className="role-label">{role?.MAIN_ROLE}</span>
                          <h3>{role.title}</h3>
                        </div>
                        <div className="role-details">
                          <span className="scale">Scale {role?.SCALE}</span>
                          <span className="unit">Unit -{role.USERTYPE}</span>
                        </div>
                      </div>

                      <div className="role-duration">
                        <div className="role-start">
                          <p className="timestamp" id="start_date">
                            {dateConvert(role?.ROLE_START_DATE)}
                          </p>
                        </div>
                        <div className="role-status ">
                          <span></span>
                          <p>{role.STATUS}</p>
                          <img src={accepted} />
                          <span></span>
                        </div>
                        <div className="role-end">
                          <p className="timestamp" id="end_date">
                            {dateConvert(role.ROLE_END_DATE)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        )}
        {dashboardData?.rolelist && dashboardData?.rolelist.length > 1 ? (
          <div className="role-actions d-flex align-items-center w-100">
            <button
              className="btn btn-transparent mx-auto d-inline-flex gap-2 align-items-center text-primary fw-bold"
              onClick={(e) => toggleHistory(e)}
            >
              {showHistory ? "Hide" : "View Role History"}
              {showHistory ? (
                <BsChevronDoubleUp size={16} />
              ) : (
                <BsChevronDoubleDown size={16} />
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RoleClarity;
