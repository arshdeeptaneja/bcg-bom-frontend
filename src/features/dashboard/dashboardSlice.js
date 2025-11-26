/* This code snippet is defining a Redux slice using the `createSlice` function from the
`@reduxjs/toolkit` package. */
import { createSlice } from "@reduxjs/toolkit";
import { FaCircleCheck, FaFlag } from "react-icons/fa6";
import { BsFillPatchExclamationFill } from "react-icons/bs";

// Define default icons and colors
const initialStatusIcons = {
  GREEN: { icon: <FaCircleCheck color="green" size={12} />, color: "green" },
  RED: {
    icon: <BsFillPatchExclamationFill color="#9f1d35" size={12} />,
    color: "#9f1d35",
  },
  YELLOW: { icon: <FaFlag color="#f69f29" size={12} />, color: "#f69f29" },
  BLACK: { icon: <FaCircleCheck color="black" size={12} />, color: "black" },
  GRAY: { icon: <FaCircleCheck color="gray" size={12} />, color: "gray" },
};

// Default counts
const defaultStatusCounts = {
  GREEN: 0,
  RED: 0,
  YELLOW: 0,
  BLACK: 0,
  GRAY: 0,
};

const initialState = {
  status: defaultStatusCounts,
  statusIcons: initialStatusIcons,
  teamMembers: [],
  refreshKey: 0,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setStatusCounts: (state, action) => {
      // Merge API data safely with default keys
      state.status = { ...defaultStatusCounts, ...action.payload };
    },
    setTeamMembers: (state, action) => {
      state.teamMembers = action.payload || [];
    },
    setStatusIcons: (state, action) => {
      state.statusIcons = { ...initialStatusIcons, ...action.payload };
    },
    triggerDashboardRefresh: (state) => {
      state.refreshKey += 1;
    },
    updateRoleStatus: (state, action) => {
      const { roleId, newStatusText, newColorCode } = action.payload;
      const member = state.teamMembers.find(m => m.URL_ID === roleId || m.ROLE_ID === roleId);

      if (member) {
        member.STATUS = newStatusText;
        member.status_class = newColorCode;
      }
    },
  },
});

export const {
  setStatusCounts,
  setTeamMembers,
  setStatusIcons,
  triggerDashboardRefresh,
  updateRoleStatus
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
