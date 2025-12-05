import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./LeftNavigation.css";
import dashboardIcon from "../../assets/home.svg";
import toolIcon from "../../assets/tools-green.svg";
import fileIcon from "../../assets/file.png";
import tickIcon from "../../assets/check-mark.png";
import { accessService } from "../../services/api";

const toolsSubmenu = [
  {
    id: "business-target",
    label: "Business Target",
    path: "/rc/business-target",
  },
  { id: "role-clarity", label: "Role Clarity", path: "/rc/role-clarity" },
  {
    id: "role-allocation",
    label: "Role Allocation",
    path: "/rc/role-allocation",
  },
  { id: "scorecard", label: "Scorecard", path: "/rc/scorecard" },
  { id: "appraisal", label: "Appraisal", path: "/rc/appraisal" },
  {
    id: "transfer-tool",
    label: "Transfer Tool - Transfers",
    path: "/rc/transfer-tool",
  },
  {
    id: "performance-dashboard",
    label: "Performance Dashboard",
    path: "/rc/performance-dashboard",
  },
  {
    id: "product-dashboard",
    label: "Product Dashboard",
    path: "/rc/product-dashboard",
  },
  { id: "job-family", label: "Job Family", path: "/jf/job-family" },
  { id: "posting", label: "Posting", path: "/posting/ro" },
  { id: "my-goals", label: "Target Setting", path: "/rc/my-goals" },
  {
    id: "tcac-actual-upload",
    label: "TCAC - Actual Upload",
    path: "/rc/tcac/actual_upload",
  },
  {
    id: "tcac-target-collation",
    label: "TCAC - Target Collation",
    path: "/rc/tcac/target-collation",
  },
  { id: "promotion", label: "Promotion", path: "/rc/promotion" },
  { id: "feedback", label: "360 Feedback", path: '/fb/feedback'},
];

const fallbackLabels = ["Role Clarity", "Scorecard", "Appraisal", "360 Feedback"];

const LeftNavigation = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [showToolsSubmenu, setShowToolsSubmenu] = useState(false);
  const [filteredTools, setFilteredTools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user = [] } = useAuth();

  const isJobFamilyFlow = location.pathname.includes("/jf/");
  const isRo = location.pathname.includes("/posting/");

  // Simple normalization and mapping using regex keywords
  const mapApiNameToLabel = (apiName = "") => {
    if (!apiName) return "";
    let cleanName = apiName.toString().trim();
    // Remove trailing word 'tool' (case-insensitive) — keep interior words if any
    cleanName = cleanName.replace(/\btool\b$/i, "").trim();
    if (/scorecard/i.test(cleanName)) return "Scorecard";
    if (/transfer/i.test(cleanName)) return "Transfer Tool - Transfers";
    if (/appraisal/i.test(cleanName)) return "Appraisal";
    if (/job\s*family/i.test(cleanName)) return "Job Family";
    if (/role\s*clarity/i.test(cleanName)) return "Role Clarity";
    if (/performance/i.test(cleanName)) return "Performance Dashboard";
    if (/product/i.test(cleanName)) return "Product Dashboard";
    if (/target\s*collation/i.test(cleanName)) return "TCAC - Target Collation";
    if (/data\s*upload/i.test(cleanName)) return "TCAC - Actual Upload";
    if (/promotion/i.test(cleanName)) return "Promotion";
    if (/Feedback/i.test(cleanName)) return '360 Feedback';

    // Fallback: return cleaned name (so UI can either match exactly or show it as disabled)
    return cleanName;
  };

  const fetchAndSetTools = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem("userData"))?.[0];
    if (!userData) {
      // no userData — show safe fallback
      setFilteredTools(
        toolsSubmenu.filter((item) =>
          fallbackLabels.some(
            (lbl) => lbl.toLowerCase() === item.label.toLowerCase()
          )
        )
      );
      return;
    }

    const empId = userData.EMP_NUMBER || userData.EMP_ID;
    const unitType = userData.BRANCHTYPE || "";
    const role = userData.POSITION_DESIGNATION || "";

    if (!empId || !unitType || !role) {
      setFilteredTools(
        toolsSubmenu.filter((item) =>
          fallbackLabels.some(
            (lbl) => lbl.toLowerCase() === item.label.toLowerCase()
          )
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      const apiResponseObject = await accessService.getAccessModuleWise(
        empId,
        unitType,
        role
      );
      if (apiResponseObject?.moduleWise) {
        localStorage.setItem(
          "moduleAccessList",
          JSON.stringify(apiResponseObject.moduleWise)
        );
      }

      const accessibleTools = apiResponseObject?.accessibleTools;
      if (!Array.isArray(accessibleTools)) {
        // fallback to safe defaults if API response shape unexpected
        setFilteredTools(
          toolsSubmenu.filter((item) =>
            fallbackLabels.some(
              (lbl) => lbl.toLowerCase() === item.label.toLowerCase()
            )
          )
        );
        return;
      }

      // create normalized labels from API
      const normalizedAccessList = accessibleTools
        .map((tool) => tool.name?.trim())
        .map((apiName) => mapApiNameToLabel(apiName))
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      // Filter toolsSubmenu by normalized list (case-insensitive)
      const matched = toolsSubmenu.filter((item) =>
        normalizedAccessList.some((lbl) => lbl === item.label.toLowerCase())
      );

      setFilteredTools(matched);
    } catch (error) {
      console.error("Error fetching tool access:", error);
      // fallback to safe defaults on error
      setFilteredTools(
        toolsSubmenu.filter((item) =>
          fallbackLabels.some(
            (lbl) => lbl.toLowerCase() === item.label.toLowerCase()
          )
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetTools();
  }, [fetchAndSetTools]);

  // Ensure certain user types always get Performance Dashboard appended if not present
  // useEffect(() => {
  //   try {
  //     const allowedUserTypes = [9, 28, 10, 2, 3];
  //     const userType =
  //       Array.isArray(user) && user.length ? user[0].USER_TYPE : undefined;
  //     if (!allowedUserTypes.includes(userType)) return;

  //     setFilteredTools((prev) => {
  //       const exists = prev.some((t) => t.id === "performance-dashboard");
  //       if (exists) return prev;
  //       // find performance item from toolsSubmenu
  //       const perf = toolsSubmenu.find((t) => t.id === "performance-dashboard");
  //       if (!perf) return prev;
  //       return [...prev, perf];
  //     });
  //   } catch (err) {
  //     // ignore
  //   }
  // }, [user]);

  const handleToolsClick = () => {
    setShowToolsSubmenu((showToolsSubmenu) => !showToolsSubmenu);
    setActiveItem("tools");
  };

  const handleHomeClick = () => {
    setActiveItem("home");
    setShowToolsSubmenu(false);
    navigate("/welcome");
  };

  const handleSubmenuClick = (path) => {
    if (!path) return;
    setShowToolsSubmenu(false);
    navigate(path);
  };

  const handleAdminPanelClick = () => {
    setActiveItem("adminPanel");
    setShowToolsSubmenu(false);
    navigate("/jf/job-family");
  };
  const handleWorkflowClick = () => {
    setActiveItem("workflow");
    setShowToolsSubmenu(false);
    navigate("/jf/generate-pool");
  };
  const handleInterRegionTransferClick = () => {
    setActiveItem("interRegion");
    setShowToolsSubmenu(false);
    navigate("/posting/interRegion-transfer");
  };
  const handleAdminPanelPostingClick = () => {
    setActiveItem("adminPanel");
    setShowToolsSubmenu(false);
    navigate("/posting/generate-eligible-employee");
  };
  const handleWorkflowPostingClick = () => {
    setActiveItem("workflow");
    setShowToolsSubmenu(false);
    navigate("/posting/generate-employee");
  };

  return (
    <div className="left-navigation">
      <div className="nav-menu">
        <div
          className={`nav-item ${activeItem === "home" ? "active" : ""}`}
          onClick={handleHomeClick}
        >
          <div className="nav-icon">
            <img src={dashboardIcon} alt={""} />
          </div>
          <div className="nav-label">Home</div>
        </div>

        {!isRo && (
          <div
            className={`nav-item ${activeItem === "tools" ? "active" : ""}`}
            onClick={handleToolsClick}
          >
            <div className="nav-icon">
              <img src={toolIcon} alt={""} />
            </div>
            <div className="nav-label">My Tools</div>
          </div>
        )}

        {showToolsSubmenu && (
          <div className="submenu">
            {isLoading && <div className="submenu-item">Loading...</div>}

            {!isLoading && filteredTools.length === 0 && (
              <div className="submenu-item">No tools available</div>
            )}

            {!isLoading &&
              filteredTools.map((item) => (
                <div
                  key={item.id}
                  className="submenu-item"
                  onClick={() => handleSubmenuClick(item.path)}
                >
                  {item.label}
                </div>
              ))}
          </div>
        )}

        {isRo ? (
          <>
            <div
              className={`nav-item ${
                activeItem === "workflow" ? "active" : ""
              }`}
              onClick={handleWorkflowPostingClick}
            >
              <div className="nav-icon">
                <img src={fileIcon} alt={""} />
              </div>
              <div className="nav-label">Workflow</div>
            </div>
            <div
              className={`nav-item ${
                activeItem === "adminPanel" ? "active" : ""
              }`}
              onClick={handleAdminPanelPostingClick}
            >
              <div className="nav-icon">
                <img src={tickIcon} alt={""} />
              </div>
              <div className="nav-label">Admin Panel</div>
            </div>
            <div
              className={`nav-item ${
                activeItem === "interRegion" ? "active" : ""
              }`}
              onClick={handleInterRegionTransferClick}
            >
              <div className="nav-icon">
                <img src={tickIcon} alt={""} />
              </div>
              <div className="nav-label">Inter Region Transfers</div>
            </div>
          </>
        ) : !isJobFamilyFlow ? (
          <div
            className={`nav-item ${activeItem === "survey" ? "active" : ""}`}
            onClick={() => setActiveItem("survey")}
          >
            <div className="nav-icon">
              <img src={toolIcon} alt={""} />
            </div>
            <div className="nav-label">Survey</div>
          </div>
        ) : (
          <>
            <div
              className={`nav-item ${
                activeItem === "workflow" ? "active" : ""
              }`}
              onClick={handleWorkflowClick}
            >
              <div className="nav-icon">
                <img src={fileIcon} alt={""} />
              </div>
              <div className="nav-label">Workflow</div>
            </div>
            <div
              className={`nav-item ${
                activeItem === "adminPanel" ? "active" : ""
              }`}
              onClick={handleAdminPanelClick}
            >
              <div className="nav-icon">
                <img src={tickIcon} alt={""} />
              </div>
              <div className="nav-label">Admin Panel</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftNavigation;
