# Annual Appraisal API → UI Key Mappings

Quick reference for how API response fields map to UI state in `useAnnualAppraisal.js`.

---

## 1. Non-Measurable KRAs

**API Source:** `result_kra_list_discretionary_non_measurable_child`

| API Key | UI State | Description |
|---------|----------|-------------|
| `AP_KRA_ID` | `kraId` (object key) | Unique KRA identifier |
| `KRA_DESC` | Display text | KRA name/title |
| `SCORE` / `ACTUAL` | `nonMeasurableScores[kraId].score` | User-selected score |
| `COMMENT_SELF_1` | `nonMeasurableScores[kraId].comment` | Appraisee's comment |
| `COMMENT_REPA` | `nonMeasurableScores[kraId].appraiserComment` | Appraiser's comment |
| `COMMENT_REVA` | `nonMeasurableScores[kraId].reviewerComment` | Reviewer's comment |
| `REPA_ACTUALS` | `nonMeasurableScores[kraId].appraiserScore` | Appraiser's score |
| `REVA_ACTUALS` | `nonMeasurableScores[kraId].reviewerScore` | Reviewer's score |

**To modify:** `handleNonMeasurableScoreChange()` or `handleNonMeasurableCommentChange()`

---

## 2. Development Inputs / Questions

**API Source:** `result_questions.development_inputs`

| API Key | UI State | Description |
|---------|----------|-------------|
| `ID` | `questionId` (object key) | Unique question identifier |
| `QUESTION` | Display text | Question text |
| `CATEGORY` | Display grouping | Category name |
| `SUB_CATEGORY` | Display grouping | Sub-category |
| `SELF_RESPONSE` | `developmentResponses[id].response` | User's main response |
| `SELF_RESPONSE_2` | `developmentResponses[id].response2` | User's secondary response |
| `REPA_RESPONSE` | Read-only | Appraiser's response |
| `REVA_RESPONSE` | Read-only | Reviewer's response |
| `AC_RESPONSE` | Read-only | AC response |

### Question Categories

| Category | Question IDs | Editable By |
|----------|--------------|-------------|
| `overall_development` | 1-9 | APPRAISEE |
| `reporting_review_authority` | 12-18 | APPRAISER / REVIEWER |
| `integrity` | 19 | APPRAISER / REVIEWER |
| `health_problems` | 10 | APPRAISEE |
| `disciplinary_actions` | 11 | APPRAISEE |

**To modify:** `handleDevelopmentInputChange()` or `developmentInputs` useMemo

---

## 3. Option-Based Responses

**UI State:** `optionResponses`

| API Category | UI Key | Possible Values |
|--------------|--------|-----------------|
| `integrity` | `optionResponses.integrity` | `'option1'` \| `'option2'` \| `'option3'` |
| `health_problems` | `optionResponses.healthProblems` | `'yes'` \| `'no'` |
| `disciplinary_actions` | `optionResponses.disciplinaryActions` | `'yes'` \| `'no'` |

**To modify:** `handleOptionChange()`

---

## 4. Learning Metrics

**API Source:** Root level of API response

| API Key | UI State |
|---------|----------|
| `continuous_learning_present` | `learningMetrics.continuousLearningPresent` |
| `mandatory_courses` | `learningMetrics.mandatoryCourses` |
| `learning_courses` | `learningMetrics.learningCourses` |
| `speed_circular` | `learningMetrics.speedCircular` |
| `elearning_score` | `learningMetrics.elearningScore` |

**To modify:** `useEffect` that sets `learningMetrics`

---

## 5. Submit Payload Mapping

**Function:** `buildAnnualSubmitPayload()`

The submit spreads original API fields and updates with user input:

| UI State | Payload Field |
|----------|---------------|
| `nonMeasurableScores[kraId].score` | `kraData[].SCORE`, `kraData[].ACTUAL` |
| `nonMeasurableScores[kraId].comment` | `kraData[].FIRSTCOMMENT`, `kraData[].COMMENT_SELF_1` |
| `developmentResponses[id].response` | `questions[].SELF_RESPONSE` |
| `developmentResponses[id].response2` | `questions[].SELF_RESPONSE_2` |
| `formData.appraiseeComments` | `performanceMeasurableComment` |
| `formData.appraiserComments` | `performanceNonMeasurableComment` |
| `formData.reviewerComments` | `performanceSemiMeasurableComment` |

---

## Quick Reference: Where to Change Things

| Task | File/Function |
|------|---------------|
| Change how API data is parsed | `transformAnnualAppraisalData()` in `appraisalTransformers.js` |
| Change form field handlers | `handleNonMeasurable*`, `handleDevelopmentInputChange`, `handleOptionChange` |
| Change submit payload structure | `buildAnnualSubmitPayload()` |
| Add new fields from API | `useEffect` that processes `apiResponse` |
| Change validation rules | `validateAnnualForm()` |

---

## File Locations

- **Hook:** `src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualAppraisal.js`
- **Transformer:** `src/pages/Appraisal/AppraisalCheckInForm/appraisalTransformers.js`
- **API Service:** `src/services/api.js` → `appraisalAPI.getEmployeeSelfAppraisal()`
