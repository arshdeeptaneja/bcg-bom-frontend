## Plan: Annual Appraisal Review Flow (Appraiser/Reviewer)

Create a separate Annual Appraisal Review component for Appraiser evaluation with dedicated API integration, hook, and CSS file.

### Steps

1. **Add `getReporteeAppraisal` API method in [`src/services/api.js`](src/services/api.js)** — Add `appraisalAPI.getReporteeAppraisal({ empNo, financialYear, quarter, url, zoneName, roleType })` calling `GET /appraisal/reportee_appraisal`; add mocked `submitReporteeAppraisal` returning `{ success: true, message: 'Appraisal submitted successfully' }`.

2. **Create `useAnnualAppraisalReview.js` in [`src/pages/Appraisal/AppraisalCheckInForm/annual/`](src/pages/Appraisal/AppraisalCheckInForm/annual/)** — Extract params from `location.state` (`empNo`, `financialYear`, `quarter`, `url`, `zoneName`, `roleType`), call `getReporteeAppraisal`, manage state for appraiser scores/comments (`appraiserScores: { [AP_KRA_ID]: { score, comment } }`), development responses for IDs 12-18, mocked submit handler.

3. **Create `AnnualAppraisalReview.js` in same folder** — Title "Annual Appraisal - Appraiser Review", render: `CheckInDescriptionSection`, Final Score Summary (read-only from `annual_score_summary`), Non-Measurable KRAs with appraisee score (read-only) + Appraiser Score input (1-5) + Appraiser Comment textarea, Development Inputs showing appraisee responses (read-only) + Reporting Authority questions (12-18) as editable, Submit button.

4. **Create `AnnualAppraisalReview.css` in same folder** — Separate stylesheet with appraiser-specific styles: read-only field styling, appraiser input highlighting, score selector buttons, comment section layout.

5. **Update exports and routing** — Export from [`src/pages/Appraisal/AppraisalCheckInForm/annual/index.js`](src/pages/Appraisal/AppraisalCheckInForm/annual/index.js), add to [`src/pages/index.js`](src/pages/index.js), add route `/appraisal/annual/appraiser-review` in [`App.js`](src/App.js) expecting `location.state` with all required API params.

### Further Considerations

1. **Validation before submit** — Should we validate that all KRAs have appraiser scores and all Reporting Authority questions (12-18) are filled before allowing submission?
