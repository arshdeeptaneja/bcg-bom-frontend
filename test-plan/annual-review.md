# Annual Review POST Endpoint - Test Plan

## Overview

This document outlines the test plan for validating the Annual Review POST endpoint integration in `AnnualReview.js` and `useAnnualReview.js`.

**API Endpoint:** `POST /appraisal/acceptor_appraisal/submit`

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Backend API | Running on `localhost:8084` |
| Frontend | Running on `localhost:3000` |
| Test Employee | `empNo: 38965` (or valid employee with annual appraisal data) |
| Financial Year | `FY 2024-25` or current FY |
| Browser | Chrome/Firefox with DevTools |

---

## Test Cases

### TC-01: Navigate to Annual Review Page

**Steps:**
1. Login to the application
2. Navigate to Appraisal Home dashboard
3. Select **Annual** appraisal period
4. Select a financial year (e.g., `FY 2024-25`)
5. Click on a reportee row to open the Annual Review form

**Expected Results:**
- Page loads successfully
- Title displays "Annual Appraisal - Reviewer"
- No role dropdown is visible (removed in this update)

---

### TC-02: Verify GET API Data Loading

**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to Annual Review page
3. Observe network requests

**Expected Results:**
- `GET /appraisal/acceptor_appraisal` request fires
- Request params include: `empNo`, `financialYear`, `url`, `roleType`, `zoneName`
- Response returns KRA data and development inputs
- Final Score Summary table populates correctly
- Non-Measurable KRAs section displays grouped KRAs

---

### TC-03: Fill Non-Measurable KRA Scores

**Steps:**
1. Locate the "Discretionary KRA" section
2. For each KRA, click a score button (1, 2, 3, 4, or 5)

**Expected Results:**
- Selected button highlights with blue background (`annual-score-btn-selected`)
- Final Score column updates to show selected value
- Other buttons remain in outline state

---

### TC-04: Add KRA Comments

**Steps:**
1. Click the chat icon (💬) on any KRA row
2. Observe the expanded comment section
3. Enter text in the "Reviewer Comment" textarea
4. Collapse and re-expand the section

**Expected Results:**
- Comment section expands showing 3 areas:
  - Appraisee Comment (read-only)
  - Appraiser Comment (read-only)
  - Reviewer Comment (editable)
- Chat icon turns green after entering text
- Comment persists after collapse/expand

---

### TC-05: Fill Development Inputs

**Steps:**
1. Scroll to "Remarks by Reporting Authority / Reviewing Authority" section
2. Observe the Reporting Authority responses (if any)
3. Enter responses in each editable textarea

**Expected Results:**
- Reporting Authority responses display as read-only text
- Reviewer can enter text in editable textareas
- Text persists after scrolling away and back

---

### TC-06: Select Integrity Option

**Steps:**
1. Scroll to "Additional Information" section
2. Locate the Integrity question (3 radio options)
3. Select one of the options
4. Observe Health Problems and Disciplinary Actions questions

**Expected Results:**
- Integrity options are clickable and selectable
- Only one option can be selected at a time
- Health Problems and Disciplinary Actions are disabled (read-only)

---

### TC-07: Submit Form - Success Flow

**Steps:**
1. Fill all required fields:
   - All KRA scores
   - All development input responses
   - Integrity option
2. Click **Submit** button
3. Open DevTools → Network tab

**Expected Results:**
- `POST /appraisal/acceptor_appraisal/submit` request fires
- Button shows "Submitting..." while processing
- Success toast appears: "Review submitted successfully"
- Page navigates back to previous screen

---

### TC-08: Verify Payload Structure

**Steps:**
1. In DevTools Network tab, click on the POST request
2. View the Request Payload

**Expected Payload Fields:**

```json
{
  "id": "4",
  "empNo": "38965",
  "ecNumber": "38965",
  "financialYear": 2025,
  "continuousLearningPresent": true,
  "mandatoryCourses": 0,
  "learningCourses": 0,
  "speedCircular": 0,
  "elearningScore": 0,
  "kraData": [
    {
      "AP_KRA_ID": 120,
      "KRA_DESC": "Change Management",
      "REVA_ACTUALS": 4,
      "AC_ACTUALS": 4,
      "REVA_SCORE": 4,
      "AC_SCORE": 4,
      "COMMENT_REVA": "Good performance",
      "COMMENT_AC": "Good performance",
      "FIRSTCOMMENT": "Good performance"
    }
  ],
  "functions": ["Change Management"],
  "questions": [
    {
      "QUESTION_ID": 1,
      "CATEGORY": "Development Inputs",
      "SUB_CATEGORY": "Overall Development",
      "SELF_RESPONSE": "...",
      "SELF_RESPONSE_OPTION": "...",
      "REVA_RESPONSE": "...",
      "AC_RESPONSE": "...",
      "integrityOption": "option1"
    }
  ],
  "feedbackInput": [],
  "performanceMeasurableComment": "",
  "performanceNonMeasurableComment": "",
  "performanceSemiMeasurableComment": "",
  "warningFlag": false,
  "warningComment": "",
  "varianceFlag": false
}