# Appeal Review API → UI Key Mappings

Quick reference for how API response fields map to UI state in `useReviewAppeal.js`.

---

## 1. Employee Information

**API Source:** Root level of API response

| API Key | UI State | Description |
|---------|----------|-------------|
| `emp_name` | `data.employee.employeeName` | Employee name |
| `organisation` | `data.employee.branch` | Branch/Organization |
| `primary` | `data.employee.primaryRole` | Primary role |
| `REPORTING_AUTHORITY_NAME` | `data.employee.appraiser` | Appraiser name |
| `REPORTING_AUTHORITY_NO` | `data.employee.appraiserNo` | Appraiser employee number |
| `REVIEWING_AUTHORITY_NAME` | `data.employee.reviewer` | Reviewer name |
| `REVIEWING_AUTHORITY_NO` | `data.employee.reviewerNo` | Reviewer employee number |
| `ACCEPTING_AUTHORITY_NAME` | `data.employee.acceptor` | Acceptor name |
| `ACCEPTING_AUTHORITY_NO` | `data.employee.acceptorNo` | Acceptor employee number |
| `startdate` / `enddate` | `data.dateRange` | Appraisal period |

---

## 2. Final Score Summary

**API Source:** `final_summary_result.annual_score_data`

| API Key | UI State | Description |
|---------|----------|-------------|
| `CATEGORY` | `finalScoreSummary[].KraName` | Score category |
| `MAX_SCORE` | `finalScoreSummary[].MaxScore` | Maximum possible score |
| `SELF_SCORE` | `finalScoreSummary[].SelfScore` | Self-assessed score |
| `BY_REPORTING_AUTHORITY` | `finalScoreSummary[].ReportingAuthorityScore` | Appraiser score |
| `BY_REVIEVING_AUTHORITY` | `finalScoreSummary[].ReviewingAuthorityScore` | Reviewer score |
| `BY_ACCEPTING_AUTHORITY` | `finalScoreSummary[].AcceptingAuthorityScore` | Acceptor score |
| `POST_APPEAL_SCORE` | `finalScoreSummary[].PostAppealScore` | Score after appeal |

---

## 3. Measurable KRAs

**API Source:** `result_kra_list_discretionary_measurable_child`

| API Key | UI State | Description |
|---------|----------|-------------|
| `AP_KRA_ID` | `measurableKras[].kraId` | KRA identifier |
| `APPEAL_ID` | `measurableKras[].appealId` | **Unique key for selection** |
| `KRA_DESC` | `measurableKras[].kraName` | KRA name/title |
| `KRA_TYPE` | `measurableKras[].kraType` | Type (discretionary_measurable) |
| `KRA_METRIC` | `measurableKras[].description` | KRA description |
| `AC_ACTUALS` / `ACTUAL` | `measurableKras[].actual` | Actual value |
| `AC_TARGET` / `TARGET` | `measurableKras[].target` | Target value |
| `MAX_SCORE` | `measurableKras[].maxScore` | Maximum score |
| `SCORE_OLD_VALUE` | `measurableKras[].oldScore` | Original score |
| `SCORE_NEW_VALUE` | `measurableKras[].newScore` | Appealed score |
| `ACTUAL_OLD_VALUE` | `measurableKras[].actualOldValue` | Previous actual |
| `ACTUAL_NEW_VALUE` | `measurableKras[].actualNewValue` | New actual |
| `TARGET_OLD_VALUE` | `measurableKras[].targetOldValue` | Previous target |
| `TARGET_NEW_VALUE` | `measurableKras[].targetNewValue` | New target |
| `COMMENTS` | `measurableKras[].appraiseeComment` | Appraisee comment |
| `SELF_SCORE` | `measurableKras[].appraiseeScore` | Self score |
| `REPA_SCORE` | `measurableKras[].appraiserScore` | Appraiser score |
| `REVA_SCORE` | `measurableKras[].reviewerScore` | Reviewer score |
| `STATUS` | `measurableKras[].status` | Appeal status |
| `MPB_OLD_VALUE` | `measurableKras[].mpbOldValue` | Old MPB value |
| `MPB_NEW_VALUE` | `measurableKras[].mpbNewValue` | New MPB value |

---

## 4. Non-Measurable KRAs

**API Source:** `result_kra_list_discretionary_non_measurable_child`

*Same mapping as Measurable KRAs, stored in `nonMeasurableKras[]`*

| API Key | UI State |
|---------|----------|
| `AP_KRA_ID` | `nonMeasurableKras[].kraId` |
| `APPEAL_ID` | `nonMeasurableKras[].appealId` |
| *(same fields as above)* | *(same structure)* |

---

## 5. Discretionary Score Totals

**API Source:** Calculated from KRAs + root level

| API Key | UI State | Description |
|---------|----------|-------------|
| Calculated sum of `oldScore` | `discretionaryScore.oldScore` | Total original score |
| Calculated sum of `newScore` | `discretionaryScore.newScore` | Total appealed score |
| `discretionary_maxscore_total` | `discretionaryScore.maxScore` | Max possible score |

---

## 6. Form State (User Input)

| State Variable | Type | Description |
|----------------|------|-------------|
| `selectedKras` | `Set<appealId>` | Selected KRAs for review |
| `kraActions` | `Map<appealId, action>` | Action per KRA |
| `kraScores` | `Map<appealId, score>` | New score (if ACCEPT_AND_EDIT) |
| `kraComments` | `Map<appealId, comment>` | Comment per KRA |
| `overallComment` | `string` | Overall review comment |

### Action Values

| Action | Description |
|--------|-------------|
| `ACCEPT_AS_IS` | Accept the appealed score as-is |
| `ACCEPT_AND_EDIT` | Accept with modified score |
| `REJECT` | Reject the appeal (requires comment) |

---

## 7. Submit Payload Mapping

**Function:** `handleSubmit()` → `appraisalAPI.approveAppealReview()`

| UI State | Payload Field | Description |
|----------|---------------|-------------|
| `context.empNo` | `empNo` | Auth user's employee number |
| `context.custTicketId` | `custTicketId` | Ticket ID from URL |
| `context.financialYear` | `financialYear` | Financial year |
| `context.role` | `reviewerRole` | APPRAISER or REVIEWER |
| `overallComment` | `member3comment` | Overall comment |
| Derived from actions | `status` | APPROVED / REJECTED / PARTIALLY_APPROVED |

### KRA Decisions Array

| UI Source | Payload Field |
|-----------|---------------|
| `appealId` | `kraId` |
| `kraActions.get(id)` | `action` |
| `kraScores.get(id)` | `newScore` (if ACCEPT_AND_EDIT) |
| `kraComments.get(id)` | `comment` |
| `kra.appraiseeScore` | `appraisee_score` |
| `kra.mpbNewValue` | `new_mpb` |
| `kra.targetNewValue` | `new_target` |
| `kra.actualNewValue` | `new_actual` |
| `kra.targetOldValue` | `prev_target`, `old_target` |
| `kra.actualOldValue` | `prev_actual`, `old_actual` |
| `kra.kraId` | `AP_KRA_ID` |
| `kra.kraType` | `kraType` |

---

## 8. Context (from URL or location.state)

| Source | UI State | Default |
|--------|----------|---------|
| `?roleId=` / `state.roleId` | `context.roleId` | `'4'` |
| `?roleType=` / `state.roleType` | `context.roleType` | `'Administrative Officer'` |
| `?empNo=` / `state.empNo` | `context.empNo` | `'38965'` |
| `?financialYear=` / `state.financialYear` | `context.financialYear` | `'2025'` |
| `?ticketId=` | `context.custTicketId` | - |
| `?role=` / `state.role` | `context.role` | `'APPRAISER'` |

---

## Quick Reference: Where to Change Things

| Task | Location |
|------|----------|
| Change API data transformation | `data` useMemo block |
| Add new KRA fields | Mapping inside `measurableKras` / `nonMeasurableKras` |
| Modify submit payload | `handleSubmit()` function |
| Add form validation rules | `isValid` useMemo block |
| Change context defaults | `context` useMemo block |
| Add new form state | Add useState + handler |

---

## File Location

- **Hook:** `src/pages/Appeal/AnnualAppeal/ReviewAppeal/useReviewAppeal.js`
- **API Service:** `src/services/api.js` → `appraisalAPI.getAppealCommitteeReviewData()`, `appraisalAPI.approveAppealReview()`
