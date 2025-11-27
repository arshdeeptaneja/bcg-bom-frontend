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
  AppraiserCheckIn,
  Appraisalstatus,
  ReportingAuthority,
  ValidatorUpdateUtility,
  ExceptionDelection,
  ModuleActiveInactiveDate,
  AppealComittee,
  AppraisalCheckInForm,
  ExceptionHome,
  ExceptionVerify,
  ExceptionsList,
  ExceptionValidations,
  QuarterlyException,
  EmployeeExceptionList,
  ReviewQuarterlyException,
  EmployeeQuarterlyExceptions,
  EmployeeAppealList,
  AppraiserDashboard,
  AnnualAppraisalHome,
  AppraiserAddAppraisal,
  AppraiseeDashboard,
  AddAppeal,
  QuarterlyAppraisee,
  QuaterlyAppraiseeCheckIn,
  QuarterlyAppraiserBulk,
  AppealDelection,
  ReviewerDashboard,
  ReviewerMode,
  AnnualAppraisalReview,
  AnnualReview,
  AnnualReviewView,
  QuaterlyAppraiserCheckIn,
} from './pages';
import AppealCommitteeReview from './pages/Appeal/AppealCommittee/AppealCommitteeReview/AppealCommitteeReview';
import ReviewAppeal from './pages/Appeal/AnnualAppeal/ReviewAppeal/ReviewAppeal';
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
import AppraiserCheckInDashboard from './pages/Appraiser/AppraiserDashboardCheckIn/AppraiserCheckInDashboard';
import EmployeeAppraisalCard from './components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeQuarterlyException from './pages/Appraisal/QuarterlyException/EmployeeQuarterlyException';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ExceptionScore from './pages/Appraisal/AppraisalHRDashboard/ExceptionScore/ExceptionScore';
import AdminSetting from './pages/Appraisal/AppraisalHRDashboard/AdminSetting/AdminSetting';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent />
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </AuthProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

// App content that uses AuthContext
function AppContent() {
  const { isAuthenticated, loading, login, logout, setTeamDashboardData } = useAuth();

  console.log('isAuthenticated', isAuthenticated);

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
                isAuthenticated ? (
                  <WelcomeLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
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
              path="/appraisal/exception-resolution"
              element={
                isAuthenticated ? (
                  <ExceptionHomeLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/exception-verify"
              element={
                isAuthenticated ? (
                  <ExceptionVerifyLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/exceptions-list"
              element={
                isAuthenticated ? (
                  <ExceptionsListLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/exception-validations"
              element={
                isAuthenticated ? (
                  <ExceptionValidationsLayout onLogout={handleLogout} />
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
              path="/appraisal/appraiser-check-in"
              element={
                isAuthenticated ? (
                  <AppraiserCheckInLayout onLogout={handleLogout} />
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
              path="/appraisal/check-in-form"
              element={
                isAuthenticated ? (
                  <AppraisalCheckInFormLayout onLogout={handleLogout} />
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

            <Route
              path="/appraisal/exception-quarterly"
              element={
                isAuthenticated ? (
                  <ExceptionQuarterly onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/review-exception-list"
              element={
                isAuthenticated ? (
                  <ReviewExceptionList onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/review-quarterly-exception"
              element={
                isAuthenticated ? (
                  <ReviewQuarterlyExceptionLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/employee-review-quarterly-exception"
              element={
                isAuthenticated ? (
                  <EmployeeQuarterlyExceptionListLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appeal-resolutions/annual-appeal/employee-appeal-list"
              element={
                isAuthenticated ? (
                  <AnnualEmployeeAppealListLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appeal/committee-review"
              element={
                isAuthenticated ? (
                  <AppealCommitteeReviewLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appeal/review"
              element={
                isAuthenticated ? (
                  <AppealReviewLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraiser/dashboard"
              element={
                isAuthenticated ? (
                  <AppraiserDashboardLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraiser/reviewer-dashboard"
              element={
                isAuthenticated ? (
                  <ReviewerDashboardLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraiser/annual-appraisal-home"
              element={
                isAuthenticated ? (
                  <AnnualAppraisalHomeLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraiser/add-appraisal"
              element={
                isAuthenticated ? (
                  <AppraiserAddAppraisalLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraiser/reviewer-mode"
              element={
                isAuthenticated ? (
                  <ReviewerModeLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/annual/appraisee/appraisee-dashboard"
              element={
                isAuthenticated ? (
                  <AppraiseeDashboardLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/annual/add-appeal"
              element={
                isAuthenticated ? (
                  <AddAppealLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/quarterly/quarterly-appraisee"
              element={
                isAuthenticated ? (
                  <QuarterlyAppraiseeLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/quarterly/quaterly-appraisee-check-in"
              element={
                isAuthenticated ? (
                  <QuaterlyAppraiseeCheckInLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

{/* <Route
  path="/quarterly/quaterly-appraiser-check-in"
  element={
    isAuthenticated ? (
      <QuaterlyAppraiserCheckInLayout onLogout={handleLogout} />
    ) : (
      <Navigate to="/login" replace />
    )
  }
 /> */}

              <Route
              path="/utility/quarterly-appraiser-bulk"
              element={
                isAuthenticated ? (
                  <QuarterlyAppraiserBulkLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/exception-score"
              element={
                isAuthenticated ? (
                  <ExceptionScoreLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/appraisal/hr-dashboard/admin-setting"
              element={
                isAuthenticated ? (
                  <AdminSettingLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/hr-dashboard/appeal-delection"
              element={
                isAuthenticated ? (
                  <AppealDeletionLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/annual/appraiser-review"
              element={
                isAuthenticated ? (
                  <AnnualAppraisalReviewLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/annual/reviewer"
              element={
                isAuthenticated ? (
                  <AnnualReviewLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/appraisal/annual/view"
              element={
                isAuthenticated ? (
                  <AnnualReviewViewLayout onLogout={handleLogout} />
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

const AppraiserCheckInLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      {/* <AppraiserCheckIn /> */}
      <AppraiserCheckInDashboard />
    </>
  );
};

const ExceptionQuarterly = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <QuarterlyException />
    </>
  );
};
const ReviewExceptionList = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <EmployeeExceptionList />
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
  );
};
//appraisal update
const AppraisaUpdated = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppraiserUpdate />
    </>
  );
};

//Appraisal Status Change Utility
const AppraisalStatusChangeUtility = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <Appraisalstatus />
    </>
  );
};

//Reporting & Reviewing Authority Update by Emp Number
const AppraisalAppealComittee = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppealComittee />
    </>
  );
};

//ReportingAuthorityBulk
const ReportingAuthorityReviewBulk = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ReportingReviewBulk />
    </>
  );
};

//ValidatorUpdateUtility
const ValidatorUpdateUtilities = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ValidatorUpdateUtility />
    </>
  );
};
//ExceptionDelection
const ExceptionDelectionUtilities = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ExceptionDelection />
    </>
  );
};

//ExceptionDelection
const AppealDelectionUtilities = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppealDeletion />
    </>
  );
};
// ModuleActiveInactiveDate
const MoulesActiveInactiveDate = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ModuleActiveInactiveDate />
    </>
  );
};
const AppraisalCheckInFormLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <AppraisalCheckInForm />
    </>
  );
};

const ExceptionHomeLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ExceptionHome />
    </>
  );
};

const ExceptionVerifyLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ExceptionVerify />
    </>
  );
};

const ExceptionsListLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ExceptionsList />
    </>
  );
};

const ExceptionValidationsLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ExceptionValidations />
    </>
  );
};

// ReviewQuarterlyException

const ReviewQuarterlyExceptionLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      <ReviewQuarterlyException />
    </>
  );
};

//Employee Quarterly Exception
const EmployeeQuarterlyExceptionListLayout = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      {/* <EmployeeQuarterlyExceptions /> */}
      <EmployeeQuarterlyException />
    </>
  );
};

// Annual Employee Appeal List
const AnnualEmployeeAppealListLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <EmployeeAppealList />
  </>
);

// Appraiser Dashboard
const AppraiserDashboardLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AppraiserDashboard />
  </>
);

const ReviewerDashboardLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <ReviewerDashboard />
  </>
);

const ReviewerModeLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <ReviewerMode />
  </>
);

//AnnualAppraisalHome
const AnnualAppraisalHomeLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AnnualAppraisalHome />
  </>
);
//AppraiserAddAppraisal

const AppraiserAddAppraisalLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AppraiserAddAppraisal />
  </>
);

//AppraiseeDashboard

const AppraiseeDashboardLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AppraiseeCheckIn />
  </>
);

//Add appeal (Annual)

const AddAppealLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AddAppeal />
  </>
);

//  Quaererly Appraisee
const QuarterlyAppraiseeLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <QuarterlyAppraisee />
  </>
);

//Quaterly  Appraisee Check In
const QuaterlyAppraiseeCheckInLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <QuaterlyAppraiseeCheckIn />
  </>
);


//Quarterly Appraiser details in bulk utility
const QuarterlyAppraiserBulkLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
  <QuarterlyAppraiserBulk />
  </>
);

const ExceptionScoreLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
   <ExceptionScore />
  </>
);

const AdminSettingLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AdminSetting />
  </>
);


const AppealDeletionLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AppealDelection />
  </>
);

// Appeal Committee Review
const AppealCommitteeReviewLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AppealCommitteeReview />
  </>
);

// Appeal Review (Appraiser/Reviewing Authority)
const AppealReviewLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <ReviewAppeal />
  </>
);

// Annual Appraisal Review (Appraiser/Reviewer)
const AnnualAppraisalReviewLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AnnualAppraisalReview />
  </>
);

// Annual Review (Reviewer/Acceptor)
const AnnualReviewLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AnnualReview />
  </>
);

// Annual Review View-Only
const AnnualReviewViewLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <AnnualReviewView />
  </>
)
//QuaterlyAppraiserCheckIn
const QuaterlyAppraiserCheckInLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <QuaterlyAppraiserCheckIn />
  </>
);

export default App;
