# API Integration Map

This document maps the application routes to their corresponding React components and the API endpoints they integrate with.

## Route to Component & API Mapping

| Route Path | Component | Primary API Service Method | Backend Endpoint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/appraisal/home` | `AppraisalHome` | `appraisalAPI.getAppraisalHomeDashboard` | `/appraisal/home/dashboard` | Main landing page for appraisal, showing overview and entry points. |
| `/appraisal/dashboard` | `AppraisalDashboard` | `appraisalAPI.getAppraisalDashboard` | `/appraisal/dashboard` | General appraisal dashboard. |
| `/appraisal/appraisee-check-in` | `AppraiseeCheckIn` | `appraisalAPI.getAppraiseeCheckInDashboard` | `/appraisal/my_appraisal_dashboard` | Dashboard for the appraisee to see their own appraisal status. |
| `/appraisal/appraiser-check-in` | `AppraiserCheckInDashboard` | `appraisalAPI.getAppraiserCheckInDashboard` | `/appraisal/quarterly_reportee_appraisal/dashboard` | Dashboard for the appraiser to view reportees. |
| `/appraisal/check-in-form` | `AppraisalCheckInForm` | `appraisalAPI.getQuarterlyCheckInReport` | `/appraisal/quarterly_check_in_report` | The main form for filling out quarterly appraisals (used by both Appraisee and Appraiser). |
| | | `appraisalAPI.saveQuarterlyCheckInReport` | `/appraisal/quarterly_check_in_report/save` | Save draft. |
| | | `appraisalAPI.submitQuarterlyCheckInReport` | `/appraisal/quarterly_check_in_report/submit` | Submit final. |
| `/appraisal/exception-quarterly` | `QuarterlyException` | `appraisalAPI.getQuarterlyExceptionReport` | `/appraisal/quarterly_exception_report` | Form for raising a quarterly exception. |
| | | `appraisalAPI.submitQuarterlyExceptionReport` | `/appraisal/quarterly_exception_report/submit_exception` | Submit exception. |
| `/appraisal/review-exception-list` | `EmployeeExceptionList` | `appraisalAPI.getExceptionQuarterlyVerify` | `/appraisal/exception_quarterly_verify` | List of exceptions for verification/review. |
| `/appraisal/review-quarterly-exception` | `ReviewQuarterlyException` | `appraisalAPI.getExceptionQuarterlyReview` | `/appraisal/exception_quarterly_verify/review` | Reviewer view of a specific exception. |
| | | `appraisalAPI.submitExceptionQuarterlyReview` | `/appraisal/exception_quarterly_verify/submit` | Submit review decision. |
| `/appraiser/reviewer-dashboard` | `ReviewerDashboard` | *Inferred* | *Inferred* | Dashboard for the Reviewer role (Acceptor). |
| `/appraiser/reviewer-mode` | `ReviewerMode` | `appraisalAPI.getAcceptorAppraisal` | `/appraisal/acceptor_appraisal` | Form for the Reviewer to approve/reject appraisals. |
| | | `appraisalAPI.submitAcceptorAppraisal` | `/appraisal/acceptor_appraisal/submit` | Submit reviewer decision. |
| `/appraisal/employee_self_appraisal` | *Inferred* (Annual) | `appraisalAPI.getEmployeeSelfAppraisal` | `/appraisal/employee_self_appraisal` | Annual self-appraisal form. |
| `/appraisal/exception-verify` | `ExceptionVerify` | `appraisalAPI.getExceptionDashboard` | `/appraisal/exception_verify/dashboard` | Exception verification dashboard. |
| `/appraisal/exception-resolution` | `ExceptionHome` | *Inferred* | *Inferred* | Exception home/landing. |

## API Service Reference (`src/services/api.js`)

### Auth & User
- `authAPI.login`: `/identity/auth/login`
- `authAPI.refreshToken`: `/identity/auth/refresh`
- `userAPI.getProfile`: `/user/profile`

### Dashboard
- `dashboardAPI.getDashboardData`: `/dashboard`
- `dashboardAPI.getRCTDashboard`: `/rct/dashboard`

### Appraisal (Core)
- `appraisalAPI.getAppraisalDashboard`: `/appraisal/dashboard`
- `appraisalAPI.getAppraisalHomeDashboard`: `/appraisal/home/dashboard`
- `appraisalAPI.getAppraiseeCheckInDashboard`: `/appraisal/my_appraisal_dashboard`
- `appraisalAPI.getAppraiserCheckInDashboard`: `/appraisal/quarterly_reportee_appraisal/dashboard`

### Forms & Reports
- `appraisalAPI.getQuarterlyCheckInReport`: `/appraisal/quarterly_check_in_report`
- `appraisalAPI.getEmployeeSelfAppraisal`: `/appraisal/employee_self_appraisal`
- `appraisalAPI.getAcceptorAppraisal`: `/appraisal/acceptor_appraisal`

### Exceptions
- `appraisalAPI.getQuarterlyExceptionReport`: `/appraisal/quarterly_exception_report`
- `appraisalAPI.getExceptionDashboard`: `/appraisal/exception_verify/dashboard`
- `appraisalAPI.getExceptionValidatorDashboard`: `/appraisal/exception_validator/dashboard`
- `appraisalAPI.getExceptionQuarterlyVerify`: `/appraisal/exception_quarterly_verify`
- `appraisalAPI.getExceptionQuarterlyReview`: `/appraisal/exception_quarterly_verify/review`
- `appraisalAPI.getExceptionQuarterlyValidatorReview`: `/appraisal/exception_quarterly_validator/review`
