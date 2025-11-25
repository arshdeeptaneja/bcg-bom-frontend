# Product Requirements Document (PRD)
## Employee Performance Appraisal System & Login Portal

| **Project Name** | Performance Management System (PMS) - Self Appraisal Module |
| :--- | :--- |
| **Version** | 1.0 |
| **Status** | Draft (Based on UI Observation) |
| **Platform** | Web Application |

---

## 1. Executive Summary
This document outlines the requirements for the **Annual Performance Appraisal** workflow. The module allows employees to log in, access their performance dashboard, input self-evaluations against quantitative and qualitative metrics, and submit the appraisal to their reporting authority.

## 2. User Personas
* **Appraisee (Employee):** The primary user responsible for filling out self-ratings and descriptive performance reviews (e.g., User "Nisha").
* **Appraiser (Manager):** The user who receives the appraisal after submission (implied role based on status change).

---

## 3. User Flow
1.  **Authentication:** User logs in via the secure portal.
2.  **Navigation:** User selects the "Appraisal" module and the relevant Financial Year (FY).
3.  **Review Status:** User views the current status of their appraisal.
4.  **Input Data:** User completes the "Add Appraisal" form:
    * Reviews quantitative scores.
    * Selects ratings for behavioral attributes.
    * Inputs text for qualitative questions.
5.  **Validation:** User attempts submission; system checks for mandatory fields.
6.  **Submission:** User submits the form; system updates status to "Pending at Appraiser".

---

## 4. UI/UX Requirements

### 4.1 Login Portal
**Visual Elements:**
* Organization branding (Punjab & Sind Bank logo/banner).
* **Input Fields:**
    * `Employee ID` (Text).
    * `Password` (Masked).
    * `Captcha` (Alphanumeric image + text input).
* **Actions:**
    * Refresh Captcha icon.
    * Login Button (Green).

**Behavior:**
* **Validation:** Verify credentials and Captcha match.
* **Error State:** If validation fails, display a "Invalid Login" toast notification at the bottom right.

### 4.2 Home Dashboard
**Visual Elements:**
* **Header:** Greeting ("Welcome [Name], Good day!"), Profile Card (Name, Emp Num, Branch/Role).
* **Banner:** Inspirational quote.
* **Filters:** Dropdown for Financial Year selection (e.g., "FY 2025-26").
* **Modules:** Card layout for "Appraisal".

### 4.3 Appraisal Home
**Visual Elements:**
* **Summary Card:** Displays the number of pending appraisals (e.g., "1 Pending Appraisal(s)").
* **Action:** "View Details" button with an arrow icon.

### 4.4 Appraisee Dashboard (Status View)
**Header Info:**
* Display: Employee Name, Number, Scale, Date Range (01-APR to 31-MAR), Primary Role, Appraiser Name.
* **Status Indicators:**
    * **Appraisal Status:** Badge (e.g., `PENDING AT APPRAISEE` in Red).
    * **Appeal Status:** Badge (e.g., `NOT CREATED`).
* **Action:** "Add Appraisal" button (Green, bottom right).

---

## 5. The Appraisal Form Requirements

The form is a single-page, long-scroll interface divided into the following sections:

### 5.1 Score Summary
* **Component:** Read-only table.
* **Data Points:** KRAs, Weightage, Final Score (Auto-calculated).

### 5.2 Discretionary Measurable KRA
* **Component:** Data Table.
* **Columns:** Variable KRA Name, Actual, Target, Weightage, Final Score.
* **Logic:** Scores are calculated based on `Actual` vs `Target`.

### 5.3 Discretionary Non-Measurable KRA (Behavioral)
* **Input Type:** 5-point Likert Scale (Horizontal selection boxes 1-5).
* **UI:** Selected value highlights in Green.
* **Dimensions:**
    * Managerial Dimensions (Change Management, Collaboration).
    * Communication & Presence.
    * Customer Focus.
    * Decision Making.
    * Digital Mindset & Adaptability.
    * Discipline & Punctuality.
    * Individual Ownership & Accountability.
    * Integrity & Trust.
    * Leadership Skills.

### 5.4 Development Inputs (Qualitative)
* **Input Type:** Multi-line text areas.
* **Requirement:** Fields marked with a Red Asterisk (`*`) are mandatory.
* **Questions:**
    * Highlights of performance during the year `*`.
    * Areas in which I feel I have not done well `*`.
    * Constraints faced `*`.
    * Training needs `*`.
    * Outstanding achievements (routine & outside bank) `*`.
    * Suggestions for growth `*`.
    * Health Problems (Optional).
    * Disciplinary Actions (Optional).

---

## 6. Functional Requirements & Logic

### 6.1 Validation Logic
* **Trigger:** User clicks "Submit".
* **Condition:** Check if any field marked with `*` is null or empty.
* **Action:**
    * If invalid: Stop submission. Display Modal/Alert: **"Please enter responses for all mandatory fields."**
    * If valid: Proceed to submission.

### 6.2 Submission & Post-Condition
* **Trigger:** User successfully validates and submits.
* **Action:**
    1.  Save data to backend.
    2.  Display Success Modal: **"Success! Your annual appraisal has been submitted successfully."**
    3.  Update Appraisal Status from `PENDING AT APPRAISEE` to `PENDING AT APPRAISER`.
    4.  Redirect user to the Dashboard.

---

## 7. Technical Notes
* **Session Management:** Ensure the session persists during long form-filling.
* **Autosave:** (Recommended) Implement autosave for text fields to prevent data loss.
* **Responsiveness:** The layout is currently optimized for Desktop/Web view.