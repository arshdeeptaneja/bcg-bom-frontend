// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Create the AuthContext
// const AuthContext = createContext();

// // Custom hook to use the AuthContext
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // AuthProvider component
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [statusCount, setStatusCount] = useState({});
//   const [teamData, setTeamData] = useState(null);

//   // Initialize auth state from localStorage on app start
//   useEffect(() => {
//     const initializeAuth = () => {
//       try {
//         const token = localStorage.getItem('accessToken');
//         const userData = localStorage.getItem('userData');

//         if (token && userData) {
//           const parsedUserData = JSON.parse(userData);
//           setUser(parsedUserData);
//           setIsAuthenticated(true);
//         }
//       } catch (error) {
//         console.error('Error initializing auth:', error);
//         // Clear invalid data
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('userData');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   // Login function - handles complete login response data
//   const login = (loginResponseData) => {
//     try {
//       console.log('AuthContext.login called with:', loginResponseData);

//       // Extract data from login response
//       const { accessToken, refreshToken, user, userDetailedInfo } = loginResponseData;

//       // Validate required fields
//       if (!accessToken) {
//         console.error('Login failed: accessToken is missing');
//         return false;
//       }

//       console.log('Login data extracted:', {
//         hasAccessToken: !!accessToken,
//         hasRefreshToken: !!refreshToken,
//         hasUser: !!user,
//         hasUserDetailedInfo: !!userDetailedInfo,
//       });

//       // Store tokens
//       if (accessToken) {
//         localStorage.setItem('accessToken', accessToken);
//       }
//       if (refreshToken) {
//         localStorage.setItem('refreshToken', refreshToken);
//       }

//       // Combine user data from both user and userDetailedInfo
//       // Handle null/undefined values safely
//       const userData = user || {};
//       const detailedInfo = userDetailedInfo[0] || {};

//       const combinedUserData = {
//         ...userData,
//         ...detailedInfo,
//         // Map essential fields for API calls
//         empNo: detailedInfo?.EMP_ID || userData?.EMP_ID || userData?.employeeId,
//         name: detailedInfo?.EMP_NAME || userData?.EMP_NAME || userData?.fullName,
//         sol: detailedInfo?.sol || userData?.sol,
//         unitType: detailedInfo?.BRANCH_UNIT_TYPE || userData?.BRANCH_UNIT_TYPE,
//         department: detailedInfo?.departmentuserData || userData?.department,
//         designation: detailedInfo?.POSITION_DESIGNATION || userData?.ROLE_NAME,
//         corporation: detailedInfo?.corporation || userData?.corporation,
//       };

//       // Store combined user data
//       localStorage.setItem('userData', JSON.stringify(combinedUserData));

//       // Only store user and userDetailedInfo if they exist
//       if (user) {
//         localStorage.setItem('user', JSON.stringify(user));
//       }
//       if (userDetailedInfo) {
//         localStorage.setItem('userDetailedInfo', JSON.stringify(userDetailedInfo));
//       }

//       // Verify what was stored in localStorage
//       console.log('localStorage after login:', {
//         hasUserData: !!localStorage.getItem('userData'),
//         hasUser: !!localStorage.getItem('user'),
//         hasUserDetailedInfo: !!localStorage.getItem('userDetailedInfo'),
//         userData: localStorage.getItem('userData'),
//         user: localStorage.getItem('user'),
//         userDetailedInfo: localStorage.getItem('userDetailedInfo'),
//       });

//       // Update state
//       setUser(combinedUserData);
//       setIsAuthenticated(true);

//       console.log('Login successful - User data saved:', combinedUserData);
//       return true;
//     } catch (error) {
//       console.error('Error during login:', error);
//       return false;
//     }
//   };

//   // Logout function
//   const logout = () => {
//     try {
//       // Clear localStorage
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('userData');
//       localStorage.removeItem('refreshToken');

//       // Reset state
//       setUser(null);
//       setIsAuthenticated(false);
//       setDashboardData(null);

//       return true;
//     } catch (error) {
//       console.error('Error during logout:', error);
//       return false;
//     }
//   };

//   // Update user data
//   const updateUser = (updatedUserData) => {
//     try {
//       const newUserData = { ...user, ...updatedUserData };
//       localStorage.setItem('userData', JSON.stringify(newUserData));
//       setUser(newUserData);
//       return true;
//     } catch (error) {
//       console.error('Error updating user data:', error);
//       return false;
//     }
//   };

//   // Get user property safely
//   const getUserProperty = (property, defaultValue = null) => {
//     return user && user[property] ? user[property] : defaultValue;
//   };

//   // Check if user has specific role
//   const hasRole = (role) => {
//     return user && user.roles && user.roles.includes(role);
//   };

//   // Get employee details for API calls
//   const getEmployeeDetails = () => {
//     if (!user) return null;

//     return {
//       currentUser: user,
//     };
//   };

//   const setTeamDashboardData = (data) => {
//     setDashboardData(data);
//   };

//   // Debug utility to check saved data
//   const getDebugInfo = () => {
//     return {
//       currentUser: user,
//       currentDashboardData: dashboardData,
//       localStorage: {
//         accessToken: localStorage.getItem('accessToken'),
//         refreshToken: localStorage.getItem('refreshToken'),
//         userData: JSON.parse(localStorage.getItem('userData') || 'null'),
//         user: JSON.parse(localStorage.getItem('user') || 'null'),
//         userDetailedInfo: JSON.parse(localStorage.getItem('userDetailedInfo') || 'null'),
//       },
//       isAuthenticated,
//       employeeDetails: getEmployeeDetails(),
//     };
//   };

//   const value = {
//     // State
//     user,
//     isAuthenticated,
//     loading,
//     dashboardData,

//     // Actions
//     login,
//     logout,
//     updateUser,
//     setTeamDashboardData,
//     statusCount,
//     setStatusCount,
//     setTeamData,
//     teamData,
//     // Utilities
//     getUserProperty,
//     hasRole,
//     getEmployeeDetails,
//     getDebugInfo,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthContext;




import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [statusCount, setStatusCount] = useState({});
  const [teamData, setTeamData] = useState(null);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        let token = localStorage.getItem('accessToken');
        let userData = localStorage.getItem('userData');

        if (!token || !userData) {
          // Temporary mock user for local development
          const mockUser = {
            EMP_ID: '36663',
            empNo: '36663',
            EMP_NAME: 'Demo User',
            roles: ['ROLE_APPRAISEE'],
            BRANCH_UNIT_TYPE: 'Branch',
            unitType: 'Branch',
            designation: 'Branch Manager',
          };
          localStorage.setItem('accessToken', 'mock-token');
          localStorage.setItem('userData', JSON.stringify(mockUser));
          token = 'mock-token';
          userData = JSON.stringify(mockUser);
        }

        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - handles complete login response data
  const login = (loginResponseData) => {
    try {
      console.log('AuthContext.login called with:', loginResponseData);

      // Extract data from login response
      const { accessToken, refreshToken, user, userDetailedInfo } = loginResponseData;

      // Validate required fields
      if (!accessToken) {
        console.error('Login failed: accessToken is missing');
        return false;
      }

      console.log('Login data extracted:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        hasUserDetailedInfo: !!userDetailedInfo,
      });

      // Store tokens
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Combine user data from both user and userDetailedInfo
      // Handle null/undefined values safely
      const userData = user || {};
      const detailedInfo = userDetailedInfo[0] || {};

      const combinedUserData = {
        ...userData,
        ...detailedInfo,
        // Map essential fields for API calls
        empNo: detailedInfo?.EMP_ID || userData?.EMP_ID || userData?.employeeId,
        name: detailedInfo?.EMP_NAME || userData?.EMP_NAME || userData?.fullName,
        sol: detailedInfo?.sol || userData?.sol,
        unitType: detailedInfo?.BRANCH_UNIT_TYPE || userData?.BRANCH_UNIT_TYPE,
        department: detailedInfo?.departmentuserData || userData?.department,
        designation: detailedInfo?.POSITION_DESIGNATION || userData?.ROLE_NAME,
        corporation: detailedInfo?.corporation || userData?.corporation,
      };

      // Store combined user data
      localStorage.setItem('userData', JSON.stringify(combinedUserData));

      // Only store user and userDetailedInfo if they exist
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      if (userDetailedInfo) {
        localStorage.setItem('userDetailedInfo', JSON.stringify(userDetailedInfo));
      }

      // Verify what was stored in localStorage
      console.log('localStorage after login:', {
        hasUserData: !!localStorage.getItem('userData'),
        hasUser: !!localStorage.getItem('user'),
        hasUserDetailedInfo: !!localStorage.getItem('userDetailedInfo'),
        userData: localStorage.getItem('userData'),
        user: localStorage.getItem('user'),
        userDetailedInfo: localStorage.getItem('userDetailedInfo'),
      });

      // Update state
      setUser(combinedUserData);
      setIsAuthenticated(true);

      console.log('Login successful - User data saved:', combinedUserData);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('refreshToken');

      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setDashboardData(null);

      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  // Update user data
  const updateUser = (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(newUserData));
      setUser(newUserData);
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  };

  // Get user property safely
  const getUserProperty = (property, defaultValue = null) => {
    return user && user[property] ? user[property] : defaultValue;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.roles && user.roles.includes(role);
  };

  // Get employee details for API calls
  const getEmployeeDetails = () => {
    if (!user) return null;

    return {
      currentUser: user,
    };
  };

  const setTeamDashboardData = (data) => {
    setDashboardData(data);
  };

  // Debug utility to check saved data
  const getDebugInfo = () => {
    return {
      currentUser: user,
      currentDashboardData: dashboardData,
      localStorage: {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userData: JSON.parse(localStorage.getItem('userData') || 'null'),
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        userDetailedInfo: JSON.parse(localStorage.getItem('userDetailedInfo') || 'null'),
      },
      isAuthenticated,
      employeeDetails: getEmployeeDetails(),
    };
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    dashboardData,

    // Actions
    login,
    logout,
    updateUser,
    setTeamDashboardData,
    statusCount,
    setStatusCount,
    setTeamData,
    teamData,
    // Utilities
    getUserProperty,
    hasRole,
    getEmployeeDetails,
    getDebugInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
