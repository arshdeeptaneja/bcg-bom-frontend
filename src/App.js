import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import {
  Login,
  Dashboard,
  Welcome,
  RoleAllocation,
  AppraisalDashboard,
  AppraisalHome,
  AppraiseeCheckIn,
  AdminPanel,
  Appraisalstatus,
  ReportingAuthority,
  ValidatorUpdateUtility,
  ExceptionDelection,
  ModuleActiveInactiveDate,
  AppealComittee,

} from './pages';
import { TopBar, LeftNavigation } from './components/common';
import UserProfile from './components/UserProfile/UserProfile';
import ApiTest from './components/ApiTest';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RoleAcceptance from './pages/RoleAcceptance/RoleAcceptance';
import { ToastWrapper } from './components/common/ToastMessage';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import JobFamily from './pages/JobFamily/JobFamily';
import HrDashboard from './pages/Appraisal/AppraisalHRDashboard/HrDashboard';
import AppraiserUpdate from './pages/Appraisal/AppraisalHRDashboard/AppraiserUpdate/AppraiserUpdate';
import ReportingReviewBulk from './pages/Appraisal/AppraisalHRDashboard/ReportingAuthorityBulk/ReportingAuthorityBulk';
import AppealDeletion from './pages/Appraisal/AppraisalHRDashboard/AppealDelection/AppealDelection';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}

// App content that uses AuthContext
function AppContent() {
  let { isAuthenticated, loading, login, logout, setTeamDashboardData } = useAuth();

  // TODO: For testing purposes, remove this later
  isAuthenticated = true;

  useEffect(() => {
    if (isAuthenticated) {
      setTeamDashboardData();
    }
  }, [isAuthenticated, setTeamDashboardData]);

  const handleLogin = (loginResponseData) => {
    return login(loginResponseData);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="App loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <ToastWrapper />
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
              }
            />
            <Route
              path="/welcome"
              element={
                // isAuthenticated ? (
                <WelcomeLayout onLogout={handleLogout} />
                // ) : (
                //   <Navigate to="/login" replace />
                // )
              }
            />
            <Route
              path="/rc/role-clarity"
              element={
                // isAuthenticated ? (
                <DashboardLayout onLogout={handleLogout} />
                // ) : (
                //   <Navigate to="/login" replace />
                // )
              }
            />
            <Route
              path="/bcg-bom/role-acceptance/get-kra-details/:empId"
              element={
                isAuthenticated ? (
                  <RoleAcceptanceLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <ProfileLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/api-test" element={<ApiTest />} />
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/welcome' : '/login'} replace />}
            />
            <Route
              path="/rc/role-allocation"
              element={
                isAuthenticated ? (
                  <RoleAllocationLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/jobFamily"
              element={
                isAuthenticated ? (
                  <JobFamily onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/dashboard"
              element={
                isAuthenticated ? (
                  <AppraisalDashboardLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/home"
              element={
                isAuthenticated ? (
                  <AppraisalHomeLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/appraisee-check-in"
              element={
                isAuthenticated ? (
                  <AppraiseeCheckInLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/admin-panel"
              element={
                isAuthenticated ? (
                  <AppraisalAdminPanel onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/hr-dashboard"
              element={
                isAuthenticated ? (
                  <AppraisaHrDashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/hr-dashboard/appraisal-update"
              element={
                isAuthenticated ? (
                  <AppraisaUpdated onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
               <Route
              path="/appraisal/hr-dashboard/appraisal-status-change-utility"
              element={
                isAuthenticated ? (
                  <AppraisalStatusChangeUtility onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

              <Route
              path="/appraisal/hr-dashboard/appeal-comittee"
              element={
                isAuthenticated ? (
                  <AppraisalAppealComittee onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
               <Route
              path="/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulk"
              element={
                isAuthenticated ? (
                  <ReportingAuthorityReviewBulk onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
               <Route
              path="/appraisal/hr-dashboard/validator-update-utility"
              element={
                isAuthenticated ? (
                  <ValidatorUpdateUtilities onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

   <Route
              path="/appraisal/hr-dashboard/exception-delection-utility"
              element={
                isAuthenticated ? (
                  <ExceptionDelectionUtilities onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

               <Route
              path="/appraisal/hr-dashboard/Appeal-delection-utility"
              element={
                isAuthenticated ? (
                  <AppealDelectionUtilities onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

               <Route
              path="/appraisal/hr-dashboard/module-active-inactive-date"
              element={
                isAuthenticated ? (
                  <MoulesActiveInactiveDate onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

          </Routes>
        </div>
      </Router>
    </>
  );
}

// Welcome Layout Component
const WelcomeLayout = ({ onLogout }) => {
  return <Welcome onLogout={onLogout} />;
};

// Dashboard Layout Component (for Role Clarity tool)
const DashboardLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <Dashboard />
    </>
  );
};

const RoleAllocationLayout = ({ onLogout }) => {
  const { dashboardData } = useAuth();
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <RoleAllocation dashboardData={dashboardData} />
    </>
  );
};

const RoleAcceptanceLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <RoleAcceptance />
    </>
  );
};

// Profile Layout Component
const ProfileLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <UserProfile />
    </>
  );
};

// Appraisal Dashboard Layout Component
const AppraisalDashboardLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppraisalDashboard />
    </>
  );
};

const AppraisalHomeLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppraisalHome />
    </>
  );
};


const AppraiseeCheckInLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppraiseeCheckIn />
    </>
  );
};

// Appraisa Admin Panel
const AppraisalAdminPanel = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AdminPanel />
    </>
  );
};

// Appraisal Hr Dashboard
const AppraisaHrDashboard = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <HrDashboard />

    </>
  )
}
//appraisal update
const AppraisaUpdated = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppraiserUpdate />
    </>
  )
}

//Appraisal Status Change Utility
const AppraisalStatusChangeUtility = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
    <Appraisalstatus/>
    </>
  )
}

//Reporting & Reviewing Authority Update by Emp Number
const AppraisalAppealComittee = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
    <AppealComittee/>
    </>
  )
}

//ReportingAuthorityBulk
const ReportingAuthorityReviewBulk = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
  <ReportingReviewBulk/>
    </>
  )
}

//ValidatorUpdateUtility
const ValidatorUpdateUtilities = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
 <ValidatorUpdateUtility/>
    </>
  )
}
//ExceptionDelection
const ExceptionDelectionUtilities = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
<ExceptionDelection/>
    </>
  )
}

//ExceptionDelection
const AppealDelectionUtilities = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
<AppealDeletion/>
    </>
  )
}
 // ModuleActiveInactiveDate
 const MoulesActiveInactiveDate = ({ onLogout }) => {

  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
<ModuleActiveInactiveDate/>
    </>
  )
}


// JobFamily Layout
// const JobFamily = ({ onLogout }) => (
//   <>
//     <TopBar onLogout={onLogout} />
//     <LeftNavigation />
//     <JobFamily />
//   </>
// );

export default App;
