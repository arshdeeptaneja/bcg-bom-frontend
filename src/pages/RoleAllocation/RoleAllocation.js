import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoleAllocationService from "../../services/roleAllocationService";
import RoleHistory from "../../components/RoleHistory/RoleHistory";
import "./RoleAllocation.css";
import { HiMiniArrowLongLeft } from "react-icons/hi2";
import LoadingSpinner from "../../components/Spinner";
import SideDrawer from "../../components/SideDrawer";
import { showToast } from "../../components/common/ToastMessage";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaClock,
} from "react-icons/fa";
import { FaCircleCheck, FaFlag } from "react-icons/fa6";
import { BsFillPatchExclamationFill } from "react-icons/bs";
import { useAuth } from "../../contexts/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import {
  setStatusCounts,
  triggerDashboardRefresh,
} from "../../features/dashboard/dashboardSlice";
import useDashboardData from "../../hook/useDashboardData";

const RoleAllocation = () => {
  const { fetchDashboardData } = useDashboardData();
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, getEmployeeDetails, getUserProperty, dashboardData } =
    useAuth();
  // const statusCount = useSelector((state) => state.dashboard.status);
  const tabsContainerRef = useRef(null);
  const employeeRefs = useRef({});
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty(
    "empNo",
    employeeDetails.currentUser[0].EMP_ID || ""
  );
  const sol = getUserProperty(
    "sol",
    employeeDetails.currentUser[0].LOCATION || ""
  );
  const unitType = getUserProperty(
    "unitType",
    employeeDetails.currentUser[0].BRANCH_UNIT_TYPE || ""
  );
  const empDsg = getUserProperty(
    "empDsg",
    employeeDetails.currentUser[0].POSITION_DESIGNATION || ""
  );
  const empName = getUserProperty(
    "empDsg",
    employeeDetails.currentUser[0].EMP_NAME || ""
  );
  const userType = getUserProperty(
    "empDsg",
    employeeDetails.currentUser[0].USER_TYPE || ""
  );
  const userId = getUserProperty(
    "empDsg",
    employeeDetails.currentUser[0].USER_ID || ""
  );

  const userName = getUserProperty("name");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [selectedRoles, setSelectedRole] = useState({});
  const [rolesForCombination, setRolesForCombination] = useState({
    roles: [],
    showQuaternary: null,
    showQuinary: null,
    showSecondary: null,
    showTertiary: null,
  });
  const [hideRoleForm, setHideRoleForm] = useState(true);
  const [showRoleHistorySection, setRoleHistorySection] = useState(true);
  const [showKra, setShowKra] = useState(false);
  const [selectedRoleData, setSelectedRoleData] = useState({});
  const [isFetchNewRoleHistory, setIsNewRoleFetchHistory] = useState(false);

  const location = useLocation();
  const { employees, assignmentId } = location.state || {};
  const { currentEmployee } = location.state || {};

  const { EMP_ID, EMPNAME, LOCATION_ID, ASSIGNMENT_ID } = currentEmployee || {};
  const { status } = useSelector((state) => state?.dashboard);
  const { teamMembers } = useSelector((state) => state?.dashboard);

  const { BLACK, GREEN, RED, YELLOW } = status || {};
  const totalMembersCount =
    (BLACK || 0) + (GREEN || 0) + (RED || 0) + (YELLOW || 0);

  const statusIconComponents = {
    GREEN: <FaCircleCheck color="green" size={12} />,
    RED: <BsFillPatchExclamationFill color="#9f1d35" size={12} />,
    YELLOW: <FaFlag color="#f69f29" size={12} />,
    BLACK: <FaCircleCheck color="black" size={12} />,
  };
  const handleBackClick = () => navigate(-1);

  const handleShowRoleHistorySection = () => {
    setRoleHistorySection(true);
    setHideRoleForm(true);
  };

  const handleShowKra = (flag) => {
    setShowKra(flag);
  };
  
  useEffect(() => {
    const getRolesForCombination = async () => {
      try {
        if (!currentEmployee) return;
        const { EMP_ID, LOCATION_ID } = currentEmployee;
        const response = await RoleAllocationService.getRolesForCombination(
          EMP_ID,
          LOCATION_ID,
          // 'BO Retail Credit Officer',
          "none",
          "none",
          "none",
          "none",
          unitType
        );
        if (response) {
          // response expected to contain roles and flags
          const {
            roles,
            showQuaternary,
            showQuinary,
            showSecondary,
            showTertiary,
          } = response;
          setRolesForCombination((prev) => ({
            ...prev,
            roles: roles || [],
            showQuaternary,
            showQuinary,
            showSecondary,
            showTertiary,
          }));
        }
      } catch (error) {
        console.error("getRolesForCombination error", error);
      }
    };

    getRolesForCombination();
  }, [currentEmployee]);

  useEffect(() => {
    setSelectedEmployee(currentEmployee);
    // simulate load flow; actual data fetch for employee history is inside RoleHistory
    setLoading(false);
  }, [currentEmployee]);

  useEffect(() => {
    if (selectedEmployee && tabsContainerRef.current) {
        const selectedEmployeeRef = employeeRefs.current[selectedEmployee.EMP_ID];
        if (selectedEmployeeRef) {
            const container = tabsContainerRef.current;
            const element = selectedEmployeeRef;
            const scrollLeft = 
                element.offsetLeft - 
                (container.offsetWidth / 2) + 
                (element.offsetWidth / 2);
            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }
  }, [selectedEmployee, teamMembers]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setHideRoleForm(true);
  };

  const handleOpenDrawer = (drawerName) => setOpenDrawer(drawerName);
  // const handleSelectedRole = (role) => setSelectedRole(role);
  const handleSelectedRole = (role) => {
    setSelectedRoleData(role);
    setSelectedRole(role);
  };

  const handleDeleteAllocatedRole = async () => {
    const { EMP_NUMBER, URL_ID, EMPNAME, LOCATION_ID, ASSIGNMENT_ID } =
      selectedRoles;
    // console.log(EMP_NUMBER, URL_ID, EMPNAME, LOCATION_ID, ASSIGNMENT_ID  ,'wd02330')
    try {
      const response = await RoleAllocationService.deleteRole(
        EMP_NUMBER,
        URL_ID
      );
      if (response?.success) {

        const { EMP_NUMBER, EMP_NAME, LOCATION_ID } = selectedRoleData || {};
        showToast(
          response?.success
            ? "Role deleted"
            : response?.error || "Delete failed",
          response?.success ? "success" : "error"
        );
        await fetchDashboardData();

        const getHistoryResponse =
          await RoleAllocationService.getEmployeeRoleHistory(
            //  empNo ,empName,sol,assignmentId,userType,userId
            EMP_NUMBER,
            EMP_NAME,
            sol,
            assignmentId,
            userType,
            unitType
          );
        if (getHistoryResponse) {
          setIsNewRoleFetchHistory(true);
        }
      }
      // showToast(response?.success ? 'Role deleted' : (response?.error || 'Delete failed'), response?.success ? 'success' : 'error');
      // optionally refresh - RoleHistory will re-fetch when parent state changes if needed

      setOpenDrawer(null);
    } catch (err) {
      console.error("delete error", err);
      // showToast('Delete failed', 'error');
      setOpenDrawer(null);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="pageWrapper">
      <div>
        <div className="row mb-4">
          <div className="col-12 d-flex align-items-center gap-3">
            <button
              className="back-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm rounded-pill bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark"
              onClick={handleBackClick}
            >
              <HiMiniArrowLongLeft size={20} className="lh-1" />{" "}
              <span className="small fw-semibold">BACK</span>
            </button>
            <h1 className="dashboard-title text-primary fw-bold mb-0">
              Role Allocation
            </h1>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-8 ">
            <div className="employee-tabs d-flex gap-3 flex-nowrap overflow-auto" ref={tabsContainerRef}>
              {teamMembers?.map((employee) => {
                const statusKey = employee.STATUS?.toUpperCase();
                const StatusIcon = statusIconComponents[statusKey];
                console.log(employee, "employeeemployeeemployee")
                return (
                  <div
                    key={employee.id}
                    ref={el => employeeRefs.current[employee.EMP_ID] = el}
                    className={`employee-tab mb-2 ${
                      selectedEmployee &&
                      selectedEmployee.EMP_ID == employee.EMP_ID
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      handleEmployeeSelect(employee);
                      handleShowRoleHistorySection(true);
                      handleShowKra(false);
                    }}
                  >
                    <div
                      className={`employee-avatar status-${employee?.STATUS?.toLowerCase()}`}
                      style={{
                        backgroundColor:
                          employee?.STATUS?.toLowerCase() === "yellow"
                            ? "#f69f29"
                            : employee.STATUS,
                        position: "relative",
                      }}
                    >
                      {employee?.EMPNAME?.charAt(0)}
                      {StatusIcon && (
                        <div
                          className="member-status-flag"
                          style={{
                            position: "absolute",
                            zIndex: 10,
                            right: "-6px",
                          }}
                        >
                          {StatusIcon}
                        </div>
                      )}
                    </div>
                    <div className="employee-info">
                      <div className="employee-name">{employee.EMPNAME}</div>

                      <div className="employee-details">Sol: {sol}</div>
                      <div className="employee-details">
                        Emp No: #{employee.EMP_ID} - Scale:{employee.SCALE}
                      </div>
                      <div className="employee-role">
                        Role: {employee.MAIN_ROLE ? employee.MAIN_ROLE : "Role Not Assigned"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-md-4 align-self-center">
            <div className="allocation-summary gap-3 align-items-center mb-2">
              <div className="total-members align-items-start border-0 mb-0 pb-0">
                <span className="total-number text-primary">
                  {totalMembersCount}
                </span>
                <span className="total-label">Total Members</span>
              </div>
              <div className="allocation-stats">
                <div className="stat-item">
                  <span className="stat-dot">{GREEN || 0}</span>
                  <span className="stat-label">Allocation Completed</span>
                  <span className="stat-dot">
                    <FaCircleCheck color="green" size={14} />
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot">{RED || 0}</span>
                  <span className="stat-label">Yet to be Allocated</span>
                  <span className="stat-dot">
                    <BsFillPatchExclamationFill color="#9f1d35" size={14} />
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot">{YELLOW || 0}</span>
                  <span className="stat-label">Flagged for Discussion</span>
                  <span className="stat-dot">
                    <FaFlag color="#f69f29" size={14} />
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot">{BLACK || 0}</span>
                  <span className="stat-label">Acceptance Pending</span>
                  <span className="stat-dot">
                    <FaCircleCheck color="black" size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedEmployee && (
          <RoleHistory
            employee={selectedEmployee}
            openDrawer={openDrawer}
            handleOpenDrawer={handleOpenDrawer}
            handleSelectedRole={handleSelectedRole}
            selectedRoles={selectedRoles}
            handleDeleteAllocatedRole={handleDeleteAllocatedRole}
            rolesForCombination={rolesForCombination}
            assignmentId={assignmentId}
            branchOfferEmpId={EMP_ID}
            hideRoleForm={hideRoleForm}
            showRoleHistorySection={showRoleHistorySection}
            setRoleHistorySection={setRoleHistorySection}
            showKra={showKra}
            setShowKra={setShowKra}
            selectedEmployee={selectedEmployee}
            isFetchNewRoleHistory={isFetchNewRoleHistory}
          />
        )}
      </div>

      <SideDrawer
        handleOpenDrawer={handleOpenDrawer}
        openDrawer={openDrawer}
        // handleDeleteAllocatedRole={handleDeleteAllocatedRole}
      />
    </div>
  );
};

export default RoleAllocation;
