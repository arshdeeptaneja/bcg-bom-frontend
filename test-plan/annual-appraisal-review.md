# Annual Appraisal Review (Appraiser) - Test Plan

**Component:** `AnnualAppraisalReview.js`  
**Route:** `/appraisal/annual/appraiser-review`  
**Purpose:** Appraiser/Reviewer assessment of reportee's annual appraisal  
**Last Updated:** November 2025

---

## Overview

This test plan covers the `AnnualAppraisalReview` component which allows an Appraiser to:
- View appraisee's self-appraisal data (read-only)
- Enter scores (1-5) for each Non-Measurable KRA
- Add comments for each KRA
- Respond to Reporting Authority questions (IDs 12-18)
- Complete integrity assessment
- Submit the appraiser review

---

## Test Environment Setup

### Prerequisites
- Backend API running on `localhost:8084`
- Frontend running on `localhost:3000`
- Valid test employee data in database

### Test Data

| Field | Value | Notes |
|-------|-------|-------|
| Employee Number | `38965` | Test appraisee |
| Financial Year | `FY 2024-25` | Current FY |
| URL/Assignment ID | `4` | Required |
| Quarter | `Q2` | Default for annual |
| Role Type | `Administrative Officers` | Default |
| Zone Name | `Test Zone` | Optional |

### Test URLs

**Minimal URL (Required Params Only):**
```
http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&url=4
```

**Full URL (All Params):**
```
http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Test%20Zone&roleType=Administrative%20Officers
```

---

## API Endpoints

### GET - Fetch Reportee Appraisal Data

| Aspect | Details |
|--------|---------|
| Endpoint | `GET /appraisal/reportee_appraisal` |
| Purpose | Fetch appraisee's self-appraisal for appraiser to review |

**Query Parameters:**

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `empNo` | string | ✅ | `38965` |
| `financialYear` | string | ✅ | `2024` (normalized from `FY 2024-25`) |
| `quarter` | string | ❌ | `Q2` |
| `url` | string | ✅ | `4` |
| `zoneName` | string | ❌ | `Test Zone` |
| `roleType` | string | ❌ | `Administrative Officers` |

### POST - Submit Appraiser Review

| Aspect | Details |
|--------|---------|
| Endpoint | `POST /appraisal/reportee_appraisal/submit` |
| Content-Type | `application/json` |

**Payload Structure:**
```json
{
  "id": "4",
  "empNo": "38965",
  "ecNumber": "38965",
  "financialYear": 2024,
  "continuousLearningPresent": true,
  "mandatoryCourses": 5,
  "learningCourses": 10,
  "speedCircular": 3,
  "elearningScore": 85,
  "kraData": [
    {
      "AP_KRA_ID": 123,
      "KRA_DESC": "Customer Service Excellence",
      "REPA_ACTUALS": 4,
      "COMMENT_REPA": "Good performance"
    }
  ],
  "functions": ["Customer Service", "Operations"],
  "feedbackInput": [],
  "questions": [
    {
      "QUESTION_ID": 12,
      "CATEGORY": "Development",
      "QUESTION": "Training needs identified",
      "REPA_RESPONSE": "Communication skills training recommended"
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

## Test Cases

### TC-01: Page Load - Valid URL Parameters

**Objective:** Verify page loads correctly with all required URL parameters

**Steps:**
1. Navigate to: `http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&url=4`
2. Wait for page to load

**Expected Results:**
- [ ] Loading spinner displays during API fetch
- [ ] Page header shows "Annual Appraisal"
- [ ] Back button is visible and functional
- [ ] `CheckInDescriptionSection` displays employee info (name, designation, zone)
- [ ] Date range section shows appraisal period
- [ ] Note about raising exceptions is visible
- [ ] `FinalScoreSummaryTable` renders with KRA data
- [ ] Non-Measurable KRA section displays grouped KRAs
- [ ] Development Inputs sections are visible
- [ ] Submit button is enabled

**API Verification:**
- [ ] Network tab shows `GET /appraisal/reportee_appraisal` call
- [ ] Request includes correct query params
- [ ] Response status is 200

---

### TC-02: Page Load - Missing Required Parameters

**Objective:** Verify appropriate error handling when required params are missing

**Steps:**
1. Navigate to: `http://localhost:3000/appraisal/annual/appraiser-review`
2. Observe page behavior

**Expected Results:**
- [ ] Warning alert displays: "No financial year or appraisal period found"
- [ ] User is prompted to navigate from dashboard
- [ ] No API call is made

---

### TC-03: Page Load - State Navigation

**Objective:** Verify page works when navigated via `location.state`

**Steps:**
1. From another page, use:
```javascript
navigate('/appraisal/annual/appraiser-review', {
  state: {
    empNo: '38965',
    financialYear: 'FY 2024-25',
    url: '4',
    zoneName: 'Test Zone',
    roleType: 'Administrative Officers'
  }
});
```
2. Verify page loads correctly

**Expected Results:**
- [ ] Page loads without URL params
- [ ] State values are used for API call
- [ ] All sections render correctly

---

### TC-04: Final Score Summary Table

**Objective:** Verify FinalScoreSummaryTable displays KRA data correctly

**Steps:**
1. Load page with valid params
2. Scroll to "Final Score Summary" section

**Expected Results:**
- [ ] Table renders with KRA rows
- [ ] Columns display: KRA name, weights, scores
- [ ] Data matches API response `finalScoreSummary`
- [ ] Table is read-only (no edit controls)

---

### TC-05: Non-Measurable KRA - Score Selection

**Objective:** Verify appraiser can select scores (1-5) for each KRA

**Steps:**
1. Load page with valid params
2. Scroll to "Discretionary KRA" > "Non-Measurable" section
3. For each KRA, click score buttons 1, 2, 3, 4, 5

**Expected Results:**
- [ ] KRAs are grouped by `kraGroupType`
- [ ] Group headers display correctly (e.g., "Behavioral", "Functional")
- [ ] Each KRA row shows:
  - KRA name with asterisk (required indicator)
  - Info icon with tooltip (if `Tooltip` exists)
  - KRA description in italic
- [ ] Score buttons (1-5) are clickable
- [ ] Selected score button shows `annual-score-btn-selected` style
- [ ] Final Score box updates to show selected score
- [ ] Changing score updates the selection

---

### TC-06: Non-Measurable KRA - Comment Toggle

**Objective:** Verify comment sections expand/collapse correctly

**Steps:**
1. Load page with valid params
2. Click chat icon on first KRA row
3. Click chat icon again

**Expected Results:**
- [ ] First click: Comment section expands below KRA row
- [ ] "Appraisee Comment" label shows with read-only content
- [ ] "Appraiser Comment" textarea is editable
- [ ] Second click: Comment section collapses
- [ ] Chat icon color changes when comment is entered (green vs blue)

---

### TC-07: Non-Measurable KRA - Enter Comments

**Objective:** Verify appraiser can enter comments for each KRA

**Steps:**
1. Expand comment section for a KRA
2. Type comment in "Appraiser Comment" textarea
3. Collapse and re-expand section

**Expected Results:**
- [ ] Textarea accepts input
- [ ] Comment is preserved after collapse/expand
- [ ] Chat icon turns green when comment exists
- [ ] Comment included in form state `appraiserScores[kraId].comment`

---

### TC-08: Development Inputs - Overall Development (Read-Only)

**Objective:** Verify appraisee's development responses display correctly

**Steps:**
1. Scroll to "Development Inputs - Overall Development" section
2. Review displayed responses

**Expected Results:**
- [ ] Section displays if `developmentInputs.overallDevelopment` has items
- [ ] Each question shows numbered label
- [ ] Appraisee's response displays in read-only box
- [ ] Additional response (`selfResponse2`) displays if present
- [ ] No edit controls visible

---

### TC-09: Development Inputs - Reporting Authority (Editable)

**Objective:** Verify appraiser can enter responses for authority questions

**Steps:**
1. Scroll to "Remarks by Reporting Authority / Reviewing Authority" section
2. Enter responses in each textarea
3. Verify all fields accept input

**Expected Results:**
- [ ] Section displays if `developmentInputs.reportingReviewAuthority` has items
- [ ] Authority names display in header (if available)
- [ ] Each question has editable textarea
- [ ] Responses saved to `appraiserDevResponses[questionId]`
- [ ] Placeholder text shows "Enter Response"

---

### TC-10: Option-Based Inputs - Integrity Assessment

**Objective:** Verify integrity radio options work correctly

**Steps:**
1. Scroll to "Additional Information" section
2. Select each radio option

**Expected Results:**
- [ ] Section displays if `developmentInputs.optionBased` has items
- [ ] Radio buttons grouped by question
- [ ] Selecting option updates `appraiserOptionResponses`
- [ ] Appraiser-editable options are clickable
- [ ] Read-only options (appraisee responses) are disabled
- [ ] Visual distinction between editable/non-editable

---

### TC-11: Validation - Missing Scores

**Objective:** Verify validation catches missing appraiser scores

**Steps:**
1. Load page with valid params
2. Do NOT select scores for some KRAs
3. Click Submit button

**Expected Results:**
- [ ] Form validation runs
- [ ] Error messages display for each missing score
- [ ] Submit is prevented
- [ ] Toast or alert shows: "Please select an appraiser score for [KRA name]"

---

### TC-12: Validation - Missing Development Responses

**Objective:** Verify validation catches missing authority responses

**Steps:**
1. Select scores for all KRAs
2. Leave one or more Reporting Authority responses empty
3. Click Submit button

**Expected Results:**
- [ ] Validation error for each missing response
- [ ] Message includes truncated question text
- [ ] Submit is prevented

---

### TC-13: Submit - Success Flow

**Objective:** Verify successful form submission

**Steps:**
1. Complete all required fields:
   - Select scores (1-5) for all Non-Measurable KRAs
   - Enter all Reporting Authority responses
   - Optionally add KRA comments
   - Select integrity option
2. Click Submit button
3. Wait for submission

**Expected Results:**
- [ ] Button shows "Submitting..." and is disabled
- [ ] `POST /appraisal/reportee_appraisal/submit` called
- [ ] Payload includes:
  - `kraData` with `REPA_ACTUALS` (scores) and `COMMENT_REPA` (comments)
  - `questions` with `REPA_RESPONSE` (authority responses)
  - `id`, `empNo`, `financialYear`
  - Learning metrics (preserved from GET)
- [ ] Success toast displays
- [ ] User navigated back or to confirmation page

---

### TC-14: Submit - Payload Verification

**Objective:** Verify correct payload structure in POST request

**Steps:**
1. Complete form with known values:
   - KRA 1: Score = 4, Comment = "Good work"
   - Authority Q12: "Training needed in leadership"
2. Open Network tab before clicking Submit
3. Click Submit

**Expected Results:**
- [ ] POST request body matches expected structure
- [ ] `kraData` array contains all KRAs with appraiser scores
- [ ] Original appraisee data preserved (`SELF1_ACTUALS`, etc.)
- [ ] `questions` array has `REPA_RESPONSE` for authority questions
- [ ] `financialYear` is normalized (e.g., `2024` not `FY 2024-25`)

---

### TC-15: Error Handling - API Failure (GET)

**Objective:** Verify graceful handling of GET API errors

**Steps:**
1. Simulate API failure (disable backend or use invalid params)
2. Navigate to page

**Expected Results:**
- [ ] Loading spinner eventually stops
- [ ] Error alert displays: "Failed to load reportee appraisal data"
- [ ] Page remains navigable (back button works)
- [ ] No JS console errors (unhandled exceptions)

---

### TC-16: Error Handling - API Failure (POST)

**Objective:** Verify graceful handling of POST API errors

**Steps:**
1. Complete form
2. Simulate API failure (disconnect backend)
3. Click Submit

**Expected Results:**
- [ ] Button re-enables after failure
- [ ] Error toast displays with message
- [ ] Form data is preserved (user can retry)
- [ ] No page crash

---

### TC-17: Loading State

**Objective:** Verify loading spinner displays during data fetch

**Steps:**
1. Throttle network to slow 3G
2. Navigate to page
3. Observe loading state

**Expected Results:**
- [ ] `LoadingSpinner` component renders
- [ ] Header still visible during loading
- [ ] Spinner replaced by content when data loads
- [ ] No layout shift after loading

---

### TC-18: Back Navigation

**Objective:** Verify back button returns to previous page

**Steps:**
1. Navigate from Appraiser Dashboard to this page
2. Click Back button

**Expected Results:**
- [ ] User returns to previous page (dashboard)
- [ ] Browser history updated correctly
- [ ] No form data persisted (unless designed to)

---

### TC-19: Unsaved Changes Warning (if implemented)

**Objective:** Verify user warned before leaving with unsaved changes

**Steps:**
1. Load page and make changes (select scores)
2. Click Back button or navigate away
3. Observe behavior

**Expected Results:**
- [ ] If `isDirty` is true, warning prompt appears
- [ ] User can choose to stay or leave
- [ ] Submitting clears dirty state

---

## Edge Cases

### EC-01: Empty KRA List

**Scenario:** API returns no Non-Measurable KRAs

**Expected:** 
- [ ] "Discretionary KRA" section not rendered
- [ ] Page still functional with other sections

---

### EC-02: Empty Development Inputs

**Scenario:** API returns no development questions

**Expected:**
- [ ] Development sections not rendered
- [ ] Validation skips missing sections
- [ ] Submit still works

---

### EC-03: Very Long KRA Descriptions

**Scenario:** KRA name or description is extremely long

**Expected:**
- [ ] Text wraps correctly
- [ ] Layout doesn't break
- [ ] Tooltip shows full text if truncated

---

### EC-04: Special Characters in Comments

**Scenario:** User enters special characters: `<script>`, `"quotes"`, `emoji 🎉`

**Expected:**
- [ ] Characters saved correctly
- [ ] No XSS vulnerability
- [ ] Payload JSON properly escaped

---

### EC-05: Different Role Types

**Scenario:** Test with various `roleType` values

**Test Values:**
- `Administrative Officers` (default)
- `Clerical`
- `Sub-Staff`
- `Officers`

**Expected:**
- [ ] KRA grouping handles all job families
- [ ] No undefined or missing data

---

## Performance Tests

### PT-01: Large KRA List

**Scenario:** 50+ KRAs to display and score

**Expected:**
- [ ] Page renders within 3 seconds
- [ ] Score selection is responsive
- [ ] No lag when toggling comments

---

### PT-02: Rapid Score Changes

**Scenario:** Quickly click through all score options on multiple KRAs

**Expected:**
- [ ] All selections register correctly
- [ ] No race conditions
- [ ] Final state accurate

---

## Accessibility Tests

### AT-01: Keyboard Navigation

**Steps:**
1. Navigate page using Tab key
2. Select scores using Enter/Space
3. Toggle comments with keyboard

**Expected:**
- [ ] All interactive elements focusable
- [ ] Focus order logical
- [ ] Score buttons keyboard accessible

---

### AT-02: Screen Reader

**Steps:**
1. Use VoiceOver/NVDA to navigate page
2. Verify announcements

**Expected:**
- [ ] KRA names and descriptions read correctly
- [ ] Score buttons have accessible labels
- [ ] Required field indicators announced

---

## Test Execution Checklist

| Test Case | Status | Tester | Date | Notes |
|-----------|--------|--------|------|-------|
| TC-01 | ⬜ | | | |
| TC-02 | ⬜ | | | |
| TC-03 | ⬜ | | | |
| TC-04 | ⬜ | | | |
| TC-05 | ⬜ | | | |
| TC-06 | ⬜ | | | |
| TC-07 | ⬜ | | | |
| TC-08 | ⬜ | | | |
| TC-09 | ⬜ | | | |
| TC-10 | ⬜ | | | |
| TC-11 | ⬜ | | | |
| TC-12 | ⬜ | | | |
| TC-13 | ⬜ | | | |
| TC-14 | ⬜ | | | |
| TC-15 | ⬜ | | | |
| TC-16 | ⬜ | | | |
| TC-17 | ⬜ | | | |
| TC-18 | ⬜ | | | |
| TC-19 | ⬜ | | | |
| EC-01 | ⬜ | | | |
| EC-02 | ⬜ | | | |
| EC-03 | ⬜ | | | |
| EC-04 | ⬜ | | | |
| EC-05 | ⬜ | | | |
| PT-01 | ⬜ | | | |
| PT-02 | ⬜ | | | |
| AT-01 | ⬜ | | | |
| AT-02 | ⬜ | | | |

---

## Known Issues & Limitations

1. **No Mock Data:** Testing requires live backend on `localhost:8084`
2. **Auth Bypass:** `isAuthenticated` is currently hardcoded to `true` in `App.js`
3. **Token Hardcoded:** Bearer token hardcoded in `api.js` interceptor

---

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualAppraisalReview.js` | Main component |
| `src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualAppraisalReview.js` | Custom hook |
| `src/pages/Appraisal/AppraisalCheckInForm/annual/annualAppraisalTransformers.js` | Data transformers |
| `src/components/Appraisal/FinalScoreSummaryTable/` | KRA summary table |
| `src/components/Appraisal/CheckInDescriptionSection/` | Employee info section |
| `src/services/api.js` | API client |
| `plans/annual-appraisal-routes.md` | Route reference |

---

*Test Plan Version: 1.0*
