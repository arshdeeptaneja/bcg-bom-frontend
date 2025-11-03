import React, { useCallback, useEffect, useRef, useState } from "react";
import "./RoleHistory.css";
import EditRoleLeftSide from "../EditRoleLeftSection";
import roleAllocationService from "../../services/roleAllocationService";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../common/ToastMessage";
import SideDrawer from "../SideDrawer";
import useDashboardData from "../../hook/useDashboardData";
import RoleAcceptanceService from "../../services/roleAcceptanceService";

const RoleHistory = ({
  employee,
  openDrawer,
  handleOpenDrawer,
  handleSelectedRole,
  onDeleteRole,
  rolesForCombination = {},
  assignmentId,
  branchOfferEmpId,
  showRoleHistorySection,
  setRoleHistorySection,
  setShowKra,
  showKra,
  selectedEmployee,
  selectedRoles,
  handleDeleteAllocatedRole,
  isFetchNewRoleHistory,
}) => {
  // initial constants and states
  const navigate = useNavigate();
  const respondClickedRef = useRef(false);
  const { user, getEmployeeDetails, getUserProperty } = useAuth();
  const { fetchDashboardData } = useDashboardData();
  // Get employee data from AuthContext
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty("empNo", employeeDetails.currentUser[0].EMP_ID);
  const sol = getUserProperty("sol", employeeDetails.currentUser[0].LOCATION);
  const unitType = getUserProperty(
    "unitType",
    employeeDetails.currentUser[0].BRANCH_UNIT_TYPE
  );
  const userType = getUserProperty(
    "userType",
    employeeDetails.currentUser[0].USER_TYPE
  );
  const empDsg = getUserProperty(
    "empDsg",
    employeeDetails.currentUser[0].POSITION_DESIGNATION
  );
  const URL_ID = getUserProperty(
    "URL_ID",
    employeeDetails.currentUser[0].URL_ID
  );
  const userName = getUserProperty("name");
  const location = useLocation();

  const getTodayCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const initialFormData = {
    name: "",
    urlId: "",
    unitType: unitType,
    userType: userType,
    vertical: "",
    primary: "",
    secondary: "",
    tertiary: "",
    quaternary: "",
    quinary: "",
    enddate: "",
    level: "",
    startDate: getTodayCurrentDate(),
    rc_mpp_status: "",
    org_name: "",
    empSol: "",
    assigstartdate: "",
    status_text: "",
    status_val: "",
    solId: "",
    empNo: "",
    roleCode: "",
    roles: [],
    // assignmentId: assignmentId || ''
    assignmentId: employee.ASSIGNMENT_ID || assignmentId,
  };

  const [employeeHistory, setEmployeeHistory] = useState({});
  const [kraList, setKraList] = useState([]);
  const [totalWgt, setTotalWght] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showKraList, setShowKraList] = useState([]);
  const [showTotalKraWght, setShowTotalKraWght] = useState("");

  // form related states
  const [formData, setFormData] = useState(initialFormData);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [isNewAddRole, setIsAddNewRole] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [SelectedRolesData, setSelectedRolesData] = useState({});
  const [responseReason, setResponseReason] = useState("");
  const [respondComment, setRespondComment] = useState("");
  const [discussionComment, setDiscussionComment] = useState("");
  const [memoizedComment, setmemoizedComment] = useState("");
  const [selectedRoleData, setSelectedRoleData] = useState({});
  const [rolesForCombinationState, setRolesForCombinationState] = useState({
    roles: [],
    showQuaternary: false,
    showQuinary: false,
    showSecondary: false,
    showTertiary: false,
  });
  const { employees } = location.state;

  // helper states
  const [verticalSelectedRole, setVerticalSelectedRole] = useState("");
  const [primarySelectedRole, setPrimarySelectedRole] = useState("");
  const [secondarySelectedRole, setSecondarySelectedRole] = useState("");
  const [tertiarySelectedRole, setTertiarySelectedRole] = useState("");
  const [quaternarySelectedRole, setQuaternarySelectedRole] = useState("");
  const [quinarySelectedRole, setQuinarySelectedRole] = useState("");
  const [selectedURLId, setSelectedUrlId] = useState("");
  const [selectedSolId, setSelectedSolId] = useState("");
  const [organisation, setOraganisation] = useState("");
  const [roleHistoryAssignmentId, setRoleListAsssignmentId] = useState(
    assignmentId || ""
  );
  const [userId, setUserId] = useState("");
  const [branchNum, setBranchNo] = useState("");
  const [branchOfficerEmpId, setBranchOfficerEmpId] = useState(
    branchOfferEmpId || ""
  );
  const [ecNo, setecNo] = useState(null);
  const [openRespondDrawer, setOpenRespondDrawer] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [hasUserDismissedEmptyRoleForm, setHasUserDismissedEmptyRoleForm] =
    useState(false);

  useEffect(() => {
    setRolesForCombinationState(rolesForCombination);
  }, [rolesForCombination]);

  useEffect(() => {
    setSelectedAssignmentId(employee.ASSIGNMENT_ID);
  }, [employee.ASSIGNMENT_ID]);

  useEffect(() => {
    setSelectedRoleData(selectedRoles);
  }, [selectedRoles]);

  useEffect(() => {
    if (showRoleHistorySection) {
      setShowRoleForm(false);
      setIsAddNewRole(false);
      setIsEdit(false);
      setShowKra(false);
    }
  }, [showRoleHistorySection]);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userData") || "null");
    const mainData = userDetails?.[0];
    if (mainData?.EMP_ID) {
      setUserId(mainData.EMP_ID);
    }
    if (mainData?.RH_EMP_NUMBER) {
      setBranchNo(mainData?.RH_EMP_NUMBER);
    }
  }, []);

  // fetch role history for this employee
  useEffect(() => {
    if (employee?.EMP_ID || isFetchNewRoleHistory) fetchRoleHistory();
  }, [employee, isFetchNewRoleHistory]);

  const fetchRoleHistory = async () => {
    try {
      const data = await roleAllocationService.getEmployeeRoleHistory(
        employee.EMP_ID,
        employee.EMPNAME,
        employee.LOCATION_ID,
        employee.ASSIGNMENT_ID,
        userType,
        unitType
      );
      setEmployeeHistory(data || {});
    } catch (err) {
      console.error("Dashboard API Error:", err);
    }
  };

  const handleCloseEditForm = () => {
    setShowRoleForm(false);
    // showRoleHistorySection(true);
    setIsEdit(false);
    setRoleHistorySection(true);
    setHasUserDismissedEmptyRoleForm(true);
  };

  // format helpers
  const formatDateYYYYMMDD = (dateValue) => {
    if (!dateValue) return "";
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj)) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatingDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- UI helpers ---
  function dateConvert(dateStr) {
    // if (!dateStr || dateStr === "null") return "Present";
    // const date = new Date(dateStr);
    // if (isNaN(date)) return "";
    // const options = { day: "2-digit", month: "short", year: "2-digit" };
    // return date.toLocaleDateString("en-IN", options).toUpperCase();

    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function getMonths(startDate, endDate) {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    if (end.getDate() < start.getDate()) {
      months--;
    }

    return months;
  }

  // prepare filtered role arrays from rolesForCombination
  const getFilteredRoles = (exclude = []) => {
    const allRoles = Array.isArray(rolesForCombination?.roles)
      ? rolesForCombination.roles
      : [];
    return allRoles.filter((role) => !exclude.includes(role));
  };
  // ----- Add New Role (reset the form) -----
  const handleShowRoleForm = () => {
    setShowRoleForm(true);
    setIsAddNewRole(true);
    setIsEdit(false);
    setSelectedRolesData({});
    setSelectedUrlId("");
    setSelectedSolId("");
    setOraganisation("");
    setVerticalSelectedRole("");
    setPrimarySelectedRole("");
    setSecondarySelectedRole("");
    setTertiarySelectedRole("");
    setQuaternarySelectedRole("");
    setQuinarySelectedRole("");
    setKraList([]);
    setTotalWght(0);
    setRoleHistorySection(false);

    setFormData((prev) => ({
      ...initialFormData,
      assignmentId: roleHistoryAssignmentId || assignmentId || "",
      name: employee?.EMPNAME || "",
      empNo: employee?.EMP_NUMBER || "",
      empSol: employee?.LOCATION_ID || "",
      org_name: employee?.ORGANISATION || "",
    }));
  };

  // ----- Edit Role (prefill the form with existing role values) -----
  const handleEdit = (role) => {
    console.log(role, "role data")
    // 1. Update component visibility and flags
    setSelectedRolesData(role || {});
    setIsEdit(true);
    setIsAddNewRole(false);
    setShowRoleForm(true);
    setSelectedUrlId(role?.URL_ID || "");
    setSelectedSolId(role?.LOCATION_ID || "");
    setOraganisation(role?.ORGANISATION || "");
    setecNo(role?.EMP_NUMBER || "");
    setShowKraList([]);
    setRoleHistorySection(false);

    // Helper to clean up "none" values and return empty string if null/none
    const getRoleValue = (roleData) =>
      (roleData && roleData.toLowerCase() !== "none") ? roleData.trim() : "";

    // 2. Prepare the Initial Form Data object (this is synchronous and safe)
    const initialFormData = {
      name: role?.EMP_NAME || employee?.EMPNAME || "",
      urlId: role?.URL_ID || "",
      unitType: unitType,
      userType: userType,

      // Populate role fields with historical data
      vertical: getRoleValue(role?.VERTICAL_ROLE),
      primary: getRoleValue(role?.PRIMARY_ROLE),
      secondary: getRoleValue(role?.SECONDARY_ROLE),
      tertiary: getRoleValue(role?.TERTIARY_ROLE),
      quaternary: getRoleValue(role?.QUATERNARY_ROLE),
      quinary: getRoleValue(role?.QUINARY_ROLE),

      // Populate date and other fields
      enddate: role?.ROLE_END_DATE ? formatDateYYYYMMDD(role.ROLE_END_DATE) : "",
      level: null,
      startDate: role?.ROLE_START_DATE ? formatDateYYYYMMDD(role.ROLE_START_DATE) : "",
      rc_mpp_status: "",
      org_name: role?.ORGANISATION || employee?.ORGANISATION || "",
      empSol: role?.LOCATION_ID || employee?.LOCATION_ID || "",
      assigstartdate: role?.ROLE_START_DATE ? formatDateYYYYMMDD(role.ROLE_START_DATE) : "",
      status_text: role?.STATUS || "",
      status_val: "",
      solId: role?.LOCATION_ID || "",
      empNo: role?.EMP_NUMBER || employee?.EMP_NUMBER || "",
      roleCode: role?.ROLE_CODE || "",
      roles: [],
      assignmentId: role?.ASSIGNMENT_ID || assignmentId || "",
    };

    // 3. Set formData and individual selected states
    setFormData(initialFormData);
    setVerticalSelectedRole(initialFormData.vertical);
    setPrimarySelectedRole(initialFormData.primary);
    setSecondarySelectedRole(initialFormData.secondary);
    setTertiarySelectedRole(initialFormData.tertiary);
    setQuaternarySelectedRole(initialFormData.quaternary);
    setQuinarySelectedRole(initialFormData.quinary);

    // 4. Fetch dynamic data (KRA and Role Combination)
    (async () => {
      try {
        setLoading(true);

        // Payload for both API calls, based on the historical data
        const apiPayload = {
          // Ensure the payload structure is complete for both APIs
          ...initialFormData,
          // The API needs to know the userType and unitType
          userType: userType,
          unitType: unitType,
        };

        const kraResponse = await roleAllocationService.getNewEmpKraData(apiPayload);
        if (kraResponse) {
          setKraList(kraResponse.kraList || []);
          setTotalWght(kraResponse.totalWeight || 0);
        }
        const combinationResponse = await roleAllocationService.getRolesForCombination(
          employee?.EMP_ID,
          employee?.LOCATION_ID,
          apiPayload.vertical,
          apiPayload.primary,
          apiPayload.secondary,
          apiPayload.tertiary,
          apiPayload.unitType
        );
        if (combinationResponse) {
          const { roles, showQuaternary, showQuinary, showSecondary, showTertiary } = combinationResponse;
          setRolesForCombinationState((prev) => ({
            ...prev,
            roles: roles || [],
            showQuaternary,
            showQuinary,
            showSecondary,
            showTertiary,
          }));
        }

      } catch (err) {
        console.error("Fetch error during handleEdit:", err);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleChangeRespond = (type, value) => {
    //  const [responseReason,setResponseReason] = useState('');
    // const [respondComment,setRespondComment] = useState('')
    if (type == "conclusionReason") {
      setResponseReason(value);
    } else if (type == "respondComment") {
      setRespondComment(value);
    }
  };
  //   Handle Submit Respond
  const handleSubmitRespond = async (e) => {
    e.preventDefault();
    if (!responseReason || responseReason === '') {
      showToast('Please select a Conclusion (Yes or No) before submitting.', 'error');
      return;
    }

    try {
      const resp = await roleAllocationService.submitRespond({
        urlId: (selectedRoleData && selectedRoleData?.URL_ID) || "",
        submit_type: "notaccepted",
        p_discussion: responseReason,
        comment: respondComment,
      });
      if (resp) {
        await roleAllocationService.getEmployeeRoleHistory(
          employee.EMP_ID,
          employee.EMPNAME,
          employee.LOCATION_ID,
          employee.ASSIGNMENT_ID,
          userType,
          unitType
        );
        showToast("Response recorded successfully", "success");
        await fetchRoleHistory();
        await fetchDashboardData();
        handleOpenDrawer(null);
        setLoading(true);
      }
    } catch (err) {
      console.error(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleOpenRespondDrawer = (drawerName) => {
    setOpenRespondDrawer(drawerName);
  };

  // ----- handle change from child dropdowns -----
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const allPossibleRoles = Array.isArray(rolesForCombination?.roles)
    ? rolesForCombination.roles
    : [];

  const handleChange = async (field, value) => {
    // 1. Prepare the updated form data immediately and locally.
    const updatedFormData = { ...formData, [field]: value };

    // --- Synchronous State Updates (Batching Renders) ---
    // Update the main form data state (triggers one re-render)
    setFormData(updatedFormData);
    // Update the specific 'selected role' state variables (triggers separate re-renders, 
    // but we keep them since they are used outside the form component)
    if (field === "vertical") setVerticalSelectedRole(value);
    if (field === "primary") setPrimarySelectedRole(value);
    if (field === "secondary") setSecondarySelectedRole(value);
    if (field === "tertiary") setTertiarySelectedRole(value);
    if (field === "quaternary") setQuaternarySelectedRole(value);
    if (field === "quinary") setQuinarySelectedRole(value);

    // 2. Prepare the full payload for the API calls.
    let newPayload = {
      name: updatedFormData.name || employee?.EMPNAME || "",
      urlId: updatedFormData.urlId || selectedURLId || "",
      unitType: updatedFormData.unitType || unitType,
      userType: updatedFormData.userType || userType,
      vertical: updatedFormData.vertical || "",
      primary: updatedFormData.primary || "",
      secondary: updatedFormData.secondary || "",
      tertiary: updatedFormData.tertiary || "",
      quaternary: updatedFormData.quaternary || "",
      quinary: updatedFormData.quinary || "",
      enddate: updatedFormData.enddate || "",
      level: updatedFormData.level || "",
      startDate: updatedFormData.startDate || getTodayDate(),
      rc_mpp_status: updatedFormData.rc_mpp_status || "",
      org_name: updatedFormData.org_name || employee?.ORGANISATION || organisation || "",
      empSol: updatedFormData.empSol || employee?.LOCATION_ID || selectedSolId || "",
      assigstartdate: updatedFormData.assigstartdate || updatedFormData.startDate || "",
      status_text: updatedFormData.status_text || "",
      status_val: updatedFormData.status_val || "",
      solId: updatedFormData.solId || employee?.LOCATION_ID || selectedSolId || "",
      empNo: updatedFormData.empNo || employee?.EMP_NUMBER || branchOfficerEmpId || ecNo || "",
      roleCode: updatedFormData.roleCode || "",
      assignmentId: updatedFormData.assignmentId || assignmentId || roleHistoryAssignmentId || "",
    };

    // 3. Handle Asynchronous API Calls and subsequent state updates.
    if (field !== "startDate") {
      try {
        // --- KRA Data Fetch ---
        const kraResponse = await roleAllocationService.getNewEmpKraData(newPayload);

        if (kraResponse) {
          console.log('get KRA data');
          // Batch KRA state updates together
          setKraList(kraResponse.kraList || []);
          setTotalWght(kraResponse.totalWeight || 0);
          // Optionally clear UI lists/weights immediately before setting new ones
          // setShowKraList([]); 
          // setShowTotalKraWght(""); 
        }

        // --- Roles Combination Data Fetch ---
        const combinationResponse = await roleAllocationService.getRolesForCombination(
          employee?.EMP_ID,
          employee?.LOCATION_ID,
          newPayload.vertical,
          newPayload.primary,
          newPayload.secondary,
          newPayload.tertiary,
          newPayload.unitType
        );

        if (combinationResponse) {
          console.log(combinationResponse, 'get Combination data');
          // Batch Combination state updates together
          setRolesForCombinationState((prev) => ({
            ...prev,
            roles: combinationResponse.roles || [],
            showQuaternary: combinationResponse.showQuaternary,
            showQuinary: combinationResponse.showQuinary,
            showSecondary: combinationResponse.showSecondary,
            showTertiary: combinationResponse.showTertiary,
          }));
        }
      } catch (error) {
        console.error("Error fetching data (KRA or Combination):", error);
      }
    }
  };
console.log(formData, "formDataformData")

  // ----- Submit payload builder & API call -----
  const handleSubmitRole = async () => {
    try {
      setLoading(true);

      const payload = {
        empNo: employee?.EMP_ID || formData.empNo || branchOfficerEmpId || "",
        empSol: selectedSolId || formData.empSol || employee?.LOCATION_ID || "",
        currentFy: "",
        ecno: ecNo || employee?.EMP_NUMBER,
        roleno: "",
        bhecNum: branchNum || "",
        urlId: formData.urlId || selectedURLId || "",
        organization: formData.org_name || organisation || "",
        verticalRole: formData.vertical || "",
        primaryRole: formData.primary || "",
        secondaryRole: formData.secondary || "none",
        tertiaryRole: formData.tertiary || "none",
        quaternaryRole: formData.quaternary || "",
        quinaryRole: formData.quinary || "",
        startDate: formatingDate(formData.startDate) || getTodayDate(),
        endDate: formData.enddate ? formatingDate(formData.enddate) : "",
        tempRoleCode: formData.roleCode || "",
        deputationSolIds: formData.deputationSolIds || [],
        assignmentId:
          selectedAssignmentId || roleHistoryAssignmentId || assignmentId || "",
        empName: employee?.EMPNAME || formData.name || "",
        locationId: employee?.LOCATION_ID || "",
        userType: userType,
        unitType: unitType,
      };

      const response = await roleAllocationService.submitRoleData(payload);

      if (response && (response.success || response.status === "success")) {
        showToast("Role submitted successfully", "success");
        await fetchRoleHistory();
        await fetchDashboardData();
        setShowRoleForm(false);
        setIsEdit(false);
        setIsAddNewRole(false);
        setKraList([]);
        setRoleHistorySection(true);
      } else {
        showToast(response?.message || "Submission failed", "error");
      }
    } catch (error) {
      console.error("Error submitting role:", error);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const baseAvailableRoles = rolesForCombinationState.roles || [];
  const primaryRolesList = baseAvailableRoles;
  const secondaryRolesList = baseAvailableRoles.filter(
    (role) => role !== verticalSelectedRole && role !== primarySelectedRole
  );

  // let secondaryRolesList = [...baseAvailableRoles];

  if (verticalSelectedRole && !secondaryRolesList.includes(verticalSelectedRole)) {
    secondaryRolesList.unshift(verticalSelectedRole);
  }
  if (primarySelectedRole && !secondaryRolesList.includes(primarySelectedRole)) {
    secondaryRolesList.unshift(primarySelectedRole);
  }


  // 3. Tertiary Role List: Base list + Vertical, Primary, and Secondary roles
  let tertiaryRolesList = [...baseAvailableRoles];
  if (verticalSelectedRole && !tertiaryRolesList.includes(verticalSelectedRole)) {
    tertiaryRolesList.unshift(verticalSelectedRole);
  }
  if (primarySelectedRole && !tertiaryRolesList.includes(primarySelectedRole)) {
    tertiaryRolesList.unshift(primarySelectedRole);
  }
  if (secondarySelectedRole && !tertiaryRolesList.includes(secondarySelectedRole)) {
    tertiaryRolesList.unshift(secondarySelectedRole);
  }


  // 4. Quaternary Role List: Base list + Vertical, Primary, Secondary, and Tertiary roles
  let quaternaryRolesList = [...baseAvailableRoles];
  if (verticalSelectedRole && !quaternaryRolesList.includes(verticalSelectedRole)) {
    quaternaryRolesList.unshift(verticalSelectedRole);
  }
  if (primarySelectedRole && !quaternaryRolesList.includes(primarySelectedRole)) {
    quaternaryRolesList.unshift(primarySelectedRole);
  }
  if (secondarySelectedRole && !quaternaryRolesList.includes(secondarySelectedRole)) {
    quaternaryRolesList.unshift(secondarySelectedRole);
  }
  if (tertiarySelectedRole && !quaternaryRolesList.includes(tertiarySelectedRole)) {
    quaternaryRolesList.unshift(tertiarySelectedRole);
  }


  // 5. Quinary Role List: Base list + Vertical, Primary, Secondary, Tertiary, and Quaternary roles
  let quinaryRolesList = [...baseAvailableRoles];
  if (verticalSelectedRole && !quinaryRolesList.includes(verticalSelectedRole)) {
    quinaryRolesList.unshift(verticalSelectedRole);
  }
  if (primarySelectedRole && !quinaryRolesList.includes(primarySelectedRole)) {
    quinaryRolesList.unshift(primarySelectedRole);
  }
  if (secondarySelectedRole && !quinaryRolesList.includes(secondarySelectedRole)) {
    quinaryRolesList.unshift(secondarySelectedRole);
  }
  if (tertiarySelectedRole && !quinaryRolesList.includes(tertiarySelectedRole)) {
    quinaryRolesList.unshift(tertiarySelectedRole);
  }
  if (quaternarySelectedRole && !quinaryRolesList.includes(quaternarySelectedRole)) {
    quinaryRolesList.unshift(quaternarySelectedRole);
  }

  const addNewRole = (e) => {
    e.preventDefault();
    if (employee?.STATUS === "black" || employee?.STATUS == "yellow") {
      showToast(
        "Add new role would function post the acceptance of previously allocated role.",
        "error"
      );
      return;
    }
    handleShowRoleForm();
  };

  const getStatusDisplay = (employeeItem, roleItem) => {
    // First, get the status from employeeItem or roleItem
    const status = employeeItem?.STATUS || roleItem?.STATUS || "";
    const statusLower = String(status).toLowerCase();

    switch (true) {
      case statusLower === "black":
        return (
          <span className="role-status-ribbon px-2 pending bg-dark text-white">
            Acceptance Pending
          </span>
        );

      case statusLower.includes("rejected"):
        return (
          <span className="role-status-ribbon px-3 rejected bg-danger text-white">
            Rejected
          </span>
        );

      case statusLower.includes("accepted"):
        return (
          <span className="role-status-ribbon px-3 accepted bg-success text-dark">
            Accepted
          </span>
        );

      case statusLower.includes("discussion") ||
        statusLower.includes("flagged"):
        return (
          <span className="role-status-ribbon px-3 flagged bg-warning text-white">
            Flagged For Discussion
          </span>
        );

      default:
        return (
          <span className="role-status-ribbon px-3 pending bg-secondary text-white">
            Pending
          </span>
        );
    }
  };

  const { empRoles } = employeeHistory || {};
  const { roledata } = empRoles || {};

  const handleRespondClick = useCallback(async (role) => {
    respondClickedRef.current = true;
    try {
      const resp = await RoleAcceptanceService.getDiscussionComment(role?.URL_ID);
      if (resp?.discussionComment) {
        setDiscussionComment(resp.discussionComment);
      }
    } catch (error) {
      console.error("Error fetching discussion comment:", error);
    }
  }, []);



  useEffect(() => {
    if (!respondClickedRef.current) return;
    setmemoizedComment(discussionComment)
  }, [respondClickedRef.current, discussionComment]);

  const getValidStatusColor = (color) => {
    if (!color) return "#000"; // fallback for null/undefined
    // valid 3, 4, 6, or 8-digit hex
    if (
      /^#[0-9A-Fa-f]{3,4}$/.test(color) ||
      /^#[0-9A-Fa-f]{6,8}$/.test(color)
    ) {
      return color;
    }
    // if starts with '#' but invalid — fallback to pure black
    if (color.startsWith("#")) {
      return "#000000";
    }
    // otherwise fallback neutral
    return "#000";
  };

  const isAnyRolePending = employeeHistory?.empRoles?.roledata?.some(
    (role) => role.STATUS === "Acceptance Pending" || role.STATUS === null
  );
  console.log(employeeHistory, "employeeHistoryemployeeHistory")
  return (
    <div className="role-history-container">
      <div className="role-history-header">
        <div className="header-left">
          <h4 className="mb-1">
            Roles performed by <strong>{employee?.EMPNAME}</strong> in{" "}
            <strong>{employee?.ORGANIZATION_NAME}</strong> since{" "}
            {/* {dateConvert(employee?.START_DATE)} */}
            {/* {employee?.START_DATE} */}
            {dateConvert(employeeHistory?.empRoles?.EFFECTIVE_START_DATE)}
          </h4>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          {roledata?.length !== 0 && (
            <div className="col-md-5 col-12">
              {showRoleHistorySection && (
                <div className="role-history-content">
                  <div className="section-header d-flex justify-content-between align-items-center">
                    <h5 className="section-title">Role History</h5>
                    {!showRoleForm && !isAnyRolePending ? (
                      <a
                        href="#"
                        className="add-new-role-btn"
                        onClick={addNewRole}
                      >
                        Add New Role+
                      </a>
                    ) : null}
                  </div>
                  {!showRoleForm ? (
                    <div className="timeline-container">
                      {employeeHistory?.empRoles?.roledata?.map(
                        (role, index) => {
                          console.log(role, "employeeHistoryemployeeHistory");
                          const determinedVerticalRole = role.VERTICAL_ROLE || role.PRIMARY_ROLE;
                          const effectiveStartDate = employeeHistory?.empRoles?.EFFECTIVE_START_DATE;
                          console.log(effectiveStartDate, "effectiveStartDateeffectiveStartDateeffectiveStartDate")
                          return (
                            <div key={index} className="timeline-item">
                              <div className="timeline-content">
                                <div className="role-card-collection">
                                  <ul className="role-list">
                                    <li className="role-card accepted active">
                                      <div className="card-title-wrapper">
                                        <h2 className="card-title">
                                          {role?.PRIMARY_ROLE}
                                        </h2>
                                        <span
                                          className={`role-status-ribbon px-2`}
                                          style={{
                                            backgroundColor: getValidStatusColor(
                                              role?.status_class
                                            ),
                                          }}
                                        >
                                          {role.STATUS == null || role.STATUS === "Acceptance Pending"
                                            ? "Acceptance Pending"
                                            : role.STATUS}
                                        </span>
                                      </div>
                                      <section className="assigned-roles">
                                        <div className="exp-heading">
                                          Additional Roles
                                        </div>
                                        <div className="exp-chain-view">
                                          <p className="role-title">
                                            {role.SECONDARY_ROLE}
                                          </p>
                                          <p className="role-title">
                                            {role.TERTIARY_ROLE}
                                          </p>
{role.QUATERNARY_ROLE !== "None" && (
  <p className="role-title">
    {role.QUATERNARY_ROLE}
  </p>
)}

{role.QUINARY_ROLE !== "None" && (
  <p className="role-title">
    {role.QUINARY_ROLE}
  </p>
)}
                                        </div>
                                      </section>
                                      <div className="role-duration">
                                        <div className="role-start">
                                          <div className="role-heading">
                                            Start Date
                                          </div>
                                          <p className="timestamp">
                                            {formatDateToDDMMYYYY(
                                              effectiveStartDate
                                            )}
                                          </p>
                                        </div>
                                        <div className="total-duration flex-shrink-0">
                                          <span></span>
                                          <center>
                                            {getMonths(
                                              role.ROLE_START_DATE,
                                              role.ROLE_END_DATE
                                            )}{" "}
                                            Months
                                          </center>
                                          <span></span>
                                        </div>
                                        <div className="role-end">
                                          <div className="role-heading">
                                            End Date
                                          </div>
                                          <p className="timestamp">
                                            {formatDateToDDMMYYYY(
                                              role.ROLE_END_DATE
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      <ul className="role-footer">
                                        <li>
                                          <button
                                            className="btn btn-show show-kra-btn"
                                            onClick={async () => {
                                              setLoading(true);
                                              setShowKra(true);
                                              try {
                                                const resp =
                                                  await roleAllocationService.getNewEmpKraData(
                                                    {
                                                      name:
                                                        role?.EMP_NAME ||
                                                        employee?.EMPNAME ||
                                                        "",
                                                      urlId: role?.URL_ID || "",
                                                      vertical:
                                                        role?.VERTICAL_ROLE &&
                                                          role.VERTICAL_ROLE.toLowerCase() !==
                                                          "none"
                                                          ? role.VERTICAL_ROLE
                                                          : "",
                                                      primary:
                                                        role?.PRIMARY_ROLE &&
                                                          role.PRIMARY_ROLE.toLowerCase() !==
                                                          "none"
                                                          ? role.PRIMARY_ROLE
                                                          : "",
                                                      secondary:
                                                        role?.SECONDARY_ROLE &&
                                                          role.SECONDARY_ROLE.toLowerCase() !==
                                                          "none"
                                                          ? role.SECONDARY_ROLE
                                                          : "",
                                                      tertiary:
                                                        role?.TERTIARY_ROLE &&
                                                          role.TERTIARY_ROLE.toLowerCase() !==
                                                          "none"
                                                          ? role.TERTIARY_ROLE
                                                          : "",
                                                      quaternary:
                                                        role?.QUATERNARY_ROLE &&
                                                          role.QUATERNARY_ROLE.toLowerCase() !==
                                                          "none"
                                                          ? role.QUATERNARY_ROLE
                                                          : "",
                                                      quinary:
                                                        role?.QUINARY_ROLE &&
                                                          role.QUINARY_ROLE.toLowerCase() !==
                                                          "none"
                                                          ? role.QUINARY_ROLE
                                                          : "",
                                                      enddate:
                                                        role?.ROLE_END_DATE
                                                          ? formatDateYYYYMMDD(
                                                            role.ROLE_END_DATE
                                                          )
                                                          : "",
                                                      level: null,
                                                      startDate:
                                                        role?.ROLE_START_DATE
                                                          ? formatDateYYYYMMDD(
                                                            role.ROLE_START_DATE
                                                          )
                                                          : "",
                                                      rc_mpp_status: "",
                                                      org_name:
                                                        role?.ORGANISATION ||
                                                        employee?.ORGANISATION ||
                                                        "",
                                                      empSol:
                                                        role?.LOCATION_ID ||
                                                        employee?.LOCATION_ID ||
                                                        "",
                                                      assigstartdate:
                                                        role?.ROLE_START_DATE
                                                          ? formatDateYYYYMMDD(
                                                            role.ROLE_START_DATE
                                                          )
                                                          : "",
                                                      status_text:
                                                        role?.STATUS || "",
                                                      status_val: "",
                                                      solId:
                                                        role?.LOCATION_ID || "",
                                                      empNo:
                                                        role?.EMP_NUMBER ||
                                                        employee?.EMP_NUMBER ||
                                                        "",
                                                      roleCode:
                                                        role?.ROLE_CODE || "",
                                                      roles: [],
                                                      assignmentId:
                                                        role?.ASSIGNMENT_ID ||
                                                        assignmentId ||
                                                        "",
                                                      userType: userType,
                                                      unitType: unitType,
                                                    }
                                                  );
                                                if (resp) {
                                                  setShowKraList(resp.kraList);
                                                  setShowTotalKraWght(
                                                    resp.totalWeight || 0
                                                  );
                                                }
                                              } catch (err) {
                                                console.error(err);
                                              }
                                              setLoading(false);
                                            }}
                                          >
                                            Show KRA
                                          </button>
                                        </li>

                                        {/* Delete Button (Visible if Pending/null) */}
                                        {(role.STATUS === "Acceptance Pending" ||
                                          role.STATUS == null) && (
                                            <li>
                                              <button
                                                className="btn btn-show delete-role-btn"
                                                title="Delete Role"
                                                data-bs-toggle="offcanvas"
                                                data-bs-target="#offcanvasDeleteRole"
                                                aria-controls="offcanvasDeleteRole"
                                                onClick={() => {
                                                  handleOpenDrawer("delete-role");
                                                  handleSelectedRole(role);
                                                }}
                                              >
                                                Delete Role
                                              </button>
                                            </li>
                                          )}

                                        {/* Edit Button (Visible if Pending/null) */}
                                        {/* {(role.STATUS === "Acceptance Pending" ||
                                          role.STATUS == null) && (
                                            <li>
                                              <button
                                                className="btn btn-show edit-role-btn"
                                                // onClick={() => handleEdit(role)}
                                                onClick={() => handleEdit({ ...role, VERTICAL_ROLE: determinedVerticalRole })}
                                              >
                                                Edit Role
                                              </button>
                                            </li>
                                          )} */}

                                        {/* Respond Button (Visible if "Discussion") */}
                                        {role.STATUS &&
                                          String(role.STATUS).toLowerCase() ===
                                          "discussion" && (
                                            <li>
                                              <button
                                                className="btn btn-show edit-role-btn bg-secondary"
                                                title="Discuss with Supervisor"
                                                data-bs-toggle="offcanvas"
                                                data-bs-target="#offcanvasAcceptorResponse"
                                                aria-controls="offcanvasAcceptorResponse"
                                                onClick={() => {
                                                  handleOpenDrawer("respondCard");
                                                  handleSelectedRole(role);
                                                  handleRespondClick(role);
                                                }}
                                              >
                                                Respond
                                              </button>
                                            </li>
                                          )}
                                      </ul>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {showKraList && showKraList.length > 0 && !isNewAddRole && showKra ? (
            <div className="col-md-7 col-12">
              <div className="row">
                <div className="col-10">
                  <p className="fw-bold m-0">KRAs</p>
                </div>
                <div className="col-2">
                  <p className="fw-bold m-0 text-center">Wgt</p>
                </div>
              </div>
              <div className="kra-list mt-3">
                {showKraList?.map((item, index) => (
                  <div className="row my-3" key={index}>
                    <div className="col-10">
                      <p className="m-0">{item.KRA_NAME}</p>
                    </div>
                    <div className="col-2">
                      <p className="m-0 text-center">{item.KRA_WEIGHT}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="row text-primary mt-2">
                <div className="col-10">
                  <p className="fw-bold m-0">Total</p>
                </div>
                <div className="col-2">
                  <p className="fw-bold m-0 text-center">{showTotalKraWght}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {(showRoleForm ||
        isEdit ||
        (roledata?.length == 0 && !hasUserDismissedEmptyRoleForm)) && (
          <EditRoleLeftSide
            formData={formData}
            onChange={handleChange}
            verticalRolesList={baseAvailableRoles}
            primaryRolesList={primaryRolesList}
            secondaryRolesList={secondaryRolesList}
            tertiaryRolesList={tertiaryRolesList}
            quaternaryRolesList={quaternaryRolesList}
            quinaryRolesList={quinaryRolesList}
            selectedPrimaryRole={primarySelectedRole}
            selectedSecondaryRole={secondarySelectedRole}
            selectedTertiaryRole={tertiarySelectedRole}
            selectedQuaternaryRole={quaternarySelectedRole}
            selectedQuinaryRole={quinarySelectedRole}
            selectedKraList={kraList}
            totalWeight={totalWgt}
            showRoleForm={showRoleForm}
            handleSubmitRole={handleSubmitRole}
            isNewAddRole={isNewAddRole}
            SelectedRolesData={SelectedRolesData}
            employeeHistory={employeeHistory}
            isEdit={isEdit}
            selectedURLId={selectedURLId}
            selectedSolId={selectedSolId}
            showKraList={showKraList}
            roledata={roledata}
            onBackToHistory={handleCloseEditForm}
          />
        )}

      <SideDrawer
        handleChangeRespond={handleChangeRespond}
        responseReason={responseReason}
        respondComment={respondComment}
        discussionComment={memoizedComment}
        handleSubmitRespond={handleSubmitRespond}
        handleOpenDrawer={handleOpenDrawer}
        openDrawer={openDrawer}
        handleDeleteAllocatedRole={handleDeleteAllocatedRole}
      />
    </div>
  );
};

export default RoleHistory;
