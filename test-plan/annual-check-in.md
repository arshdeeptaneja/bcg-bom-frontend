# Annual Check-In Route Test Plan

**Route:** `/appraisal/check-in-form`  
**Test URL:**
```
http://localhost:3000/appraisal/check-in-form?empNo=38965&financialYear=FY%202024-25&appraisalPeriod=Annual&urlId=4&zoneName=Central%20Zone&roleType=Administrative%20Officers
```

---

## 📁 Key Components

| Component | File Path |
|-----------|-----------|
| Controller | `src/pages/Appraisee/AppraisalCheckInForm/AppraisalCheckInForm.js` |
| Annual Check-In | `src/pages/Appraisee/AppraisalCheckInForm/AnnualCheckIn/AnnualCheckIn.js` |
| Data Hook | `src/pages/Appraisee/AppraisalCheckInForm/AnnualCheckIn/hooks/useAnnualAppraisal.js` |
| Context Hook | `src/pages/Appraisee/AppraisalCheckInForm/hooks/useAppraisalContext.js` |
| API Service | `src/services/api.js` |

---

## 🔄 Component Flow

```
App.js
└── Route: /appraisal/check-in-form
    └── AppraisalCheckInFormLayout
        ├── TopBar
        ├── LeftNavigation  
        └── AppraisalCheckInForm (controller)
            ├── useAppraisalContext() → extracts params
            ├── isQuarterlyFlow ? QuarterlyCheckIn : AnnualCheckIn
            └── AnnualCheckIn
                ├── useAnnualAppraisal() → data fetching & state
                ├── CheckInDescriptionSection
                ├── FinalScoreSummaryTable
                ├── CheckInSummaryTable (monthly data)
                ├── MeasurableKra
                ├── NonMeasurableKra (grouped by GROUP_NAME)
                ├── Development Inputs
                ├── Option-Based Inputs
                └── Submit Button
```

---

## 🌐 API Endpoints

### GET - Fetch Annual Appraisal Data
**Endpoint:** `GET /appraisal/employee_self_appraisal`

| Parameter | Value | Required |
|-----------|-------|----------|
| `empNo` | `38965` | ✅ |
| `url` | `4` | ✅ |
| `zoneName` | `Central Zone` | ✅ |
| `roleType` | `Administrative Officers` | ⚠️ (defaults) |
| `financialYear` | `2024` (extracted from FY 2024-25) | ✅ |
| `quarter` | `Q2` (hardcoded backend workaround) | ✅ |
| `pageType` | `self` | ✅ |
| `appraisalStatus` | `pending` | ✅ |

**cURL Example:**
```bash
curl 'http://localhost:8084/appraisal/employee_self_appraisal?empNo=38965&url=4&zoneName=Central%20Zone&roleType=Administrative%20Officers&financialYear=2024&quarter=Q2&pageType=self&appraisalStatus=pending'
```

### POST - Submit Annual Self Appraisal
**Endpoint:** `POST /appraisal/employee_self_appraisal/submit`

**Payload Structure:**
```json
{
  "id": "4",
  "empNo": "38965",
  "ecNumber": "38965",
  "financialYear": 2024,
  "continuousLearningPresent": false,
  "mandatoryCourses": 0,
  "learningCourses": 0,
  "speedCircular": 0,
  "elearningScore": 0,
  "kraData": [
    {
      "AP_KRA_ID": "...",
      "SCORE": 4,
      "ACTUAL": 4,
      "FIRSTCOMMENT": "User comment",
      "COMMENT_SELF_1": "User comment"
    }
  ],
  "functions": ["Change Management", "Leadership"],
  "feedbackInput": [],
  "questions": [
    {
      "QUESTION_ID": 1,
      "CATEGORY": "Development Inputs",
      "SUB_CATEGORY": "Overall Development",
      "QUESTION": "...",
      "SELF_RESPONSE": "User response"
    }
  ],
  "performanceMeasurableComment": "",
  "performanceNonMeasurableComment": "",
  "performanceSemiMeasurableComment": "",
  "warningFlag": false,
  "warningComment": "",
  "varianceFlag": false
}
```

---

## 🔐 Prerequisites

### Authentication
- `localStorage.accessToken` - JWT token (required)
- `localStorage.refreshToken` - For token refresh
- `localStorage.userData` - User information
- **Note:** `isAuthenticated = true` is hardcoded in `App.js` (development bypass)

### Backend
- API running on `http://localhost:8084`
- Valid employee data exists for `empNo=38965`
- Appraisal data configured for `FY 2024-25`

---

## 🧪 Test Cases

### Setup Verification

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-01 | Backend connectivity | Access `http://localhost:8084/health` | 200 OK |
| TC-02 | Frontend running | Access `http://localhost:3000` | App loads |
| TC-03 | Auth tokens present | Check `localStorage.accessToken` | Token exists |

### Navigation Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-04 | Direct URL navigation | Paste test URL in browser | AnnualCheckIn component renders |
| TC-05 | Back button | Click back button | Navigates to previous page |
| TC-06 | Missing empNo | Remove `empNo` from URL | Error: "No financial year or appraisal period found" |
| TC-07 | Missing financialYear | Remove `financialYear` from URL | Error state displayed |
| TC-08 | Missing appraisalPeriod | Remove `appraisalPeriod` from URL | Error state displayed |
| TC-09 | Quarterly vs Annual | Set `appraisalPeriod=Quarterly` | QuarterlyCheckIn renders instead |

### Data Loading Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-10 | API request params | Check Network tab for GET request | Correct params sent |
| TC-11 | Loading spinner | Observe page during load | Spinner shows during fetch |
| TC-12 | Data population | Verify all sections after load | Data matches API response |
| TC-13 | Empty KRA data | Test with employee having no KRAs | Sections hide gracefully |
| TC-14 | API failure | Stop backend, reload page | Error alert displays |

### Form Interaction Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-15 | Role selector | Change dropdown to APPRAISER | View switches, edit permissions change |
| TC-16 | KRA score selection | Click score buttons (1-5) | Score updates, UI reflects selection |
| TC-17 | Comment toggle | Click chat icon on KRA | Comment section expands/collapses |
| TC-18 | Appraisee comment | Enter text in comment textarea | State updates, persists |
| TC-19 | Development input | Enter response in textarea | State updates correctly |
| TC-20 | Option selection | Select Integrity/Health/Disciplinary | Radio selection persists |

### Validation Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-21 | Submit without scores | Leave KRA scores empty, click Submit | Toast: "Please select a score for..." |
| TC-22 | Submit without dev inputs | Leave required dev inputs empty | Toast: "Please provide a response..." |
| TC-23 | Multiple validation errors | Leave multiple fields empty | Up to 3 toasts + "And X more..." warning |
| TC-24 | All fields valid | Complete all required fields | Validation passes |

### Submission Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-25 | Submit loading state | Click Submit with valid form | Button shows "Submitting..." |
| TC-26 | Successful submission | Submit valid form | Success toast, navigates away |
| TC-27 | Submit payload structure | Check Network tab for POST body | Matches expected JSON structure |
| TC-28 | Submit failure | Simulate API error | Error toast, stays on page |

### Edge Case Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-29 | Token expiration | Wait for token to expire, interact | Auto-refresh triggers |
| TC-30 | Invalid employee | Use non-existent empNo | API error, alert displays |
| TC-31 | Network interruption | Disable network during submit | Error handling activates |
| TC-32 | URL encoded params | Test special chars in zoneName | Properly decoded |

---

## 📊 Data Sections to Verify

### CheckInDescriptionSection
- [ ] Employee Number displays correctly
- [ ] Duration shows correct date range
- [ ] Employee Name populated
- [ ] Branch/Office shows zoneName
- [ ] Appraiser name displays
- [ ] Role history timeline renders

### FinalScoreSummaryTable
- [ ] KRA names listed
- [ ] Weightages display correctly
- [ ] Total weightage sums to 100%

### Non-Measurable KRAs
- [ ] Grouped by `GROUP_NAME`
- [ ] Score buttons (1-5) functional
- [ ] Final score calculated correctly
- [ ] Comments expandable

### Development Inputs
- [ ] Overall Development section (Appraisee editable)
- [ ] Reporting Authority section (Appraiser editable)
- [ ] Review Authority section (Reviewer editable)

### Option-Based Inputs
- [ ] Integrity (3 options)
- [ ] Health Problems (Yes/No + details)
- [ ] Disciplinary Actions (Yes/No + details)

---

## 🛠️ Debug Utilities

### Console Logging
```javascript
// In component using useAuth
const { getDebugInfo } = useAuth();
console.log('Auth Debug:', getDebugInfo());
```

### React Query DevTools
- Available in development mode
- Check query cache state
- Inspect API response data

### API Test Route
- Navigate to `/api-test`
- Use `ApiTest` component for quick endpoint testing

---

## ✅ Test Execution Checklist

### Pre-Test Setup
- [ ] Backend running on localhost:8084
- [ ] Frontend running on localhost:3000
- [ ] Valid accessToken in localStorage
- [ ] Test employee (38965) exists in database
- [ ] Browser DevTools open (Network + Console tabs)

### Execution Order
1. [ ] Run Setup Verification tests (TC-01 to TC-03)
2. [ ] Run Navigation tests (TC-04 to TC-09)
3. [ ] Run Data Loading tests (TC-10 to TC-14)
4. [ ] Run Form Interaction tests (TC-15 to TC-20)
5. [ ] Run Validation tests (TC-21 to TC-24)
6. [ ] Run Submission tests (TC-25 to TC-28)
7. [ ] Run Edge Case tests (TC-29 to TC-32)

### Post-Test
- [ ] Document any bugs found
- [ ] Screenshot error states
- [ ] Note API response discrepancies

---

## 🔗 Related Files

- `plans/annual-appraisal-routes.md` - Route documentation
- `plans/api-integration-map.md` - API mapping
- `plans/mock-data-route.md` - Mock payloads
- `test-plan/annual-review.md` - Reviewer test plan

---

*Last Updated: November 2025*
