import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import RoleClarity from "../../components/RoleClarity/RoleClarity";
import KRAMetrics from "../../components/KRA/KRAMetrics";
import TeamMembers from "../../components/TeamMembers/TeamMembers";
import DashboardService from "../../services/dashboardService";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { HiMiniArrowLongLeft } from "react-icons/hi2";
import NoRole from "../../components/NoRole/NoRole";
import LoadingSpinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import {
  setStatusCounts,
  setStatusIcons,
  setTeamMembers,
} from "../../features/dashboard/dashboardSlice";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();
  const hasFetchedRef = useRef(false);

  const { user, getEmployeeDetails, getUserProperty } = useAuth();

  const handleBackClick = () => {
    navigate(-1);
  };

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
  const userName = getUserProperty("name");

  //sol - LOCATION
  //   unit type - BRANCH_UNIT_TYPE
  //desg = POSITION_DESIGNATION

  const fetchDashboardData = async () => {
    console.log("my db data")
    try {
      setLoading(true);
      setError(null);

      const data = await DashboardService.getRCTDashboard(
        empNo,
        sol,
        unitType,
        empDsg
      );
      setDashboardData(data);
      console.log(data, "data");
      dispatch(setStatusCounts(data?.status_count));
      dispatch(setTeamMembers(data?.teamlist));
      dispatch(setStatusIcons(data?.teamlist?.status));
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
      console.error("Dashboard API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empNo && !hasFetchedRef.current) {
      fetchDashboardData();
      hasFetchedRef.current = true;
    } else if (!empNo) {
      setLoading(false);
    }
  }, [empNo]);

  // const handleRefresh = () => {
  //   fetchDashboardData();
  // };

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <div className="row">
          <div className="col-12 d-flex align-items-center gap-3">
            <button
              className="back-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm rounded-pill bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark"
              onClick={handleBackClick}
            >
              <HiMiniArrowLongLeft size={20} className="lh-1" />{" "}
              <span className="small fw-semibold">BACK</span>
            </button>
            <h1 className="dashboard-title text-primary fw-bold mb-0">
              Role Clarity
            </h1>
          </div>
          <div className="col-12 d-flex align-items-center">
            <p className="dashboard-subtitle m-0 mt-2">
              Get a detailed view- Your role mix and allocation for the team.
            </p>
          </div>
        </div>

        {/* Loading and Error States */}
        {/*{loading && (*/}
        {/*  <div className="dashboard-status">*/}
        {/*    <span className="loading-text">Loading dashboard data...</span>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/*{error && (*/}
        {/*  <div className="dashboard-error">*/}
        {/*    <span className="error-text">Error: {error}</span>*/}
        {/*    <button className="retry-button" onClick={handleRefresh}>*/}
        {/*      Retry*/}
        {/*    </button>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/* Data Info */}
        {/*{dashboardData && (*/}
        {/*  <div className="dashboard-info">*/}
        {/*    <span className="data-info">*/}
        {/*      {userName} | Employee: {empNo} | SOL: {sol} | Type: {unitType}*/}
        {/*    </span>*/}
        {/*    <button className="refresh-button" onClick={handleRefresh}>*/}
        {/*      Refresh*/}
        {/*    </button>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <LoadingSpinner />
        </div>
      ) : dashboardData?.roledatacount > 0 ? (
        <div className="dashboard-content">
          <div className="main-content">
            <RoleClarity dashboardData={dashboardData} />
            <KRAMetrics dashboardData={dashboardData} />
          </div>

          <div className="sidebar-content">
            <TeamMembers
              dashboardData={dashboardData}
              fetchDashboardData={fetchDashboardData}
            />
          </div>
        </div>
      ) : (
        <NoRole />
      )}
    </div>
  );
};

export default Dashboard;
