# Route Summary

| Path                                                           | Element/Layout                                | Description                                                                                      |
|---------------------------------------------------------------|-----------------------------------------------|--------------------------------------------------------------------------------------------------|
| `/login`                                                      | `Login`                                       | Login page for user authentication; redirects to `/` when already authenticated.                |
| `/welcome`                                                    | `WelcomeLayout`                               | Post-login welcome/dashboard screen with logout support.                                        |
| `/rc/role-clarity`                                            | `DashboardLayout`                             | Role Clarity dashboard with top navigation and left sidebar.                                   |
| `/bcg-bom/role-acceptance/get-kra-details/:empId`             | `RoleAcceptanceLayout`                        | Role acceptance view showing KRA details for a specific employee.                               |
| `/profile`                                                    | `ProfileLayout`                               | User profile page with top & left navigation wrappers.                                          |
| `/api-test`                                                   | `ApiTest`                                     | Internal API testing utility component.                                                         |
| `/`                                                          | `Navigate`                                    | Root path; redirects to `/welcome` if authenticated, otherwise to `/login`.                     |
| `/rc/role-allocation`                                         | `RoleAllocationLayout`                        | Role allocation dashboard for managing employee roles.                                          |
| `/jobFamily`                                                  | `JobFamily`                                   | Job family management and configuration screen (requires auth).                                 |
| `/appraisal/dashboard`                                        | `AppraisalDashboardLayout`                    | Appraisal dashboard overview with navigation chrome.                                            |
| `/appraisal/home`                                             | `AppraisalHomeLayout`                         | Appraisal home/landing page with top and side navigation.                                       |
| `/appraisal/exception-resolution`                             | `ExceptionHomeLayout`                         | Appraisal exception resolution landing page.                                                    |
| `/appraisal/exception-verify`                                 | `ExceptionVerifyLayout`                       | Verification screen for appraisal exceptions.                                                   |
| `/appraisal/exceptions-list`                                  | `ExceptionsListLayout`                        | Listing view of appraisal exceptions.                                                           |
| `/appraisal/appraisee-check-in`                               | `AppraiseeCheckInLayout`                      | Appraisee check-in interface within the appraisal flow.                                         |
| `/appraisal/appraiser-check-in`                               | `AppraiserCheckInLayout`                      | Appraiser check-in interface within the appraisal flow.                                         |
| `/appraisal/admin-panel`                                      | `AppraisalAdminPanel`                         | Admin panel for managing appraisal-related configurations/utilities.                            |
| `/appraisal/check-in-form`                                    | `AppraisalCheckInFormLayout`                  | Detailed appraisal check-in form page.                                                          |
| `/appraisal/hr-dashboard`                                     | `AppraisaHrDashboard`                         | HR dashboard for appraisal monitoring and actions.                                              |
| `/appraisal/hr-dashboard/appraisal-update`                    | `AppraisaUpdated`                             | HR utility to update appraisal details.                                                         |
| `/appraisal/hr-dashboard/appraisal-status-change-utility`     | `AppraisalStatusChangeUtility`                | Tool to change appraisal statuses in bulk or via utility view.                                  |
| `/appraisal/hr-dashboard/appeal-comittee`                     | `AppraisalAppealComittee`                     | Appeal committee management interface.                                                          |
| `/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulk` | `ReportingAuthorityReviewBulk`            | Bulk update for reporting/reviewing authority assignments.                                      |
| `/appraisal/hr-dashboard/validator-update-utility`            | `ValidatorUpdateUtilities`                    | Utility to update validators for appraisals.                                                    |
| `/appraisal/hr-dashboard/exception-delection-utility`         | `ExceptionDelectionUtilities`                 | HR utility to delete or manage appraisal exceptions.                                            |
| `/appraisal/hr-dashboard/Appeal-delection-utility`            | `AppealDelectionUtilities`                    | HR utility to delete or manage appraisal appeals.                                               |
| `/appraisal/hr-dashboard/module-active-inactive-date`         | `MoulesActiveInactiveDate`                    | Configure active/inactive date ranges for appraisal modules.                                    |
