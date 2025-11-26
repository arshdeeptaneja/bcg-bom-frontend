/**
 * The `TeamMembers` component in React displays team member information, status indicators, and role
 * allocations based on user roles and data provided.
 * @returns The `TeamMembers` component is being returned. It displays information about team members,
 * role allocations, status counts, and allows for interaction with team members based on user roles.
 * The component includes various sections such as role allocator card, total members count, status
 * list, team members list with their details and status indicators, and roles allocated section for
 * specific user roles.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamMembers.css";
import { FaCircle } from "react-icons/fa";
import { FaCircleCheck, FaFlag } from "react-icons/fa6";
import { BsFillPatchExclamationFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import { useAuth } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setStatusCounts } from "../../features/dashboard/dashboardSlice";

const TeamMembers = ({ dashboardData: propDashboardData }) => {
  const [toggleUserRole, setToggleUserRole] = useState(false);
  const [toggleIndex, setToggleIndex] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const statusCount = useSelector((state) => state.dashboard.status);
  // const { teamMembers, statusIcons } = useSelector((state) => state?.dashboard);

  const {
    status: statusCount = {},
    teamMembers = [],
    statusIcons: showStatusIcons,
  } = useSelector((state) => state.dashboard || {});

  const { user, dashboardData, setTeamData, setStatusCount } = useAuth();

  useEffect(() => {
    if (propDashboardData) {
      setTeamData(propDashboardData);
    }
  }, [propDashboardData, setTeamData, dispatch]);

  const data = dashboardData || propDashboardData;

  if (!data) {
    return <div>Loading team data...</div>;
  }

  const roleAllocations = data.myteamlist;
  const { ROLE_NAME } = user || {};

  const statusItems = [
    {
      label: "Allocation Completed",
      count: statusCount.GREEN || 0,
      status: showStatusIcons?.GREEN?.icon,
    },
    {
      label: "Yet to be Allocated",
      count: statusCount.RED || 0,
      status: showStatusIcons?.RED?.icon,
    },
    {
      label: "Flagged for Discussion",
      count: statusCount.YELLOW || 0,
      status: showStatusIcons?.YELLOW?.icon,
    },
    {
      label: "Acceptance Pending",
      count: statusCount.BLACK || 0,
      status: showStatusIcons?.BLACK?.icon,
    },
  ];

  const handleMemberClick = (member, e, index) => {
    if (
      ROLE_NAME &&
      (ROLE_NAME === "Branch Head" ||
        ROLE_NAME === "Zonal Head" ||
        ROLE_NAME === "Vertical Head")
    ) {
      navigate("/rc/role-allocation", {
        state: {
          employees: teamMembers,
          currentEmployee: member,
          statusCount: data.presentcount,
          statusDetailsCount: data.status_count,
          assignmentId: member.ASSIGNMENT_ID,
          memberStatusCount: data.status_count,
        },
      });
    } else {
      e.preventDefault();
      setToggleUserRole(true);
      setToggleIndex(index);
      e.stopPropagation();
    }
  };
  const showRoleAllocated =
    ROLE_NAME && (ROLE_NAME === "Branch Head" || ROLE_NAME === "Zonal Head");
  const showReportingAuthoritySection =
    ROLE_NAME &&
    (ROLE_NAME === "Branch Head" ||
      ROLE_NAME === "Zonal Head" ||
      ROLE_NAME === "Vertical Head");
  const EMP_ID = user[0].EMP_ID;

  const statusIconComponents = {
    GREEN: <FaCircleCheck color="green" size={12} />,
    RED: <BsFillPatchExclamationFill color="#9f1d35" size={12} />,
    YELLOW: <FaFlag color="#f69f29" size={12} />,
    BLACK: <FaCircleCheck color="black" size={12} />,
  };

  console.log(statusCount, "get count from redux");

  return (
    <div className="team-members">
      <div className="role-allocator-card shadow-sm">
        <div className="mb-3">
          <div className="allocator-header">
            <span className="allocator-label">You are a</span>
            <h3 className="m-0">
              {
                ROLE_NAME === "Branch Officer" || ROLE_NAME === "Zonal Head"
                  ? "Role Acceptor"
                  : "Role Allocator"
              }
            </h3>
            <span className="team-info">
              {" "}
              {ROLE_NAME === "Branch Officer" ? "" : "for your team"}
            </span>
          </div>
          <div className="total-members border-0 m-0 py-0">
            <span className="member-count">
              {data?.totalcount ? data?.totalcount : 0}
            </span>
            <span className="member-label">Total Members</span>
          </div>
        </div>
        {!showReportingAuthoritySection ? (
          <div className="flex justify-center align-items-start">
            <div className="allocator-header">
              <strong className="team-info mt-1">
                Reporting authority will be Role Allocator
              </strong>
            </div>
            <div className="total-members border-0 m-0 text-end">
              <strong className="small">
                {data?.REPA_NAME ? data?.REPA_NAME : ""}
              </strong>
              <span className="member-label">
                (Emp No.{" "}
                {data?.REPORTING_AUTHORITY ? data?.REPORTING_AUTHORITY : ""})
              </span>
            </div>
          </div>
        ) : null}
        {showReportingAuthoritySection ? (
          <div className="status-list border-top">
            {statusItems?.map((item, index) => {
              return (
                <>
                  <div key={index} className="status-item">
                    <span className="status-count">{item.count}</span>
                    <span className="status-label">{item.label}</span>
                    <span className={`status-indicator `}>{item.status}</span>
                  </div>
                </>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="team-list shadow-sm">
        <h3 className="sticky-top bg-white p-2 m-0 border-bottom">
          My Team Members
        </h3>
        <div className="team-members-wrapper p-3">
          {teamMembers && teamMembers?.length > 0 ? (
            teamMembers
              ?.filter((item) => item.EMP_ID !== EMP_ID)
              .map((member, index) => {
                const statusKey = member.STATUS?.toUpperCase();
                const StatusIcon = statusIconComponents[statusKey];

                return (
                  <>
                    <div
                      key={member.id}
                      className="member-card"
                      onClick={(e) => handleMemberClick(member, e, index)}
                    >
                      <div
                        className="member-avatar-wrapper"
                        style={{ position: "relative" }}
                      >
                        <div
                          className="member-avatar"
                          style={{
                            backgroundColor:
                              ROLE_NAME == "Branch Officer"
                                ? "#0389d0"
                                : member.STATUS
                                  ? member.STATUS
                                  : "#00000",
                          }}
                          title={member.EMPNAME}
                        >
                          {member.EMPNAME?.charAt(0)}
                        </div>

                        {StatusIcon && (
                          <div className="member-status-flag">{StatusIcon}</div>
                        )}
                      </div>

                      <div className="member-info">
                        <div className="member-name">{member.EMPNAME}</div>
                        <div
                          className={`member-role d-inline-flex gap-2 align-items-center ${toggleUserRole && toggleIndex == index
                              ? "border p-2 bg-light fw-semi-bold"
                              : ""
                            }`}
                        >
                          {toggleUserRole && toggleIndex == index ? (
                            <FaStar size={8} className="text-warning" />
                          ) : null}
                          {member.LAST_ROLE}
                        </div>
                        {toggleUserRole && toggleIndex == index ? (
                          <div className="member-role d-inline-flex gap-2 align-items-center ms-2">
                            {member.FIRST_ROLE &&
                              member.FIRST_ROLE !== "none" && (
                                <>
                                  <FaCircle
                                    size={6}
                                    className="text-black-50"
                                  />
                                  <span className="">{member.FIRST_ROLE}</span>
                                </>
                              )}
                          </div>
                        ) : null}
                      </div>
                      <div className="member-action">
                        <span className="arrow">›</span>
                      </div>
                    </div>
                  </>
                );
              })
          ) : (
            <div className="no-members">No team member</div>
          )}
        </div>
      </div>
      {showRoleAllocated && (
        <div className="roles-allocated shadow-sm">
          <h3>Roles Allocated</h3>
          {roleAllocations && roleAllocations?.length > 0 ? (
            roleAllocations.map((allocation, index) => (
              <div key={index} className="allocation-item">
                <span className="allocation-role">
                  {allocation.PRIMARY_ROLE}
                </span>
                <span className="allocation-count">{allocation.CNT}</span>
              </div>
            ))
          ) : (
            <div className="no-data-found">No role allocations found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
