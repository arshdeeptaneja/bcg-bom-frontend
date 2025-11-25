# Product Requirements Document (PRD)
## Project: Annual Performance Appraisal & Appeal System
**Version:** 1.0
**Date:** October 26, 2025
**Based on:** User Workflow Video Analysis (Punjab & Sind Bank HRMS Interface)

---

## 1. Executive Summary
The goal is to implement a digitized Annual Performance Appraisal workflow within the HRMS. The system manages the lifecycle of employee performance reviews, moving through three distinct stages: **Appraiser Evaluation**, **Reviewer Validation**, and **Employee Appeal**. The system automates score calculations, enforces hierarchical approvals, and provides a dispute resolution mechanism via file uploads.

---

## 2. User Personas & Roles

| Persona | Role | Responsibilities |
| :--- | :--- | :--- |
| **Appraisee (Employee)** | Subject | View final scores, accept appraisal, or initiate an appeal with evidence. |
| **Appraiser** | Reporting Authority | First-level evaluator. Inputs qualitative feedback, KRA data, and competency ratings. |
| **Reviewer** | Reviewing Authority | Second-level validator. Reviews Appraiser inputs, modifies scores if necessary, and finalizes the appraisal. |

---

## 3. Functional Requirements

### 3.1 Module: Appraisal Dashboard (Common Elements)
* **Header:** Must display User Name, Employee ID, and Branch/Office.
* **Period Selector:** Dropdown to toggle between Financial Years (e.g., FY 2025-26).
* **Cycle Tabs:** Toggle between "Annual Year" and "Quarterly" reviews.
* **Status Cards:**
    * *Forms to be filled:* Count of pending actions.
    * *Pending Appraisal(s):* Count of workflows stuck in progress.
    * *Roles to be appraised/reviewed:* Quick access to specific workflows.

### 3.2 Module: Appraiser Evaluation (Reporting Authority)
**Workflow:**
1.  **Selection:** Select employee from the "Pending at Appraiser" list.
2.  **Qualitative Inputs:** Mandatory text fields for:
    * Highlights of performance.
    * Areas of non-performance.
    * Constraints faced.
    * Training needs.
3.  **Quantitative Scoring (KRAs):**
    * Input fields for "Actual" achievement vs "Target".
    * *System Logic:* Auto-calculate weighted score based on `(Actual / Target) * Weightage`.
4.  **Competency Rating:**
    * **UI Component:** Horizontal integer scale (1 to 5).
    * **Behavior:** Selecting a number highlights it in Green.
    * **Categories:** Change Management, Collaboration, Communication, Customer Focus, Decision Making, etc.
5.  **Submission:**
    * "Save Draft" and "Submit" options.
    * **Validation:** Modal popup "You are about to submit appraisal reportee. Please review...".
    * *Post-Condition:* Status changes to "Pending at Reviewer".

### 3.3 Module: Reviewer Validation (Reviewing Authority)
**Workflow:**
1.  **Visibility:** View full report submitted by the Appraiser.
2.  **Modification:**
    * Reviewer allows editing of "Reporting Authority Score" or inputting a separate "Reviewer Score".
    * System recalculates the "Final Score" dynamically.
3.  **Submission:**
    * Finalizes the appraisal cycle.
    * *Post-Condition:* Status changes to "Completed".
    * *Trigger:* Report becomes visible to the Employee.

### 3.4 Module: Employee Appeal (Dispute Resolution)
**Workflow:**
1.  **Access:** Employee views "Completed" appraisal.
2.  **Appeal Trigger:** Button to "Add Appeal" if dissatisfied with the score.
3.  **Dispute Form:**
    * **Comparison View:** Table displaying "KRA Name", "Reporting Authority Score" (Read-only), and "Add Score" (Editable).
    * **Self-Scoring:** Employee inputs their desired score against specific line items (e.g., changing "Integrity & Trust" from 3.0 to 4.0).
    * **Total Calculation:** System updates the "Total Score" preview in real-time based on the appeal inputs.
4.  **Evidence Submission:**
    * **File Uploader:** "Choose File" button.
    * **Supported Formats:** .zip, .pdf, .jpg, .png.
    * **Constraints:** Max file size (e.g., 5 MB).
5.  **Confirmation:**
    * Success Modal: "Your Appeal has been registered successfully! Appeal # [ID]".
    * Instruction text: "For further doubt... contact HR."

---

## 4. UI/UX Specifications

### 4.1 Visual Hierarchy
* **Progress Stepper:** A horizontal visual guide showing the hierarchy context (Officer -> Role -> Branch).
* **Accordion Layout:** Grouping fields into collapsible sections (e.g., "Development Inputs", "Score Summary", "Discretionary KRAs").
* **Color Coding:**
    * **Green:** Selected ratings, Primary buttons, Success toasts.
    * **Red:** Mandatory field warnings, "Pending" status badges.
    * **Grey:** Read-only fields.

### 4.2 Data Visualization
* **Score Summary Table:** A summary block at the bottom of the form summing up:
    * Business Dimension (Weightage vs Score)
    * Discretionary Measurable KRAs
    * Competencies
    * **Final Score (Out of 100)**

---

## 5. Technical Constraints & Validation
* **Input Validation:**
    * "Actual" values cannot exceed logical limits defined per KRA.
    * Text inputs must handle special characters.
    * File uploads must be scanned for security and validated for size.
* **State Management:**
    * The "Submit" action is irreversible. Once the status transitions (e.g., Appraiser -> Reviewer), the previous actor loses write access.
* **Audit Trail:**
    * System must log timestamps for every submission (Appraiser Date, Reviewer Date, Appeal Date).

---

## 6. Notification System (Implied)
* **Email/System Alert:** To Reviewer when Appraiser submits.
* **Email/System Alert:** To Employee when Reviewer finalizes.
* **Email/System Alert:** To HR Admin when an Appeal is lodged.