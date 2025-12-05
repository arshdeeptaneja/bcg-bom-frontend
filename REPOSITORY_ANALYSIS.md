# BCG-BOM Frontend - Repository Analysis & Architecture Documentation

**Project**: Bank of Maharashtra (BOM) Role Clarity & Appraisal Management System
**Type**: Enterprise HR Management Platform
**Framework**: React 19.1.1
**Last Updated**: 2025-11-06

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Application Architecture](#application-architecture)
5. [Routing System](#routing-system)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Key Features & Modules](#key-features--modules)
9. [Common Components](#common-components)
10. [Styling Approach](#styling-approach)
11. [Development Tools](#development-tools)
12. [Architecture Patterns](#architecture-patterns)
13. [Security & Improvements](#security--improvements)
14. [Quick Start Guide](#quick-start-guide)

---

## Overview

The BCG-BOM Frontend is an enterprise-grade HR management system built for Bank of Maharashtra. The application provides comprehensive tools for:

- **Role Clarity Management** - Define, allocate, and track employee roles and responsibilities
- **Performance Appraisal System** - Complete appraisal workflows with check-ins and KRA tracking
- **Team Analytics** - Real-time status tracking and performance visualization
- **HR Administrative Tools** - Bulk updates, exception handling, appeals, and system utilities

### Current Status
- **Branch**: `main` (clean working directory)
- **Recent Work**: Utilities redirect implementation, exceptions dashboard and list

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.1.1 | UI Framework |
| React DOM | ^19.1.1 | React rendering |
| React Router DOM | ^7.9.2 | Client-side routing |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| @reduxjs/toolkit | ^2.9.0 | State management |
| react-redux | ^9.2.0 | React-Redux bindings |
| redux-persist | ^6.0.0 | Persist Redux state |

### HTTP & API
| Technology | Version | Purpose |
|------------|---------|---------|
| axios | ^1.12.2 | HTTP client |

### UI Components & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| bootstrap | ^5.3.8 | CSS framework |
| react-icons | ^5.5.0 | Icon library |
| lucide-react | ^0.552.0 | Additional icons |
| react-spinners | ^0.17.0 | Loading indicators |

### Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| recharts | ^3.2.1 | Charts and graphs |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| react-toastify | ^11.0.5 | Toast notifications |

### Build & Development
| Technology | Version | Purpose |
|------------|---------|---------|
| react-scripts | 5.0.1 | Create React App build tools |
| @testing-library/react | ^16.3.0 | Testing utilities |
| @testing-library/jest-dom | ^6.8.0 | Jest matchers |
| prettier | (configured) | Code formatting |

---

## Project Structure

```
bcg-bom-frontend/
├── public/                           # Static assets
│   ├── index.html                   # Main HTML template
│   ├── Bank_of_Maharashtra_logo.svg # Bank logo
│   ├── BOM_icon.png                 # Favicon
│   └── login-bg.png                 # Login background
│
├── src/
│   ├── app/                         # App-level configurations
│   │
│   ├── assets/                      # Images, fonts, SVGs
│   │   └── fonts/                   # Custom fonts
│   │
│   ├── components/                  # Reusable components
│   │   ├── common/                  # Shared components
│   │   │   ├── TopBar/              # Application header
│   │   │   ├── LeftNavigation/      # Sidebar navigation
│   │   │   ├── BackButton/          # Navigation helper
│   │   │   ├── Modal/               # Modal component
│   │   │   ├── ToastMessage/        # Toast notifications
│   │   │   ├── Spinner/             # Loading spinners
│   │   │   ├── KpiTab/              # KPI tabs
│   │   │   └── ImageTab/            # Image tabs
│   │   │
│   │   ├── Appraisal/               # Appraisal-specific components
│   │   ├── KRA/                     # KRA metrics components
│   │   ├── TeamMembers/             # Team management components
│   │   ├── RoleClarity/             # Role clarity components
│   │   └── UserProfile/             # User profile components
│   │
│   ├── contexts/                    # React Context providers
│   │   └── AuthContext.js           # Authentication context
│   │
│   ├── features/                    # Redux Toolkit slices
│   │   └── dashboard/               # Dashboard state management
│   │       └── dashboardSlice.js    # Dashboard reducer
│   │
│   ├── Graphs/                      # Chart components
│   │
│   ├── hook/                        # Custom React hooks
│   │
│   ├── models/                      # Data models/types
│   │
│   ├── pages/                       # Page components
│   │   ├── Login/                   # Login page
│   │   ├── Welcome/                 # Landing page
│   │   ├── Dashboard/               # Main dashboard
│   │   ├── RoleAllocation/          # Role allocation
│   │   ├── RoleAcceptance/          # Role acceptance
│   │   ├── JobFamily/               # Job family management
│   │   ├── Panel/                   # Admin panel
│   │   │
│   │   └── Appraisal/               # Appraisal module pages
│   │       ├── AppraisalHome/       # Appraisal home
│   │       ├── AppraisalDashboard/  # Appraisal dashboard
│   │       ├── AppraiseeCheckIn/    # Employee check-in
│   │       ├── AppraisalCheckInForm/ # Check-in form
│   │       ├── ExceptionHome/       # Exception handling home
│   │       ├── ExceptionsList/      # List of exceptions
│   │       │
│   │       └── AppraisalHRDashboard/ # HR admin features
│   │           ├── AppraiserUpdate/
│   │           ├── AppraisalStatus/
│   │           ├── AppealComittee/
│   │           ├── ValidatorUpdate/
│   │           ├── ExceptionDelection/
│   │           ├── AppealDelection/
│   │           ├── ModuleActiveInactiveDate/
│   │           └── ReportingAuthorityBulk/
│   │
│   ├── services/                    # API services
│   │   ├── api.js                   # Main API client (Axios)
│   │   ├── dashboardService.js      # Dashboard API calls
│   │   ├── roleAcceptanceService.js # Role acceptance API
│   │   └── roleAllocationService.js # Role allocation API
│   │
│   ├── store/                       # Redux store configuration
│   │   └── store.js                 # Store setup with persist
│   │
│   ├── styles/                      # Global styles
│   │
│   ├── App.js                       # Main App component
│   ├── App.css                      # App styles
│   ├── index.js                     # Application entry point
│   └── index.css                    # Global styles
│
├── package.json                     # Dependencies and scripts
├── .prettierrc                      # Code formatting config
├── .gitignore                       # Git ignore rules
└── README.md                        # Project documentation
```

---

## Application Architecture

### Entry Point Flow

**File**: [src/index.js](src/index.js)

```javascript
// 1. Import Bootstrap CSS and custom styles
// 2. Dynamically load Font Awesome icons
// 3. Render App component inside React.StrictMode
// 4. Use ReactDOM.createRoot() for React 19
```

The application initializes with:
- Bootstrap CSS loaded first
- Font Awesome icons loaded from CDN
- React.StrictMode for development warnings
- Google Fonts (Lato) loaded in App.css

### Main App Structure

**File**: [src/App.js](src/App.js)

**Provider Hierarchy:**

```
<Provider store={store}>              // Redux store
  <PersistGate persistor={persistor}> // Redux persist (sessionStorage)
    <AuthProvider>                     // Auth context
      <AppContent>                     // Main app logic
        <ToastWrapper />               // Global notifications
        <Router>                       // React Router
          <Routes>                     // Route definitions
            <Route path="..." />       // Individual routes
          </Routes>
        </Router>
      </AppContent>
    </AuthProvider>
  </PersistGate>
</Provider>
```

### Layout Pattern

Most pages follow this composition pattern:

```jsx
const PageLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <PageContent />
  </>
);
```

This creates:
- Fixed top bar (72px height)
- Fixed left navigation (80px width)
- Main content area offset by both

---

## Routing System

### Route Configuration

The application uses **React Router DOM v7** with protected routes based on authentication status.

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | Login | Login page with CAPTCHA |

### Protected Routes - Core

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect | Redirects to welcome or login |
| `/welcome` | Welcome | Landing page after login |
| `/profile` | UserProfile | User profile page |

### Protected Routes - Role Clarity Module

| Path | Component | Description |
|------|-----------|-------------|
| `/rc/role-clarity` | Dashboard | Role clarity dashboard |
| `/rc/role-allocation` | RoleAllocation | Role allocation interface |
| `/bcg-bom/role-acceptance/get-kra-details/:empId` | RoleAcceptance | Role acceptance details |

### Protected Routes - Appraisal Module

| Path | Component | Description |
|------|-----------|-------------|
| `/appraisal/home` | AppraisalHome | Appraisal home page |
| `/appraisal/dashboard` | AppraisalDashboard | Appraisal dashboard |
| `/appraisal/appraisee-check-in` | AppraiseeCheckIn | Employee check-in - Appraisee-dashboard |
| `/appraisal/check-in-form` | AppraisalCheckInForm | Check-in form |
| `/appraisal/exception-home` | ExceptionHome | Exception handling home |
| `/appraisal/exceptions-list` | ExceptionsList | List of exceptions |
| `/appraisal/admin-panel` | AdminPanel | Admin panel |

### Protected Routes - HR Dashboard (Admin)

| Path | Component | Description |
|------|-----------|-------------|
| `/appraisal/hr-dashboard` | HRDashboard | Main HR dashboard |
| `/appraisal/hr-dashboard/appraisal-update` | AppraiserUpdate | Update appraisals |
| `/appraisal/hr-dashboard/appraisal-status-change-utility` | AppraisalStatus | Change statuses |
| `/appraisal/hr-dashboard/appeal-comittee` | AppealComittee | Appeal committee management |
| `/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulk` | ReportingAuthorityBulk | Bulk authority updates |
| `/appraisal/hr-dashboard/validator-update-utility` | ValidatorUpdate | Validator updates |
| `/appraisal/hr-dashboard/exception-delection-utility` | ExceptionDelection | Exception deletion |
| `/appraisal/hr-dashboard/Appeal-delection-utility` | AppealDelection | Appeal deletion |
| `/appraisal/hr-dashboard/module-active-inactive-date` | ModuleActiveInactiveDate | Module date management |

### Protected Routes - Other

| Path | Component | Description |
|------|-----------|-------------|
| `/jobFamily` | JobFamily | Job family management |
| `/api-test` | ApiTest | API testing page |

### Route Protection Pattern

```jsx
{isAuthenticated ? (
  <Component />
) : (
  <Navigate to="/login" replace />
)}
```

---

## State Management

### Redux Toolkit Setup

**File**: [src/store/store.js](src/store/store.js)

**Configuration:**
- **Storage**: SessionStorage (not localStorage)
- **Persisted Slices**: Dashboard slice
- **Middleware**: Redux Thunk (default)

**Store Structure:**

```javascript
{
  dashboard: {
    statusCounts: { GREEN, RED, YELLOW, BLACK, GRAY },
    teamMembers: [],
    statusIcons: {},
    refreshTrigger: 0
  }
}
```

### Dashboard Slice

**File**: [src/features/dashboard/dashboardSlice.js](src/features/dashboard/dashboardSlice.js)

**State Shape:**

```javascript
{
  statusCounts: {
    GREEN: 0,
    RED: 0,
    YELLOW: 0,
    BLACK: 0,
    GRAY: 0
  },
  teamMembers: [],
  statusIcons: {
    GREEN: <FaCheckCircle />,
    RED: <FaTimesCircle />,
    YELLOW: <FaExclamationTriangle />,
    BLACK: <FaMinusCircle />,
    GRAY: <FaQuestionCircle />
  },
  refreshTrigger: 0
}
```

**Actions:**

- `setStatusCounts(counts)` - Update status counts
- `setTeamMembers(members)` - Set team member list
- `setStatusIcons(icons)` - Update status icons
- `triggerDashboardRefresh()` - Force dashboard refresh
- `updateRoleStatus({ empId, status })` - Update individual role status

**Usage Example:**

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { setStatusCounts, updateRoleStatus } from './features/dashboard/dashboardSlice';

const statusCounts = useSelector(state => state.dashboard.statusCounts);
dispatch(setStatusCounts({ GREEN: 10, RED: 5, YELLOW: 3 }));
```

### Auth Context

**File**: [src/contexts/AuthContext.js](src/contexts/AuthContext.js)

**Context State:**

```javascript
{
  user: null,              // Current user data
  isAuthenticated: false,  // Authentication status
  loading: true,          // Loading state
  dashboardData: null,    // Dashboard data cache
  statusCount: null,      // Status counts
  teamData: []           // Team data
}
```

**Context Methods:**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `login` | `(userData, tokens, dashboardData)` | Handle login and store tokens |
| `logout` | `()` | Clear auth data and redirect |
| `updateUser` | `(updates)` | Update user information |
| `getUserProperty` | `(path, defaultValue)` | Safe property access |
| `hasRole` | `(role)` | Check if user has specific role |
| `getEmployeeDetails` | `()` | Get employee details for API |
| `getDebugInfo` | `()` | Debug utility for auth state |

**Storage Strategy:**

```javascript
// LocalStorage keys used:
- 'accessToken'          // JWT access token
- 'refreshToken'         // JWT refresh token
- 'user'                 // User basic data
- 'userDetailedInfo'     // Detailed user info
```

**Usage Example:**

```javascript
import { useAuth } from './contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();

// Login
await login(userData, { accessToken, refreshToken }, dashboardData);

// Check role
if (hasRole('ADMIN')) {
  // Show admin features
}

// Logout
logout();
```

---

## API Integration

### API Client Configuration

**File**: [src/services/api.js](src/services/api.js)

**Base URL**: `http://180.149.245.93:8090`

**Axios Instance Setup:**

```javascript
const api = axios.create({
  baseURL: 'http://180.149.245.93:8090',
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Request Interceptor

Automatically adds authentication token to all requests:

```javascript
// Request interceptor adds:
- Authorization: Bearer <token>
- Content-Type: application/json
- Accept: application/json
```

### Response Interceptor

Handles token refresh automatically:

```javascript
// On 401 error:
1. Extract refresh token from localStorage
2. Call /auth/refresh-token endpoint
3. Update access token
4. Retry original request
5. If refresh fails, logout and redirect to login
```

### API Services

#### Authentication API

**Methods:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `login(credentials)` | `POST /auth/login` | User login |
| `refreshToken(refreshToken)` | `POST /auth/refresh-token` | Refresh access token |
| `logout()` | `POST /auth/logout` | User logout |

#### User API

**Methods:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getProfile()` | `GET /user/profile` | Get user profile |
| `getRoles()` | `GET /user/roles` | Get user roles |
| `getKRAMetrics()` | `GET /user/kra-metrics` | Get KRA metrics |
| `getTeamMembers()` | `GET /user/team-members` | Get team members |

#### CAPTCHA API

**Methods:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getCaptchaImage()` | `GET /captcha/generate` | Generate CAPTCHA |
| `validateCaptcha(id, input)` | `POST /captcha/validate` | Validate CAPTCHA |
| `getCaptchaImageByRefresh(id)` | `GET /captcha/refresh/:id` | Refresh CAPTCHA |

#### Dashboard API

**File**: [src/services/dashboardService.js](src/services/dashboardService.js)

**Methods:**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getRCTDashboard` | `(empNo, sol, unitType, empDsg)` | Get role clarity dashboard |
| `getDashboardDetails` | `()` | Get detailed dashboard data |
| `getDashboardMetrics` | `(empNo)` | Get metrics |
| `getTeamPerformance` | `(sol, unitType)` | Get team performance |

#### Access Service

**Methods:**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getAccessModuleWise` | `(empId, unitType, role)` | Get module-wise access |

### API Usage Pattern

```javascript
import { authAPI, userAPI, dashboardAPI } from './services/api';

// Login
const response = await authAPI.login({
  username: 'user@example.com',
  password: 'password123',
  captchaId: 'captcha-id',
  captchaInput: '1234'
});

// Get dashboard data
const dashboard = await dashboardAPI.getRCTDashboard(
  empNo,
  sol,
  unitType,
  empDsg
);

// Get user profile
const profile = await userAPI.getProfile();
```

---

## Key Features & Modules

### Module 1: Authentication & Authorization

**Components**: Login, AuthContext

**Features:**
- CAPTCHA-based login for security
- JWT token management with automatic refresh
- Role-based access control (RBAC)
- Persistent authentication using localStorage
- Automatic token refresh on 401 errors
- Secure logout with token cleanup

**User Roles:**
- Employee
- Appraiser
- Validator
- HR Admin
- Appeal Committee

**Login Flow:**
```
1. User enters credentials
2. System generates CAPTCHA
3. User validates CAPTCHA
4. Backend authenticates user
5. JWT tokens stored in localStorage
6. User data stored in AuthContext
7. Redirect to welcome page
```

### Module 2: Role Clarity Tool (RCT)

**Purpose**: Define and manage employee roles and responsibilities

**Features:**

1. **Dashboard** ([src/pages/Dashboard](src/pages/Dashboard))
   - Overview of role assignments
   - Status-based tracking (Green/Red/Yellow/Black/Gray)
   - Team member visualization
   - Performance metrics

2. **Role Allocation** ([src/pages/RoleAllocation](src/pages/RoleAllocation))
   - Assign roles to employees
   - Bulk role updates
   - Role history tracking

3. **Role Acceptance** ([src/pages/RoleAcceptance](src/pages/RoleAcceptance))
   - Employees review assigned roles
   - Accept or request changes
   - KRA details view

4. **KRA Metrics** ([src/components/KRA](src/components/KRA))
   - Key Result Areas tracking
   - Measurable and non-measurable KRAs
   - Performance indicators

5. **Team Members** ([src/components/TeamMembers](src/components/TeamMembers))
   - View team structure
   - Member details and roles
   - Status tracking

6. **Job Family** ([src/pages/JobFamily](src/pages/JobFamily))
   - Manage job families
   - Define role categories
   - Hierarchy management

**Status Colors:**
- **GREEN**: Role accepted and active
- **RED**: Role pending or rejected
- **YELLOW**: Role requires attention
- **BLACK**: Role inactive
- **GRAY**: Role status unknown

### Module 3: Appraisal System

**Purpose**: Comprehensive performance appraisal management

#### Employee Features

1. **Appraisal Home** ([src/pages/Appraisal/AppraisalHome](src/pages/Appraisal/AppraisalHome))
   - Appraisal overview
   - Current appraisal status
   - Action items

2. **Appraisal Dashboard** ([src/pages/Appraisal/AppraisalDashboard](src/pages/Appraisal/AppraisalDashboard))
   - Performance metrics
   - KRA progress
   - Historical data

3. **Self Check-In** ([src/pages/Appraisal/AppraiseeCheckIn](src/pages/Appraisal/AppraiseeCheckIn))
   - Regular check-in submissions
   - Progress updates
   - Goal tracking

4. **Check-In Form** ([src/pages/Appraisal/AppraisalCheckInForm](src/pages/Appraisal/AppraisalCheckInForm))
   - Detailed check-in form
   - KRA updates
   - Development inputs

5. **Exceptions** ([src/pages/Appraisal/ExceptionHome](src/pages/Appraisal/ExceptionHome), [ExceptionsList](src/pages/Appraisal/ExceptionsList))
   - Handle exceptional cases
   - Request special considerations
   - View exception status

#### HR Admin Features

**HR Dashboard** ([src/pages/Appraisal/AppraisalHRDashboard](src/pages/Appraisal/AppraisalHRDashboard))

1. **Appraiser Update** ([AppraiserUpdate](src/pages/Appraisal/AppraisalHRDashboard/AppraiserUpdate))
   - Update appraiser assignments
   - Change reporting relationships

2. **Appraisal Status Change** ([AppraisalStatus](src/pages/Appraisal/AppraisalHRDashboard/AppraisalStatus))
   - Bulk status updates
   - Workflow management

3. **Appeal Committee** ([AppealComittee](src/pages/Appraisal/AppraisalHRDashboard/AppealComittee))
   - Manage appeal committees
   - Assign committee members
   - Review appeals

4. **Reporting Authority Bulk** ([ReportingAuthorityBulk](src/pages/Appraisal/AppraisalHRDashboard/ReportingAuthorityBulk))
   - Bulk update reporting authorities
   - Bulk update reviewing authorities
   - CSV import/export

5. **Validator Update** ([ValidatorUpdate](src/pages/Appraisal/AppraisalHRDashboard/ValidatorUpdate))
   - Update validator assignments
   - Manage validation workflow

6. **Exception Deletion** ([ExceptionDelection](src/pages/Appraisal/AppraisalHRDashboard/ExceptionDelection))
   - Remove exceptions
   - Cleanup utility

7. **Appeal Deletion** ([AppealDelection](src/pages/Appraisal/AppraisalHRDashboard/AppealDelection))
   - Remove appeals
   - Administrative cleanup

8. **Module Date Management** ([ModuleActiveInactiveDate](src/pages/Appraisal/AppraisalHRDashboard/ModuleActiveInactiveDate))
   - Set module active dates
   - Configure appraisal periods
   - Schedule workflows

#### Appraisal Components

**Components** ([src/components/Appraisal](src/components/Appraisal)):
- MeasurableKRATable - Display measurable KRAs
- NonMeasurableKRATable - Display non-measurable KRAs
- DevelopmentInputs - Development goals
- FinalScoreSummary - Appraisal scores
- CheckInDescription - Check-in details
- RoleTimeline - Role history timeline
- EmployeeAppraisalCard - Employee card
- ExceptionListTable - Exception list view

### Module 4: Dashboard & Analytics

**Features:**
- Real-time status tracking
- Team performance visualization
- Status-based role monitoring
- Interactive charts using Recharts
- Performance metrics display
- Historical data analysis

**Status Categories:**
- GREEN: On track
- RED: Needs attention
- YELLOW: Warning
- BLACK: Critical
- GRAY: No data

**Analytics Components:**
- Performance trends
- Team comparisons
- KRA completion rates
- Appraisal status distribution

### Module 5: Admin Panel

**Features:**
- System administration
- User management
- Configuration utilities
- Bulk operations
- Data management tools

---

## Common Components

**Location**: [src/components/common](src/components/common)

### Layout Components

| Component | Purpose | Props |
|-----------|---------|-------|
| **TopBar** | Application header | `onLogout` |
| **LeftNavigation** | Sidebar navigation menu | - |
| **BackButton** | Navigation helper | `onClick`, `label` |

### UI Components

| Component | Purpose | Library |
|-----------|---------|---------|
| **Modal** | Reusable modal dialogs | Bootstrap |
| **ToastMessage** | Global notifications | react-toastify |
| **Spinner** | Loading indicators | react-spinners |

### Display Components

| Component | Purpose |
|-----------|---------|
| **KpiTab** | KPI display tabs |
| **ImageTab** | Image display tabs |

### Component Usage

```jsx
// TopBar
<TopBar onLogout={handleLogout} />

// LeftNavigation
<LeftNavigation />

// Modal
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
>
  <ModalContent />
</Modal>

// Toast
import { toast } from 'react-toastify';
toast.success('Operation successful!');
toast.error('An error occurred');

// Spinner
<Spinner loading={isLoading} />
```

---

## Styling Approach

### CSS Strategy

**Approach**: Traditional CSS files with Bootstrap 5 framework

**Files:**
- [src/index.css](src/index.css) - Global styles and CSS variables
- [src/App.css](src/App.css) - App-level styles
- Component-specific CSS files alongside components

### Bootstrap Integration

**Version**: 5.3.8

**Bootstrap Components Used:**
- Grid system (Container, Row, Col)
- Form controls
- Buttons
- Cards
- Tables
- Modals
- Alerts
- Badges

**Bootstrap Icons**: Loaded via CDN (v1.11.3)

### Font Configuration

**Primary Font**: 'Lato' (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');

body {
  font-family: 'Lato', sans-serif;
}
```

### Theme Colors

**File**: [src/index.css](src/index.css)

```css
:root {
  --bs-primary: #0389d0;
  --bs-primary-rgb: 3, 137, 208;
}
```

### Layout System

**Fixed Layout Structure:**

```css
/* Top Bar */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  z-index: 1000;
}

/* Left Navigation */
.left-nav {
  position: fixed;
  top: 72px;
  left: 0;
  width: 80px;
  height: calc(100vh - 72px);
  z-index: 999;
}

/* Page Content */
.pageWrapper {
  margin-left: 80px;      /* Left nav offset */
  margin-top: 72px;       /* Top bar offset */
  padding: 24px;
  min-height: calc(100vh - 72px);
}
```

### Icon Libraries

**Font Awesome**: v6.0.0 (CDN)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
```

**React Icons**: v5.5.0 (npm)
```javascript
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
```

**Lucide React**: v0.552.0 (npm)
```javascript
import { Check, X } from 'lucide-react';
```

### Responsive Design

- Bootstrap grid system for responsive layouts
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl, xxl

---

## Development Tools

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (port 3000) |
| `npm build` | Create production build |
| `npm test` | Run tests in watch mode |
| `npm run eject` | Eject from Create React App |

### Code Formatting

**Prettier Configuration** ([.prettierrc](.prettierrc)):

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Testing

**Testing Libraries:**
- Jest (included with CRA)
- React Testing Library v16.3.0
- @testing-library/jest-dom v6.8.0
- @testing-library/user-event v13.5.0

**Test File Convention:**
- `*.test.js` or `*.test.jsx`
- `*.spec.js` or `*.spec.jsx`
- `__tests__/` directory

### Build Configuration

**Build Tool**: Webpack (via Create React App)

**Output:**
- Production build in `build/` directory
- Optimized and minified assets
- Code splitting (automatic)
- Source maps for debugging

**Environment Variables:**
- Prefix with `REACT_APP_`
- Defined in `.env` files
- Accessed via `process.env.REACT_APP_*`

---

## Architecture Patterns

### 1. Layout Composition Pattern

Consistent layout across pages using composition:

```jsx
const DashboardLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />
    <div className="pageWrapper">
      <Dashboard />
    </div>
  </>
);
```

**Benefits:**
- Consistent UI across pages
- Reusable layout components
- Easy to maintain

### 2. Service Layer Pattern

API calls abstracted into service classes:

```javascript
// Instead of axios calls in components:
const data = await DashboardService.getRCTDashboard(empNo, sol, unitType);

// Instead of direct API calls:
import { dashboardAPI } from './services/api';
const data = await dashboardAPI.getDashboardData();
```

**Benefits:**
- Centralized API logic
- Easier testing
- Reusable across components

### 3. Protected Route Pattern

Authentication checked on each route:

```jsx
{isAuthenticated ? (
  <PageComponent />
) : (
  <Navigate to="/login" replace />
)}
```

**Benefits:**
- Security enforcement
- Consistent auth checking
- Automatic redirects

### 4. Context + Redux Hybrid

**Context API**: Authentication state, user data
**Redux**: Dashboard data, team members, status counts

**Rationale:**
- Context for authentication (used everywhere)
- Redux for shared dashboard state (complex updates)

**Usage:**
```javascript
// Auth from Context
const { user, isAuthenticated } = useAuth();

// Dashboard from Redux
const statusCounts = useSelector(state => state.dashboard.statusCounts);
```

### 5. Token Refresh Strategy

Automatic token refresh using Axios interceptors:

```javascript
// Response interceptor pattern:
1. Request fails with 401
2. Intercept response
3. Call refresh token endpoint
4. Update access token
5. Retry original request
6. Return response to caller
```

**Benefits:**
- Seamless user experience
- No manual token handling
- Automatic session extension

### 6. Toast Notification Pattern

Global notification system using react-toastify:

```javascript
import { toast } from 'react-toastify';

// Success
toast.success('Role accepted successfully');

// Error
toast.error('Failed to save changes');

// Warning
toast.warning('Session expiring soon');

// Info
toast.info('New update available');
```

**Benefits:**
- Consistent user feedback
- Non-blocking notifications
- Easy to use throughout app

---

## Security & Improvements

### Security Concerns

#### 1. Hardcoded API URL ⚠️

**Issue**: API base URL hardcoded in [src/services/api.js](src/services/api.js)

```javascript
const api = axios.create({
  baseURL: 'http://180.149.245.93:8090', // Hardcoded
});
```

**Recommendation**: Use environment variables

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});
```

#### 2. Authentication Bypass ⚠️

**Issue**: Authentication bypass in [src/App.js](src/App.js)

```javascript
// TODO: For testing purposes, remove this later
isAuthenticated = true;
```

**Recommendation**: Remove this line before production deployment

#### 3. HTTP Instead of HTTPS ⚠️

**Issue**: API URL uses HTTP instead of HTTPS

**Recommendation**: Use HTTPS for production:
```javascript
baseURL: 'https://api.bankofmaharashtra.in'
```

#### 4. Token Storage in LocalStorage

**Current**: Tokens stored in localStorage
```javascript
localStorage.setItem('accessToken', token);
```

**Consideration**:
- LocalStorage is vulnerable to XSS attacks
- Consider using httpOnly cookies for production
- Current approach is acceptable for internal enterprise apps

### Code Quality Issues

#### 1. Inconsistent Naming

**Issue**: "Delection" instead of "Deletion"
- [ExceptionDelection](src/pages/Appraisal/AppraisalHRDashboard/ExceptionDelection)
- [AppealDelection](src/pages/Appraisal/AppraisalHRDashboard/AppealDelection)

**Recommendation**: Rename to "Deletion"

#### 2. Mixed State Management

**Issue**: Both Context and Redux used for similar purposes

**Recommendation**:
- Use Context for authentication only
- Move all other state to Redux
- Or use only Context with useReducer

#### 3. Commented Code

**Issue**: Commented authentication checks in routes

**Recommendation**: Remove commented code before production

### Performance Improvements

#### 1. No Code Splitting

**Issue**: All routes loaded upfront

**Recommendation**: Use React.lazy() and Suspense

```javascript
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

#### 2. No Lazy Loading

**Issue**: Heavy components loaded immediately

**Recommendation**: Lazy load heavy components (charts, forms)

#### 3. No Route-Based Code Splitting

**Issue**: Single bundle for entire app

**Recommendation**: Split code by route

```javascript
const AppraisalDashboard = React.lazy(() =>
  import('./pages/Appraisal/AppraisalDashboard')
);
```

### Recommended Improvements

1. **Environment Configuration**
   - Add `.env` files for different environments
   - Use `dotenv` for configuration
   - Separate dev/staging/production configs

2. **Error Boundaries**
   - Add React Error Boundaries
   - Graceful error handling
   - User-friendly error messages

3. **Loading States**
   - Add skeleton loaders
   - Better loading indicators
   - Progressive loading

4. **Accessibility**
   - Add ARIA labels
   - Keyboard navigation
   - Screen reader support

5. **Testing**
   - Add unit tests
   - Add integration tests
   - Add E2E tests with Cypress

6. **Documentation**
   - Add JSDoc comments
   - API documentation
   - Component storybook

7. **CI/CD**
   - Add GitHub Actions
   - Automated testing
   - Automated deployment

---

## Quick Start Guide

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bcg-bom-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Development Server

```bash
npm start
```

- Opens browser at http://localhost:3000
- Hot module replacement enabled
- Error overlay in browser

### Building for Production

```bash
npm run build
```

- Creates optimized production build in `build/`
- Minified and optimized assets
- Ready for deployment

### Running Tests

```bash
npm test
```

- Runs tests in watch mode
- Interactive test runner
- Coverage reports

### Code Formatting

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Environment Setup

Create `.env` file in root:

```env
REACT_APP_API_BASE_URL=http://180.149.245.93:8090
REACT_APP_ENV=development
```

### Deployment

```bash
# Build for production
npm run build

# Serve build folder with static server
npx serve -s build
```

### Project Structure Overview

```
src/
├── components/    # Reusable UI components
├── pages/        # Route-based page components
├── services/     # API services
├── contexts/     # React Context providers
├── features/     # Redux slices
├── store/        # Redux store
├── assets/       # Static assets
└── App.js        # Main app component
```

### Common Commands

```bash
# Install new package
npm install <package-name>

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Additional Resources

### Related Documentation

- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [React Router Documentation](https://reactrouter.com)
- [Bootstrap Documentation](https://getbootstrap.com)
- [Axios Documentation](https://axios-http.com)

### Git Repository

- **Current Branch**: `main`
- **Main Branch**: `main`
- **Recent Work**: Utilities redirect, exceptions dashboard

### Support & Contact

For questions or issues with this repository:
1. Check existing documentation
2. Review code comments
3. Contact development team
4. Create GitHub issue

---

**Last Updated**: 2025-11-06
**Maintained By**: BCG Development Team
**Version**: 1.0.0
