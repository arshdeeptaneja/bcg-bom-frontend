/**
 * The `useDashboardData` function fetches and manages dashboard data for a user based on their
 * authentication details and updates the Redux store with the retrieved data.
 * @returns The `useDashboardData` custom hook is being returned. It provides the following values and
 * functions:
 */
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import DashboardService from "../services/dashboardService";
import {
  setStatusCounts,
  setStatusIcons,
  setTeamMembers,
} from "../features/dashboard/dashboardSlice";

export default function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { getEmployeeDetails, getUserProperty } = useAuth();

  // ✅ extract data directly from AuthContext
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty(
    "empNo",
    employeeDetails?.currentUser?.[0]?.EMP_ID || ""
  );
  const sol = getUserProperty(
    "sol",
    employeeDetails?.currentUser?.[0]?.LOCATION || ""
  );
  const unitType = getUserProperty(
    "unitType",
    employeeDetails?.currentUser?.[0]?.BRANCH_UNIT_TYPE || ""
  );
  const empDsg = getUserProperty(
    "empDsg",
    employeeDetails?.currentUser?.[0]?.POSITION_DESIGNATION || ""
  );

  const fetchDashboardData = useCallback(async () => {
    if (!empNo) return;

    setLoading(true);
    setError(null);
    try {
      const data = await DashboardService.getRCTDashboard(
        empNo,
        sol,
        unitType,
        empDsg
      );

      setDashboardData(data);

      // ✅ sync to Redux store
      dispatch(setStatusCounts(data?.status_count));
      dispatch(setTeamMembers(data?.teamlist));
      dispatch(setStatusIcons(data?.teamlist?.status));
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [empNo, sol, unitType, empDsg, dispatch]);

  // ✅ auto-fetch once ready
  useEffect(() => {
    if (empNo) fetchDashboardData();
  }, [fetchDashboardData, empNo]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    empNo,
    sol,
    unitType,
    empDsg,
  };
}
