# Quartely Appraisal Flow

-> Appraisee-dashboard => `/appraisal/my_appraisal_dashboard` (send quarter)

# Quarterly Appraisal Flow

## Main Entry Point

**Route:** `/appraisal/home`  
**Component:** `AppraisalHome` (`src/pages/Appraisal/AppraisalHome.js`)  
**Description:** Main dashboard hub with FY selector, period selector (Annual/Quarterly), quarter selector, and KPI tabs for accessing both Appraisee and Appraiser check-ins.

---

## Quarterly Appraisal Flow

### Appraisee Dashboard

**Route:** `/quarterly/quarterly-appraisee`  
**Component:** `QuarterlyAppraisee` (`src/pages/Appraisee/QuarterlyAppraisee.js`)  
**API Endpoint:** GET `/appraisal/my_appraisal_dashboard` (send quarter, fy, empNo)  
**Description:** Shows list of quarterly appraisals for the employee with average scores and employee cards.

### Appraiser Dashboard

**Route:** `/appraisal/appraiser-check-in`  
**Component:** `AppraiserCheckInDashboard` (`src/pages/Appraiser/AppraiserDashboardCheckIn/AppraiserCheckInDashboard.js`)  
**API Endpoint:** GET `/appraisal/quarterly_reportee_appraisal/dashboard` (with quarter, fy, empNo, role)  
**Description:** Shows list of reportees with filters for employee number, name, primary role, appraiser, and status.

---

### 1. Appraisee Check-In Dashboard

**Route:** `/quarterly/quarterly-appraisee`  
**Component:** `QuarterlyAppraisee`  

   1. **Add Check-In Summary or Add Exception**
      - Option to file check-in summary OR raise an exception

   2. **Add Check-In Summary (Form)**  
      **Route:** `/quarterly/quaterly-appraisee-check-in`  
      **Component:** `QuaterlyAppraiseeCheckIn` (`src/pages/Appraisee/QuaterlyAppraiseeCheckIn.js`)  
      **API Endpoints:**
      - GET `/appraisal/quarterly_check_in_report`
      - POST `/appraisal/quarterly_check_in_report/save` (draft)
      - POST `/appraisal/quarterly_check_in_report/submit` (final)

      **Description:** Form with monthly tabs (April, May, June), measurable/non-measurable KRAs, and development inputs (2 questions).

---

### 2. Appraiser Check-In

**Route:** `/appraisal/appraiser-check-in`  
**Component:** `AppraiserCheckInDashboard`  

   1. **Show List of Reportees** (integrated)  
      **API Endpoint:** GET `/appraisal/quarterly_reportee_appraisal/dashboard`

   2. **Add Check-In Summary**  
      **Route:** `/appraisal/check-in-form`  
      **Component:** `AppraisalCheckInForm` (`src/pages/Appraisal/AppraisalCheckInForm.js`)  
      **API Endpoints:**
      - GET `/appraisal/quarterly_check_in_report` (pageType and intent change)
      - POST `/appraisal/quarterly_check_in_report/save`
      - POST `/appraisal/quarterly_check_in_report/submit`

      **Description:** Renders appraisee comments and appraiser must answer the questions accordingly.

---

### 3. Quarterly Exception

**Route:** `/appraisal/exception-quarterly`  
**Component:** `QuarterlyException` (`src/pages/Appraisal/QuarterlyException/QuarterlyException.js`)  
**Trigger:** Filed for an exception from Appraisee Check-In Dashboard  

**Exception Form:**

- **API Endpoints:**
  - GET `/appraisal/quarterly_exception_report`
  - POST `/appraisal/quarterly_exception_report/submit_exception`
  
**Description:** Form with list of measurable and non-measurable KRAs to correct, file upload capability, and declaration section.

---

### 4. Exception Resolution - Review Exception

**Route:** `/appraisal/exception-resolution`  
**Component:** `ExceptionHome` (`src/pages/Appraisal/ExceptionHome.js`)  
**API Endpoint:** GET `/appraisal/exception_verify/dashboard` (with fy, quarter, empNo, role)  
**Description:** Dashboard showing total exceptions and pending exceptions with KPI cards.

   1. **Exceptions List**  
      **Route:** `/appraisal/exceptions-list`  
      **Component:** `ExceptionsList` (`src/pages/Appraisal/ExceptionsList.js`)  
      **Description:** Shows filterable list of exceptions to review.

   2. **Review Exception Form**  
      **Route:** `/appraisal/review-quarterly-exception`  
      **Component:** `ReviewQuarterlyException` (`src/pages/Appraisal/ReviewQuarterlyException.js`)  
      **API Endpoints:**
      - GET `/appraisal/exception_quarterly_verify/review`
      - POST `/appraisal/exception_quarterly_verify/submit`

      **Description:** Form with radio buttons to accept as-is or modify exception (2 other options), includes file download capability.

---

### 5. Exception Validation - Review Exception

**Route:** `/appraisal/exception-verify`  
**Component:** `ExceptionVerify` (`src/pages/Appraisal/ExceptionVerify.js`)  
**API Endpoint:** GET `/appraisal/exception_validator/dashboard` (with fy, quarter, empNo, role)  
**Description:** Validator dashboard showing exceptions requiring final validation.

   1. **Employee Exception List**  
      **Route:** `/appraisal/employee-review-quarterly-exception`  
      **Component:** `EmployeeQuarterlyException` (`src/pages/Appraisal/QuarterlyException/EmployeeQuarterlyException.js`)  
      **Description:** Shows list of exceptions for validator review.

   2. **Validator Review Form**  
      **Route:** `/appraisal/review-exception-list`  
      **Component:** `EmployeeExceptionList` (`src/pages/Appraisal/EmployeeExceptionList.js`)  
      **API Endpoints:**
      - GET `/appraisal/exception_quarterly_validator/review`
      - POST `/appraisal/exception_quarterly_validator/submit`

      **Description:** Final validation stage - review the exception, look through documents and other details.

---

### 6. Final Stage

**Description:** View Exception and Appraisal Status Completed.  
Status visible on dashboard pages (AppraisalHome, ExceptionHome).

---

## Annual Appraisal Flow

### Appraisee Dashboard

**Route:** `/annual/appraisee/appraisee-dashboard`  
**Component:** `AppraiseeCheckIn` (`src/pages/Appraisee/AppraiseeCheckIn.js`)  
**API Endpoint:** GET `/appraisal/my_appraisal_dashboard` (quarter passed as empty for annual)  
**Description:** Shows annual appraisal cards for employee.

### Appraiser Dashboard

**Route:** `/appraiser/dashboard`  
**Component:** `AppraiserDashboard` (`src/pages/Appraiser/AppraiserDashboard.js`)  
**API Endpoint:** GET `/appraisal/reportee_appraisal/dashboard` (quarter passed as empty)  
**Description:** Shows list of reportees requiring annual appraisal.

---

### 1. Appraisee Adding the Details

**Route:** `/appraisal/appraisee-check-in`  
**Component:** `AppraiseeCheckIn` (`src/pages/Appraisee/AppraiseeCheckIn.js`)  
**API Endpoints:**

- GET `/appraisal/employee_self_appraisal` (with empNo, fy, appraisalPeriod, quarter, role, etc.)
- POST `/appraisal/submit-self-appraisal`

**Description:** Annual self-appraisal form with measurable/non-measurable KRAs, development inputs, and appraisee comments on all fields.

---

### 2. Appraiser Adding and Reviewing Details

**Route:** `/appraiser/add-appraisal`  
**Component:** `AppraiserAddAppraisal` (`src/pages/Appraiser/AppraiserAddAppraisal.js`)  

**List View:**

- **API Endpoint:** GET `/appraisal/reportee_appraisal/dashboard`

**Form View:**

- **API Endpoints:**
  - GET `/appraisal/reportee_appraisal/`
  - POST `/appraisal/reportee_appraisal/submit`
  
**Description:** Appraisee comments are displayed, appraiser adds their responses on top of them for KRAs and development inputs.

---

### 3. Reviewer Mode

⚠️ **IMPLEMENTATION GAP:** Component not yet implemented in App.js

**API Endpoints:**

- GET `/appraisal/acceptor_appraisal`
- POST (to be provided)

**Description:** Goes into reviewing the details - renders appraisee comment, appraiser comment, and reviewer comment.

---

### 4. Annual Appraisal Home

**Route:** `/appraiser/annual-appraisal-home`  
**Component:** `AnnualAppraisalHome` (`src/pages/Appraiser/AnnualAppraisalHome.js`)  
**Description:** Shows the total score after the whole rounds of process by reviewer.

---

### 5. Appeal Flow

#### 5a. Add Appeal

**Route:** `/annual/add-appeal`  
**Component:** `AddAppeal` (`src/pages/Appeal/AddAppeal.js`)  
**API Endpoints:**

- GET `/appraisal/appeal_report`
- POST `/appraisal/appeal_report/submit`

**Description:** Form to raise appeal with KRA selection, score modification, file upload, and mandatory file requirement.

#### 5b. Review Appeal - List of Appeals

**Route:** `/appeal-resolutions/annual-appeal/employee-appeal-list`  
**Component:** `EmployeeAppealList` (`src/pages/Appeal/EmployeeAppealList.js`)  
**API Endpoint:** GET `/appraisal/appeal_commitee` (note: typo in endpoint)  
**Description:** Shows filterable list of appeals with module name, FY, quarter, scale filters. Approve button with validation alert box.

#### 5c. Appeal Committee Review Form

⚠️ **IMPLEMENTATION GAP:** Component not yet implemented in App.js

**API Endpoints:**

- GET `/appraisal/appeal_report/review`
- POST `/appraisal/appeal_commitee/submit`

**Description:** Appeal committee reviews and approves/rejects appeals.

#### 5d. View Appeal Summary

⚠️ **IMPLEMENTATION GAP:** Component not yet implemented in App.js

**Description:** Goes into View Appeal Summary - final appeal status view.

---

## Navigation Patterns

**State Transfer:** All forms use `location.state` for navigation data transfer including:

- `financialYear` (e.g., "FY 2024-25")
- `appraisalPeriod` ("Quarterly" or "Annual")
- `quarter` ("Q1", "Q2", "Q3", or empty for annual)
- `dateRange`
- `employee` details
- `role` information
- `empNo` (employee number)

**Back Navigation:** Components use `navigate(-1)` with preserved state for seamless back button functionality.

---

## Key Notes

1. **Naming Inconsistencies:**
   - "Quaterly" vs "Quarterly" spelling variations in routes and components
   - API endpoint: "commitee" instead of "committee" (`/appraisal/appeal_commitee`)

2. **Component Reuse:**
   - `AppraiseeCheckIn` is used for both quarterly and annual appraisal entry points
   - `AppraisalCheckInForm` handles both appraisee and appraiser check-ins (distinguished by pageType/intent)

3. **Data Fetching:**
   - Newer components use React Query (`@tanstack/react-query`)
   - Older components use direct API calls via `src/services/api.js`

4. **Authentication:**
   - All routes protected with `isAuthenticated` check
   - Note: Currently bypassed in development (see `App.js` TODO comment)

1. Appraisee-check-in-dashboard
    1. add check-in-summary or Add Exception
        1. clicks on Add-Check-in Summary (Form)
        -> GET ENDPOINT -> /appraisal/quarterly_check_in_report
        -> POST ENDPOINT -> is the same (/save or /submit)
        <!-- 2. Development Inputs will show the inputs (2 Questions in the screenshots)         -->
2. appraiser-check-in
    1. show list of people (integrated)
    GET ENDPOINT - /appraisal/quarterly_reportee_appraisal/dashboard
    2. Clicks on Add Check-in Summary
    GET ENDPOINT -> /appraisal/quarterly_check_in_report
    POST ENDPOINT -> is the same (/save or /submit)
    {PAGETYPE AND INTENT WILL CHANGE}
    <!-- 3. Renders Appraisee-comments and you’d have to answer the questions accordingly, -->

3. Quartely-Exception
    2. Filed for an exception from Appraisee-Checkin-Dashboard  
    -> Exception form
    GET ENDPOINT -> /appraisal/quarterly_exception_report
    POST ENDPOINT -> /appraisal/quarterly_exception_report/submit_exception
    <!-- 3. list of mesurable and non-mesurable thingys ⇒ correct them out
    4. upload file too -->
4. Exception Resolution - Review Exception
    1. From list of Exception Resolution
     GET ENDPOINT -> /appraisal/exception_quarterly_verify
    <!-- 2. has a list of Radio buttons to accept as it is and 2 other options -->
    FORM
    GET ENDPOINT -> /appraisal/exception_quarterly_verify/review
    POST ENDPOINT -> /appraisal/exception_quarterly_verify/submit

5. Exception Validation - Review Exception  
    LIST
    GET ENDPOINT - /appraisal/exception_quarterly_validator
    1. review the Exception essentially - look through the document and other things
    GET ENDPOINT - exception_quarterly_validator/review
    POST ENDPOINT - exception_quarterly_validator/submit
6. Final Stage → View Exception and Appraisal Status Completed.

---

### Annual Appraisal Flow

-> Appraisee-dashboard (GET) => `/appraisal/my_appraisal_dashboard`
-> Appraiser-dashboard (GET) => /appraisal/reportee_appraisal/dashboard (quarter - pass empty)

1. Appraisee Adding the Details
    GET ENDPOINT -> /employee_self_appraisal
    1. Bunch of Fields and Appraisee Comments on all of them
    2. Click on Submit
    POST ENDPOINT -> /employee_self_appraisal/submit
2. Appraiser Adding and Reviewing Details
LIST
    GET ENDPOINT -> /appraisal/reportee_appraisal/dashboard
    1. Appraisee Comments are given, on top of that,
    FORM GET ENDPOINT -> /appraisal/reportee_appraisal/
    POST ENDPOINT -> /appraisal/reportee_appraisal/submit
3. Reviewer Mode
    GET POINT -> /appraisal/acceptor_appraisal
    POST ENDPOINT -> (to be provided)
    1. goes into reviewing the details
    2. renders appraisee comment, appraiser comment and reviewer comment
4. Shows the total score after the whole rounds of process by reviewer
    1. Add Appeal
        GET ENDPOINT -> /appraisal/appeal_report
        POST -> /appraisal/appeal_report/submit
    2. Review Appeal → Approve Button (Also show Validation on Alert Box)
     LIST of Appeals
     GET -> /appraisal/appeal_commitee
     APPEAL FORM
     GET -> /appraisal/appeal_report/review
     POST -> /appraisal/appeal_commitee/submit

     Appeal Review Form
     GET -> /appraisal/appeal_report/review
     POST -> /appraisal/appeal_commitee/submit
    3. Goes into View Appeal Summary
