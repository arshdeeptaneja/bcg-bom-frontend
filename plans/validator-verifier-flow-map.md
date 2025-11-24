# Validator & Verifier Exception Flow Map

**BCG-BOM Frontend: Exception Review Journey**  
*Last Updated: 24 November 2025*

---

## Overview

This document maps the complete user journeys for **Verifier** (Appraiser/Reviewer role) and **Validator** (final authority) when processing quarterly exceptions. Each flow covers:

1. **Dashboard/Entry Point** - Viewing exception counts and selecting filters
2. **Exception List** - Browsing exceptions needing review with filters
3. **Review Form** - Opening specific exception details and submitting decisions
4. **Data Submission** - Saving validation/verification responses

---

## 🔍 Verifier Flow (Appraiser/Reviewer Mode)

### Step 1: Exception Verify Dashboard

**Component:** `ExceptionVerify.js`  
**Route:** `/appraisal/exception-verify`  
**File:** `src/pages/Appraisal/ExceptionVerify/ExceptionVerify.js`

#### Purpose

Landing dashboard showing exception counts needing verification/review. Users select FY, Quarter, and Exception Period (Annual/Quarterly).

#### API Call

```javascript
appraisalAPI.getExceptionValidatorDashboard({
  fy: '2025',                    // Extracted from "FY 2025-26" → "2025"
  quarter: 'Q1',                 // Selected quarter: Q1, Q2, Q3, Q4
  exceptionPeriod: 'quarterly',  // 'quarterly' or 'annual'
  empNo: '36663'                 // From auth context
})
```

**Endpoint:** `GET /appraisal/exception_validator/dashboard`  
**Query Params:** `fy`, `quarter`, `exceptionPeriod`, `empNo`

#### Response Data

```javascript
{
  data: {
    TOTAL_COUNT: 15,
    PENDING_COUNT: 8
  }
}
```

#### Navigation

Clicking **Exceptions** KPI tab navigates to:

```javascript
navigate(`/appraisal/exceptions-list?financialYear=${financialYear}&appraisalPeriod=${appraisalPeriod}&quarter=${quarter}`)
```

**Client URL Example:**

```
http://localhost:3000/appraisal/exceptions-list?financialYear=FY%202025-26&appraisalPeriod=Quarterly&quarter=Q1
```

---

### Step 2: Exceptions List

**Component:** `ExceptionsList.js`  
**Route:** `/appraisal/exceptions-list`  
**File:** `src/pages/Appraisal/ExceptionsList/ExceptionsList.js`

#### Purpose

Displays filterable table of exceptions requiring verification. Shows employee details, scores, and status.

#### Query Params (from URL)

- `financialYear` - e.g., "FY 2025-26"
- `appraisalPeriod` - "Quarterly" or "Annual"
- `quarter` - "Q1", "Q2", "Q3", "Q4"

#### API Call

```javascript
appraisalAPI.getExceptionQuarterlyVerify({
  fy: '2025',      // Extracted from FY format
  quarter: 'Q1',
  empNo: '36663'
})
```

**Endpoint:** `GET /appraisal/exception_quarterly_verify`  
**Query Params:** `fy`, `quarter`, `empNo`

#### Response Structure

```javascript
{
  result: [
    {
      CUST_TICKET_ID: "T-12345",
      P_URL_ID: "U-98765",
      EC_NUMBER: "54321",
      EMP_NAME: "John Doe",
      BRNAME: "Mumbai Branch",
      PRIMARY_ROLE: "Branch Manager",
      REP_NAME: "Jane Smith",
      ZNNAME: "West Zone",
      TOTAL_SCORE: 6.5,
      TOTAL_FINAL_SCORE: 7.0,
      FINAL_APPEAL_STATUS: "PENDING"
    }
  ],
  EMP_NAME: [...],          // Filter dropdown values
  PRIMARY_ROLE: [...],
  BRANCH_NAME: [...],
  TICKET_STATUS: [...]
}
```

#### Navigation to Review

Clicking **Review Exception** button:

```javascript
navigate('/appraisal/review-quarterly-exception', {
  state: {
    financialYear: 'FY 2025-26',
    quarter: 'Q1',
    appraisalPeriod: 'Quarterly',
    dateRange: '01 Apr 2025 - 30 Jun 2025',
    employee: {
      empNo: '54321',
      employeeName: 'John Doe',
      branch: 'Mumbai Branch',
      primaryRole: 'Branch Manager',
      appraiser: 'Jane Smith',
      zone: 'West Zone'
    },
    role: 'APPRAISER',
    roleName: 'APPRAISER',
    roleId: 'APPRAISER',
    custTicketId: 'T-12345',
    exceptionId: 'T-12345',
    urlId: 'U-98765'
  }
})
```

**Client URL:**

```
http://localhost:3000/appraisal/review-quarterly-exception
```

*(With state passed via navigate, not query params)*

---

### Step 3: Review Quarterly Exception (Verifier Form)

**Component:** `ReviewQuarterlyException.js`  
**Route:** `/appraisal/review-quarterly-exception`  
**File:** `src/pages/Appraisal/ExceptionReview/ReviewQuaterlyException.js`

#### Purpose

Detail form showing KRAs with exception requests. Verifier reviews, adds comments, selects actions (Approve/Reject), and submits.

#### Hook Used

`useExceptionReview` (`src/pages/Appraisal/shared/hooks/useExceptionReview.js`)

#### API Call (Fetch)

```javascript
appraisalAPI.getExceptionQuarterlyReview({
  fy: '2025',
  quarter: 'Q1',
  empNo: '54321',
  roleName: 'APPRAISER',
  roleId: 'APPRAISER',
  zone: 'West Zone',
  custTicketId: 'T-12345'
})
```

**Endpoint:** `GET /appraisal/exception_quarterly_verify/review`  
**Query Params:** `fy`, `quarter`, `empNo`, `roleName`, `roleId`, `zone`, `custTicketId`

#### Response Structure

```javascript
{
  kraData: [
    {
      id: '1',
      kra: 'New Account Openings',
      unit: 'Numbers',
      category: 'Measurable',
      selfActual: 120,
      selfTarget: 100,
      selfScore: 7.0,
      appraiserActual: 0,
      appraiserTarget: 0,
      appraiserScore: 0,
      appraiserComment: ''
    }
  ],
  urlId: 'U-98765',
  attachmentUrl: 'https://...'
}
```

#### User Actions

- **Check rows** to select KRAs for review
- **Select action** per row: Approve/Reject
- **Enter comments** in `appraiserComment` field
- **Download attachment** if available

#### API Call (Submit)

```javascript
appraisalAPI.submitExceptionQuarterlyReview({
  urlId: 'U-98765',
  quarter: 'Q1',
  financialYear: 2025,
  empNo: '54321',
  custTicketId: 'T-12345',
  declarationOption: 'APPROVED',
  kraData: [
    {
      id: '1',
      kra: 'New Account Openings',
      selfActual: 120,
      selfTarget: 100,
      appraiserActual: 125,
      appraiserTarget: 100,
      appraiserScore: 7.5,
      appraiserComment: 'Verified and approved',
      action: 'Approve'
    }
  ]
})
```

**Endpoint:** `POST /appraisal/exception_quarterly_verify/submit`  
**Content-Type:** `application/json`

#### Success Response

```javascript
{
  RESPONSE: 'authority_exception_approved',
  message: 'Exception approved successfully'
}
```

#### Post-Submit Actions

- Invalidates queries: `exceptionQuarterlyVerify`, `exceptionDashboard`
- Navigates back: `navigate(-1)`
- Shows toast: "Exception approved successfully"

---

## ✅ Validator Flow (Final Authority)

### Step 1: Employee Exception List (Validator Dashboard)

**Component:** `EmployeeExceptionList.js`  
**Route:** `/appraisal/review-exception-list`  
**File:** `src/pages/Appraisal/EmployeeExceptionList/EmployeeExceptionList.js`

#### Purpose

Validator-specific landing page showing all exceptions requiring final validation. Displays employee list with pre/post scores.

#### Query Params (from URL)

- `financialYear` - e.g., "FY 2025-26"
- `appraisalPeriod` - "Quarterly" or "Annual"
- `quarter` - "Q1", "Q2", "Q3", "Q4"

#### API Call

```javascript
appraisalAPI.getExceptionQuarterlyValidatorReview({
  fy: 2025,
  quarter: 'Q1',
  empNo: '36663',        // Validator's employee number
  roleName: 'VALIDATOR',
  roleId: 'VALIDATOR',
  zone: 'Central Zone'
})
```

**Endpoint:** `GET /appraisal/exception_quarterly_validator/review`  
**Query Params:** `fy`, `quarter`, `empNo`, `roleName`, `roleId`, `zone`

**Note:** This endpoint returns list-level data for validator dashboard. The same endpoint is reused with specific `custTicketId` for detail view.

#### Response Structure

```javascript
{
  result: [
    {
      cust_ticket_id: 'T-67890',
      empnumber: '87654',
      emp_name: 'Alice Brown',
      primary: 'Deputy Manager',
      organisation: 'Delhi Branch',
      measurable_score_total: 5.5,
      new_measurable_score_total: 6.5,
      status: 'PENDING_VALIDATION'
    }
  ]
}
```

#### Filter Options

Component provides dropdowns for:

- Employee (from API response)
- Primary Role
- Branch
- Exception Status

#### Navigation to Validator Review

Clicking **Review Exception** button:

```javascript
navigate('/appraisal/employee-review-quarterly-exception', {
  state: {
    financialYear: 'FY 2025-26',
    appraisalPeriod: 'Quarterly',
    quarter: 'Q1',
    dateRange: '01 Apr 2025 - 30 Jun 2025',
    employee: {
      empNo: '87654',
      employeeName: 'Alice Brown',
      branch: 'Delhi Branch',
      primaryRole: 'Deputy Manager'
    },
    role: 'VALIDATOR',
    roleName: 'VALIDATOR',
    roleId: 'VALIDATOR',
    custTicketId: 'T-67890',
    exceptionId: 'T-67890'
  }
})
```

**Client URL Example:**

```
http://localhost:3000/appraisal/review-exception-list?financialYear=FY%202025-26&appraisalPeriod=Quarterly&quarter=Q1
```

---

### Step 2: Employee Quarterly Exception (Validator Form)

**Component:** `EmployeeQuarterlyException.js`  
**Route:** `/appraisal/employee-review-quarterly-exception`  
**File:** `src/pages/Appraisal/QuarterlyException/EmployeeQuarterlyException.js`

#### Purpose

Final validation form showing exception details with verifier's decisions. Validator reviews, adds final comments, and approves/rejects.

#### Hook Used

`useExceptionValidator` (`src/pages/Appraisal/shared/hooks/useExceptionValidator.js`)

#### API Call (Fetch)

```javascript
appraisalAPI.getExceptionQuarterlyValidatorReview({
  fy: 2025,
  quarter: 'Q1',
  empNo: '87654',
  roleName: 'VALIDATOR',
  roleId: 'U-98765',    // Note: API expects urlId here
  zone: 'Central Zone',
  custTicketId: 'T-67890'
})
```

**Endpoint:** `GET /appraisal/exception_quarterly_validator/review`  
**Query Params:** `fy`, `quarter`, `empNo`, `roleName`, `roleId`, `zone`, `custTicketId`

**Important:** `roleId` parameter expects the URL ID (e.g., "U-34545"), not the role name. Hook automatically uses `urlId || custTicketId || roleId`.

#### Response Structure

```javascript
{
  empnumber: '87654',
  emp_name: 'Alice Brown',
  organisation: 'Delhi Branch',
  primary: 'Deputy Manager',
  REPORTING_AUTHORITY_NAME: 'Bob Manager',
  validator_name: 'John Validator',
  file_url: '/uploads/exception_T-67890.pdf',
  measurable_score_total: 5.5,
  new_measurable_score_total: 6.5,
  kraData: [
    {
      id: '1',
      kra: 'Customer Satisfaction',
      unit: 'Rating',
      category: 'Measurable',
      selfActual: 4.2,
      selfTarget: 4.5,
      selfScore: 6.0,
      appraiserActual: 4.3,
      appraiserTarget: 4.5,
      appraiserScore: 6.5,
      appraiserComment: 'Improved performance',
      validatorActual: 0,
      validatorTarget: 0,
      validatorScore: 0,
      validatorComment: ''
    }
  ]
}
```

#### User Actions

- **Review score changes** - Old Score vs New Score displayed
- **Check rows** to select KRAs for final validation
- **Select action** per row: Approve/Reject
- **Enter comments** in `validatorComment` field
- **Download attachment** if available

#### API Call (Submit)

```javascript
appraisalAPI.submitExceptionQuarterlyValidatorReview({
  urlId: 'U-98765',
  quarter: 'Q1',
  financialYear: 2025,
  empNo: '87654',
  custTicketId: 'T-67890',
  declarationOption: 'APPROVED',
  kraData: [
    {
      id: '1',
      kra: 'Customer Satisfaction',
      selfActual: 4.2,
      selfTarget: 4.5,
      appraiserActual: 4.3,
      appraiserTarget: 4.5,
      validatorActual: 4.3,
      validatorTarget: 4.5,
      validatorScore: 6.5,
      validatorComment: 'Final validation approved',
      action: 'Approve'
    }
  ]
})
```

**Endpoint:** `POST /appraisal/exception_quarterly_validator/submit`  
**Content-Type:** `application/json`

#### Success Response

```javascript
{
  RESPONSE: 'validator_exception_approved',
  message: 'Exception validated and approved successfully'
}
```

#### Post-Submit Actions

- Invalidates queries: `exceptionQuarterlyValidatorReview`, `exceptionValidatorDashboard`
- Navigates back: `navigate(-1)`
- Shows toast: "Exception validated and approved successfully"

---

## 📋 API Summary

### Verifier/Reviewer APIs

| API Method | Endpoint | Purpose | Key Params |
|------------|----------|---------|------------|
| GET | `/appraisal/exception_validator/dashboard` | Dashboard counts | `fy`, `quarter`, `exceptionPeriod`, `empNo` |
| GET | `/appraisal/exception_quarterly_verify` | List exceptions | `fy`, `quarter`, `empNo` |
| GET | `/appraisal/exception_quarterly_verify/review` | Review detail | `fy`, `quarter`, `empNo`, `roleName`, `roleId`, `zone`, `custTicketId` |
| POST | `/appraisal/exception_quarterly_verify/submit` | Submit review | Body: `{ urlId, quarter, financialYear, empNo, custTicketId, kraData }` |

### Validator APIs

| API Method | Endpoint | Purpose | Key Params |
|------------|----------|---------|------------|
| GET | `/appraisal/exception_quarterly_validator/review` | List + Detail | `fy`, `quarter`, `empNo`, `roleName`, `roleId`, `zone`, `custTicketId?` |
| POST | `/appraisal/exception_quarterly_validator/submit` | Submit validation | Body: `{ urlId, quarter, financialYear, empNo, custTicketId, kraData }` |

**Note:** Validator uses same GET endpoint for both list view (without `custTicketId`) and detail view (with `custTicketId`).

---

## 🔗 Client URL Reference

### Verifier Journey URLs

1. **Dashboard Entry:**

   ```
   http://localhost:3000/appraisal/exception-verify
   ```

2. **Exception List:**

   ```
   http://localhost:3000/appraisal/exceptions-list?financialYear=FY%202025-26&appraisalPeriod=Quarterly&quarter=Q1
   ```

3. **Review Form:**

   ```
   http://localhost:3000/appraisal/review-quarterly-exception
   ```

   *(Requires `location.state` with employee details, custTicketId, urlId)*

### Validator Journey URLs

1. **Dashboard/List:**

   ```
   http://localhost:3000/appraisal/review-exception-list?financialYear=FY%202025-26&appraisalPeriod=Quarterly&quarter=Q1
   ```

2. **Validation Form:**

   ```
   http://localhost:3000/appraisal/employee-review-quarterly-exception
   ```

   *(Requires `location.state` with employee details, custTicketId, role: 'VALIDATOR')*

---

## 🧩 State Requirements for Deep Links

When navigating to review forms programmatically or via deep links, ensure `location.state` contains:

### Verifier Review Form State

```javascript
{
  financialYear: 'FY 2025-26',
  quarter: 'Q1',
  appraisalPeriod: 'Quarterly',
  dateRange: '01 Apr 2025 - 30 Jun 2025',
  employee: {
    empNo: '54321',
    employeeName: 'John Doe',
    branch: 'Mumbai Branch',
    primaryRole: 'Branch Manager',
    appraiser: 'Jane Smith',
    zone: 'West Zone'
  },
  role: 'APPRAISER',
  roleName: 'APPRAISER',
  roleId: 'APPRAISER',
  custTicketId: 'T-12345',
  exceptionId: 'T-12345',
  urlId: 'U-98765'
}
```

### Validator Review Form State

```javascript
{
  financialYear: 'FY 2025-26',
  quarter: 'Q1',
  appraisalPeriod: 'Quarterly',
  dateRange: '01 Apr 2025 - 30 Jun 2025',
  employee: {
    empNo: '87654',
    employeeName: 'Alice Brown',
    branch: 'Delhi Branch',
    primaryRole: 'Deputy Manager'
  },
  role: 'VALIDATOR',
  roleName: 'VALIDATOR',
  roleId: 'VALIDATOR',
  custTicketId: 'T-67890',
  exceptionId: 'T-67890'
}
```

---

## 🔄 Data Flow Summary

### Verifier Flow

```
ExceptionVerify (Dashboard)
  ↓ GET /exception_validator/dashboard
  ↓ Click "Exceptions" KPI
ExceptionsList (List View)
  ↓ GET /exception_quarterly_verify
  ↓ Click "Review Exception" row
ReviewQuarterlyException (Form)
  ↓ GET /exception_quarterly_verify/review
  ↓ Edit, add comments, submit
  ↓ POST /exception_quarterly_verify/submit
  → Success: Navigate back, invalidate cache
```

### Validator Flow

```
EmployeeExceptionList (Dashboard/List)
  ↓ GET /exception_quarterly_validator/review (list mode)
  ↓ Click "Review Exception" row
EmployeeQuarterlyException (Form)
  ↓ GET /exception_quarterly_validator/review (detail mode)
  ↓ Validate, add comments, submit
  ↓ POST /exception_quarterly_validator/submit
  → Success: Navigate back, invalidate cache
```

---

## 📝 Implementation Notes

1. **Financial Year Parsing:** All components extract year from "FY 2025-26" format using `extractYear()` helper that returns "2025"

2. **Role vs RoleId Confusion:** Validator API's `roleId` parameter actually expects the URL ID (e.g., "U-98765"), not the role name. Hooks handle this automatically.

3. **React Query Caching:** Both flows use React Query with 5-minute stale time. Successful submissions invalidate related queries.

4. **Custom Hooks:**
   - `useExceptionReview.js` - Verifier business logic
   - `useExceptionValidator.js` - Validator business logic
   Both normalize API responses using `normalizeKraRows()` utility

5. **Payload Builders:**
   - `buildVerifyPayload()` - Constructs verifier submission
   - `buildValidatorPayload()` - Constructs validator submission
   Located in `src/pages/Appraisal/shared/utils/payloadTransformers.js`

6. **Field Mappings:**
   - `VERIFY_FIELDS` - Maps API fields to verifier form fields
   - `VALIDATOR_FIELDS` - Maps API fields to validator form fields
   Located in `src/pages/Appraisal/shared/utils/fieldMappings.js`

---

## 🚨 Known Issues & TODOs

1. **ExceptionVerify Dashboard API:** Currently uses `/exception_validator/dashboard` but could conflict with actual validator role. Consider using `/exception_verify/dashboard` if available.

2. **Role Naming Inconsistency:** "Verifier" role shown in UI but called "APPRAISER" in API/state. Validator uses "VALIDATOR" consistently.

3. **EmployeeExceptionList Typo:** Page title shows "Exmployee Exception List" (typo in component).

4. **Date Range Calculation:** `buildQuarterDateRange()` duplicated across components. Could be centralized in shared utilities.

5. **Filter Implementation:** Search/filter buttons in list views log filters but don't actually filter data (client-side filtering not implemented).

---

## 🔧 Testing URLs

### Verifier Testing

```bash
# Dashboard
open "http://localhost:3000/appraisal/exception-verify"

# List with sample params
open "http://localhost:3000/appraisal/exceptions-list?financialYear=FY%202024-25&appraisalPeriod=Quarterly&quarter=Q1"
```

### Validator Testing

```bash
# Dashboard/List
open "http://localhost:3000/appraisal/review-exception-list?financialYear=FY%202024-25&appraisalPeriod=Quarterly&quarter=Q1"
```

**Note:** Review forms require navigation from list pages (state-based routing) - cannot be opened directly via URL without state.

---

*End of Validator & Verifier Flow Map*
