# Annual Appraisal Review - Implementation Summary

## Files Created

| File | Purpose |
|------|---------|
| `src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualAppraisalReview.js` | Custom hook for appraiser review flow |
| `src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualAppraisalReview.js` | Main component for appraiser UI |
| `src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualAppraisalReview.css` | Appraiser-specific styles |

## Files Modified

| File | Changes |
|------|---------|
| `src/services/api.js` | Added `getReporteeAppraisal` and `submitReporteeAppraisal` methods |
| `src/pages/Appraisal/AppraisalCheckInForm/annual/index.js` | Added exports for new component and hook |
| `src/pages/index.js` | Added `AnnualAppraisalReview` export |
| `src/App.js` | Added route `/appraisal/annual/appraiser-review` and layout component |

## Route

```
/appraisal/annual/appraiser-review
```

**Required `location.state` params:**
- `empNo` - Employee number being reviewed
- `financialYear` - e.g., "FY 2024-25"
- `quarter` - e.g., "Q2"
- `url` - URL ID / Assignment ID
- `zoneName` - Zone name
- `roleType` - Role type

---

## POST Endpoint Changes Required

### File: `src/services/api.js`

### Location: Lines ~590-615 (inside `appraisalAPI` object)

### Current Code (Mocked):
```javascript
// POST: Submit reportee appraisal (appraiser/reviewer submission) - MOCKED
submitReporteeAppraisal: async (payload = {}) => {
  try {
    // TODO: Replace with actual API endpoint when available
    // const response = await apiClient.post(
    //   `${appraisalBaseUrl}/reportee_appraisal/submit`,
    //   payload
    // );
    // return response.data;

    // Mocked response for development
    console.log('[submitReporteeAppraisal] Mocked submission with payload:', payload);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Appraisal submitted successfully',
        });
      }, 1000);
    });
  } catch (error) {
    console.error('submitReporteeAppraisal error:', error);
    throw error;
  }
},
```

### Replace With (Real API):
```javascript
// POST: Submit reportee appraisal (appraiser/reviewer submission)
submitReporteeAppraisal: async (payload = {}) => {
  try {
    const response = await apiClient.post(
      `${appraisalBaseUrl}/reportee_appraisal/submit`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('submitReporteeAppraisal error:', error);
    throw error;
  }
},
```

### Expected API Endpoint
```
POST /appraisal/reportee_appraisal/submit
```

### Payload Structure
```json
{
  "id": "URL_ID",
  "empNo": "36663",
  "ecNumber": "36663",
  "financialYear": 2024,
  "continuousLearningPresent": false,
  "mandatoryCourses": 0,
  "learningCourses": 0,
  "speedCircular": 0,
  "elearningScore": 0,
  "kraData": [
    {
      "AP_KRA_ID": 123,
      "KRA_DESC": "...",
      "REPA_ACTUALS": 4,
      "COMMENT_REPA": "Appraiser comment"
    }
  ],
  "functions": ["Function1", "Function2"],
  "feedbackInput": [],
  "questions": [
    {
      "QUESTION_ID": 12,
      "REPA_RESPONSE": "Appraiser response text"
    }
  ],
  "warningFlag": false,
  "warningComment": "",
  "varianceFlag": false
}
```

---

## Quick Reference

To navigate to the dashboard and test:
1. Login as an appraiser
2. Navigate to reportee list
3. Click on a reportee's annual appraisal
4. Pass required state to `/appraisal/annual/appraiser-review`
