# BCG-BOM Frontend: AI Agent Instructions

**Bank of Maharashtra Role Clarity & Appraisal Management System**

## Architecture Overview

This is a React 19 enterprise HR platform with three main modules:
1. **Role Clarity Tool (RCT)** - Role assignment and KRA tracking (`/rc/*`)
2. **Appraisal System** - Quarterly/Annual appraisals with check-ins (`/appraisal/*`)
3. **HR Admin Tools** - Bulk utilities and system configuration (`/appraisal/hr-dashboard/*`)

## State Management: Hybrid Approach

**Critical:** Uses BOTH Context and Redux - understand when to use each:

- **AuthContext** (`src/contexts/AuthContext.js`) - Authentication, user data, tokens
  - Access via: `const { user, isAuthenticated, login, logout } = useAuth()`
  - User data stored in `localStorage.userData` (combined from login response)
  - Employee ID accessed: `getUserProperty('empNo')` or `user?.EMP_ID`

- **Redux** (`src/features/dashboard/dashboardSlice.js`) - Dashboard state only
  - Uses `sessionStorage` via redux-persist (NOT localStorage)
  - Only for: status counts, team members, dashboard refresh triggers
  - Access via: `useSelector(state => state.dashboard.statusCounts)`

- **React Query** (`@tanstack/react-query`) - Server state, used increasingly in newer pages
  - Client configured in `App.js` with 5min stale time
  - Pattern: `const { data, isLoading } = useQuery({ queryKey: [...], queryFn: ... })`
  - Used in: `AppraisalHome`, `AppraiseeCheckIn`, `ExceptionHome`

## API Architecture

**Base URL:** `http://localhost:8084` (hardcoded in `src/services/api.js`)

**API Client Pattern:**
```javascript
// Named API services (preferred)
import { appraisalAPI, authAPI, dashboardAPI } from './services/api';
const data = await appraisalAPI.getAppraisalHomeDashboard({ empNo, role, ... });

// Generic wrapper (for new endpoints)
import { api } from './services/api';
const result = await api.get('/appraisal/endpoint', { params: {...} });
```

**Token Management:** Automatic via axios interceptors
- Hardcoded Bearer token in request interceptor (development bypass)
- 401 responses trigger auto-refresh flow using `localStorage.refreshToken`
- On refresh failure: clears storage and redirects to `/login`

**CAPTCHA Flow:** 
- Generate: `generateCaptchaAPI.getCaptchaImage()` returns `{id, image}`
- Validate: `generateCaptchaAPI.validateCaptcha(captchaId, userInput)`
- Used only in `Login.js`

## Routing Patterns

**Layout Composition:** All protected routes follow this structure:
```javascript
const PageLayout = ({ onLogout }) => (
  <>
    <TopBar onLogout={onLogout} />
    <LeftNavigation />  {/* 80px fixed left sidebar */}
    <div className="pageWrapper"> {/* offset: 75px left, 34px top */}
      <PageContent />
    </div>
  </>
);
```

**Route Protection:** Currently bypassed in `App.js` with `isAuthenticated = true` (TODO comment)
- Remove this before production
- Proper pattern: `isAuthenticated ? <Component /> : <Navigate to="/login" />`

**Dynamic Navigation:** `LeftNavigation.js` fetches accessible tools via `accessService.getAccessModuleWise()`
- Falls back to role-based menus (Zonal Head, Branch Head, etc.)
- Filters `toolsSubmenu` array based on API response

## Data Flow Conventions

**User Data Access:**
```javascript
// In components with useAuth
const { user, getEmployeeDetails, getUserProperty } = useAuth();
const empNo = getUserProperty('empNo') || user?.EMP_ID;

// Fallback pattern (seen throughout codebase)
const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '36663');
```

**localStorage Keys:**
- `accessToken` - JWT (auto-attached to requests)
- `refreshToken` - For token refresh
- `userData` - Combined user object (from login `user` + `userDetailedInfo[0]`)
- `user` - Original user object from login
- `userDetailedInfo` - Array from login response

**Financial Year Pattern:**
```javascript
// Format: "FY 2024-25"
const getFinancialYears = () => {
  const now = new Date();
  const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 3 }, (_, i) => {
    const start = currentYear - i;
    const end = (start + 1).toString().slice(2);
    return `FY ${start}-${end}`;
  });
};
```

## Component Patterns

**Page Component Structure:**
1. Import common layout: `import { TopBar, LeftNavigation } from '../../components/common'`
2. Access auth: `const { user, getEmployeeDetails } = useAuth()`
3. Fetch data: Use React Query for new pages, direct API calls for older ones
4. Render: `<div className="pageWrapper"><BackButton /><Content /></div>`

**Navigation Patterns:**
- Back button: `<button className="back-button" onClick={() => navigate(-1)}>← Back</button>`
- With state: `navigate('/path', { state: { empNo, quarter, ... } })`
- Access state: `const location = useLocation(); const { empNo } = location.state || {}`

**Toast Notifications:**
```javascript
import { toast } from 'react-toastify';
toast.success('Operation successful');
toast.error('Failed: ' + error.message);
```

## Styling Standards

**CSS Approach:** Traditional CSS files with Bootstrap 5.3.8
- Global styles: `src/index.css`, `src/styles/base.css`
- Component CSS: Co-located `ComponentName.css` files
- Bootstrap utility classes extensively used

**Layout Variables:**
```css
.pageWrapper {
  margin-left: 75px;    /* LeftNavigation width */
  margin-top: 34px;     /* TopBar offset */
  padding: 24px;
}
```

**Icons:**
- React Icons: `import { FaCheckCircle } from 'react-icons/fa'`
- Lucide React: `import { Check } from 'lucide-react'`
- Font Awesome via CDN (in `index.js`)

## Module-Specific Patterns

**Appraisal Check-In Form:**
- Accessed via state: `location.state` contains employee details, quarter, FY
- API endpoint: `/appraisal/employee_self_appraisal` with extensive query params
- URL structure preserved in state for navigation back

**Exception Handling:**
- Dashboard: `appraisalAPI.getExceptionDashboard({ fy, quarter, exception_period, empNo })`
- Validator: `appraisalAPI.getExceptionValidatorDashboard({ ... })`
- Period values: "Q1_Exception", "Q2_Exception", "Q3_Exception", "Annual_Exception"

**HR Utilities:**
- Located in `/appraisal/hr-dashboard/*`
- Naming inconsistency: "Delection" instead of "Deletion" (AppealDelection, ExceptionDelection)
- All wrapped with TopBar + LeftNavigation layout

## Development Workflow

**Start development:**
```bash
npm start  # Runs on localhost:3000
```

**API Testing:**
- Use `/api-test` route (ApiTest component) for quick API endpoint testing
- Access auth: Route currently bypassed, but exists for internal testing

**Code Formatting:**
- Prettier configured (`.prettierrc`)
- Single quotes, 100 char width, 2-space tabs, trailing commas (ES5)

## Common Gotchas

1. **Auth Bypass:** `isAuthenticated = true` hardcoded in `App.js` - remove for production
2. **Token Hardcoded:** Bearer token hardcoded in `api.js` request interceptor
3. **localStorage vs sessionStorage:** Auth uses localStorage, Redux uses sessionStorage
4. **User Data Structure:** Login returns `user` + `userDetailedInfo` array - combine before storing
5. **Employee ID Variations:** `EMP_ID`, `EMP_NUMBER`, `empNo` - check both formats
6. **Financial Year Format:** Always "FY YYYY-YY" (e.g., "FY 2024-25")
7. **Quarter Format:** "Q1", "Q2", "Q3" (strings, not numbers)
8. **Appraisal Period:** "Quarterly" or "Annual" (exact case matters)

## Testing & Debugging

**React Query Devtools:** Available in development mode (added in `App.js`)

**AuthContext Debug:**
```javascript
const { getDebugInfo } = useAuth();
console.log('Auth Debug:', getDebugInfo());
```

**Common API Issues:**
- Check `localStorage.accessToken` exists
- Verify API base URL points to correct environment
- Console logs extensive in `api.js` for request/response tracking

## Adding New Features

**New Page Checklist:**
1. Create page component in `src/pages/ModuleName/`
2. Add route in `App.js` with Layout wrapper
3. Import and export from `src/pages/index.js`
4. Add to `LeftNavigation.js` toolsSubmenu if needed
5. Use React Query for data fetching (modern pattern)
6. Follow layout pattern: TopBar + LeftNavigation + pageWrapper

**New API Endpoint:**
1. Add to appropriate service in `src/services/api.js` (e.g., `appraisalAPI`)
2. Or use generic `api.get/post/put/delete` for quick additions
3. Follows automatic token injection via interceptor
4. Returns `response.data` directly (unwrapped)

---

*Last Updated: November 2025 | React 19.1.1 | See REPOSITORY_ANALYSIS.md for detailed architecture*
