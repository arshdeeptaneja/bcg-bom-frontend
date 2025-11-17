# Quartely Appraisal Flow

-> Appraisee-dashboard => `/appraisal/my_appraisal_dashboard` (send quarter) — <span style="color:#1f9d55;">✔ Integrated</span>

# Quarterly Appraisal Flow

## Main Entry Point

**Route:** `/appraisal/home`  
**Component:** `AppraisalHome` (`src/pages/Appraisal/AppraisalHome.js`)  
**Description:** Main dashboard hub with FY selector, period selector (Annual/Quarterly), quarter selector, and KPI tabs for accessing both Appraisee and Appraiser check-ins.

---

## Quick Route Access & Mock Payloads

These snippets let you jump straight into the critical appraisal screens without waiting for upstream navigation, and also describe the minimum mock data required to exercise the APIs.

### Appraisee Quarterly Check-In Form (Self Entry)

**Direct Route:** Hit `http://localhost:3000/quarterly/quaterly-appraisee-check-in` or use `navigate('/quarterly/quaterly-appraisee-check-in', { state })`.

**Required `location.state`:**

```json
{
   "financialYear": "FY 2024-25",
   "appraisalPeriod": "Quarterly",
   "quarter": "Q1",
   "dateRange": "01 Apr 2024 - 30 Jun 2024",
   "employee": {
      "empNo": "36663",
      "employeeName": "Demo User",
      "branch": "Mumbai Main",
      "primaryRole": "Branch Manager",
      "appraiser": "EMP9000"
   },
   "urlId": "URL-36663",
   "roleType": "emp",
   "pageType": "elo",
   "intent": "Fill",
   "appraisalStatus": "IN_PROGRESS"
}
```

**Mock API calls:**

```bash
# Load the quarterly form (uses numeric FY year)
curl 'http://localhost:8084/appraisal/quarterly_check_in_report?empNo=36663&url=URL-36663&roleType=emp&financialYear=2024&quarter=Q1&pageType=elo&appraisalStatus=IN_PROGRESS&intent=Fill&roleId=BRANCH_MANAGER'

# Save or submit with lightweight payloads
curl --request POST 'http://localhost:8084/appraisal/quarterly_check_in_report/save' \
   --header 'Content-Type: application/json' \
   --data '{
      "empNo": "36663",
      "financialYear": "2024",
      "quarter": "Q1",
      "roleType": "emp",
      "pageType": "elo",
      "intent": "Fill",
      "roleId": "BRANCH_MANAGER",
      "measurableKraScores": { "kra-1": 4.25 },
      "nonMeasurableKraComments": { "kra-2": "Improved CSAT" },
      "developmentInputAnswers": { "question-1": "Needs Finacle refresher" },
      "appraiseeComments": "Submitting mock quarterly inputs"
   }'
```

### Appraiser Quarterly Check-In Form (Reviewer of reportee data)

**Direct Route:** `http://localhost:3000/appraisal/check-in-form` with the state below. Toggle `intent` to switch between `Review` (appraiser) and `Fill` (appraisee) modes.

**Required `location.state`:**

```json
{
   "employee": {
      "empNo": "36663",
      "employeeName": "Demo User",
      "branch": "Mumbai Main",
      "primaryRole": "Branch Manager",
      "appraiser": "EMP9000"
   },
   "financialYear": "FY 2024-25",
   "quarter": "Q1",
   "appraisalPeriod": "Quarterly",
   "dateRange": "01 Apr 2024 - 30 Jun 2024",
   "urlId": "URL-36663",
   "roleType": "appraiser",
   "pageType": "elo",
   "intent": "Review",
   "appraisalStatus": "Pending at Appraiser"
}
```

**Mock API calls:**

```bash
# Load reportee data as an appraiser
curl 'http://localhost:8084/appraisal/quarterly_check_in_report?empNo=36663&url=URL-36663&roleType=appraiser&financialYear=2024&quarter=Q1&pageType=elo&appraisalStatus=Pending%20at%20Appraiser&intent=Review&roleId=BRANCH_MANAGER'

# Submit appraiser remarks (same body works for /save or /submit endpoints)
curl --request POST 'http://localhost:8084/appraisal/quarterly_check_in_report/submit' \
   --header 'Content-Type: application/json' \
   --data '{
      "empNo": "36663",
      "financialYear": "2024",
      "quarter": "Q1",
      "roleType": "appraiser",
      "pageType": "elo",
      "intent": "Review",
      "roleId": "BRANCH_MANAGER",
      "measurableKraScores": { "kra-1": 4.5 },
      "nonMeasurableKraComments": { "kra-2": "Strong leadership" },
      "developmentInputAnswers": { "question-1": "Leadership workshop" },
      "appraiserComments": "Cleared after reviewer inputs"
   }'
```

### Quarterly Exception Form

**Direct Route:** Continue to use `navigate('/appraisal/exception-quarterly', { state })`. The component expects the same state object used when raising from dashboards.

**Required `location.state`:** (same fields as the snippet already included further below)

```json
{
   "financialYear": "FY 2024-25",
   "appraisalPeriod": "Quarterly",
   "quarter": "Q1",
   "dateRange": "01 Apr 2024 - 30 Jun 2024",
   "employee": {
      "empNo": "36663",
      "employeeName": "Demo User",
      "branch": "Mumbai Main",
      "primaryRole": "Branch Manager",
      "appraiser": {
         "empNo": "EMP9000",
         "name": "Jane Smith"
      }
   },
   "role": "APPRAISEE"
}
```

**Mock API calls:**

```bash
# Fetch the exception template
curl 'http://localhost:8084/appraisal/quarterly_exception_report?urlId=URL-36663&financialYear=2024&quarter=Q1'

# Submit an exception with an attachment placeholder
curl --request POST 'http://localhost:8084/appraisal/quarterly_exception_report/submit_exception' \
   -F 'payload={
            "kraData": [{"month": "April", "kra": "CASA", "unit": "%", "actual": 80, "target": 75, "maxScore": 5, "score": 4.5, "category": "Measurable", "comment": "Incorrect target"}],
            "financialYear": 2024,
            "empNo": "36663",
            "startDate": "2024-04-01",
            "endDate": "2024-06-30",
            "quarter": "Q1",
            "declarationOption": "AGREED",
            "reportingAuthorityNo": "EMP9000",
            "id": "EXC-1"
         }' \
   -F 'attachment=@/tmp/mock-proof.pdf'
```

### Reviewer Dashboard & Reviewer Mode

**Direct URLs:**

- Dashboard list: `http://localhost:3000/appraiser/reviewer-dashboard?financialYear=FY%202024-25&appraisalPeriod=Annual&quarter=` (optional query parameters are `financialYear`, `appraisalPeriod`, `quarter`).
- Reviewer form: `http://localhost:3000/appraiser/reviewer-mode` with the state below.

**Required `location.state` for Reviewer Mode:**

```json
{
   "financialYear": "FY 2024-25",
   "appraisalPeriod": "Annual",
   "quarter": "",
   "dateRange": "01 Apr 2024 - 31 Mar 2025",
   "role": "REVIEWER",
   "roleName": "REVIEWER",
   "roleId": "REVIEWER",
   "employee": {
      "empNo": "36663",
      "employeeName": "Demo User",
      "branch": "Mumbai Main",
      "primaryRole": "Branch Manager",
      "appraiser": "EMP9000",
      "reviewer": "EMP7000"
   },
   "urlId": "URL-36663",
   "appraisalStatus": "Pending at Reviewer"
}
```

**Mock API calls:**

```bash
# Load reviewer payload
curl 'http://localhost:8084/appraisal/acceptor_appraisal?empNo=36663&urlId=URL-36663&roleName=REVIEWER&roleId=REVIEWER&zoneName=West%20Zone&financialYear=2024&appraisalPeriod=annual&quarter=&appraisalStatus=Pending%20at%20Reviewer'

# Submit reviewer decision
curl --request POST 'http://localhost:8084/appraisal/acceptor_appraisal/submit' \
   --header 'Content-Type: application/json' \
   --data '{
      "urlId": "URL-36663",
      "empNo": "36663",
      "financialYear": "2024",
      "appraisalPeriod": "Annual",
      "quarter": "",
      "decision": "APPROVE",
      "remarks": "All KRAs validated",
      "kraData": [
         { "id": "KRA-1", "reviewerComment": "Solid CASA growth", "reviewerScore": 4.6 },
         { "id": "KRA-2", "reviewerComment": "Need better NPA control", "reviewerScore": 3.9 }
      ]
   }'
```


---

## Mock API Response Payloads for Chrome DevTools

Use these JSON responses in Chrome DevTools Network tab → Override content, or with tools like Mock Service Worker (MSW), Requestly, or Moesif.

### 1. Appraisee Dashboard Response

**GET** `/appraisal/my_appraisal_dashboard`

```json
{
  "success": true,
  "result": [
    {
      "EMP_ID": "36663",
      "EMP_NAME": "Demo User",
      "SCALE": "Senior Associate",
      "MAIN_ROLE": "Branch Manager",
      "APPRAISAL_STATUS": "IN_PROGRESS",
      "START_DATE": "2024-04-01",
      "END_DATE": "2024-06-30",
      "REPORTING_AUTHORITY_NAME": "Jane Smith",
      "ORGANIZATION": "BCG Bank",
      "URL_ID": "URL-36663",
      "ROLE_ID": "BRANCH_MANAGER",
      "ZONE_NAME": "West Zone",
      "QUARTER": "Q1",
      "FINANCIAL_YEAR": "2024",
      "AVERAGE_SCORE": 87.5
    },
    {
      "EMP_ID": "36663",
      "EMP_NAME": "Demo User",
      "SCALE": "Senior Associate",
      "MAIN_ROLE": "Branch Manager",
      "APPRAISAL_STATUS": "COMPLETED",
      "START_DATE": "2024-07-01",
      "END_DATE": "2024-09-30",
      "REPORTING_AUTHORITY_NAME": "Jane Smith",
      "ORGANIZATION": "BCG Bank",
      "URL_ID": "URL-36663-Q2",
      "ROLE_ID": "BRANCH_MANAGER",
      "ZONE_NAME": "West Zone",
      "QUARTER": "Q2",
      "FINANCIAL_YEAR": "2024",
      "AVERAGE_SCORE": 92.3
    }
  ]
}
```

---

### 2. Appraiser Dashboard Response

**GET** `/appraisal/quarterly_reportee_appraisal/dashboard`

```json
{
  "success": true,
  "result": [
    {
      "EMP_ID": "36664",
      "EMP_NAME": "Alice Johnson",
      "SCALE": "Associate",
      "MAIN_ROLE": "Relationship Manager",
      "APPRAISAL_STATUS": "Pending at Appraiser",
      "START_DATE": "2024-04-01",
      "END_DATE": "2024-06-30",
      "URL_ID": "URL-36664",
      "ROLE_ID": "RELATIONSHIP_MANAGER",
      "ZONE_NAME": "West Zone",
      "BRANCH_NAME": "Mumbai Main",
      "REPORTING_AUTHORITY_NO": "EMP9000"
    },
    {
      "EMP_ID": "36665",
      "EMP_NAME": "Bob Williams",
      "SCALE": "Senior Associate",
      "MAIN_ROLE": "Operations Manager",
      "APPRAISAL_STATUS": "COMPLETED",
      "START_DATE": "2024-04-01",
      "END_DATE": "2024-06-30",
      "URL_ID": "URL-36665",
      "ROLE_ID": "OPERATIONS_MANAGER",
      "ZONE_NAME": "West Zone",
      "BRANCH_NAME": "Mumbai Main",
      "REPORTING_AUTHORITY_NO": "EMP9000"
    }
  ],
  "appraisal_score_dash": {
    "total_reviewed": 12,
    "pending_review": 5,
    "average_team_score": 78.3
  },
  "score_summary": {
    "excellent": 3,
    "good": 8,
    "average": 4,
    "below_average": 2
  },
  "filters": {
    "EMP_NAME": ["Alice Johnson", "Bob Williams", "Charlie Brown"],
    "PRIMARY_ROLE": ["Relationship Manager", "Operations Manager", "Branch Manager"],
    "BRANCH_NAME": ["Mumbai Main", "Delhi North", "Bangalore East"],
    "STATUS": ["Pending at Appraiser", "COMPLETED", "IN_PROGRESS"]
  }
}
```

---

### 3. Quarterly Check-In Form Response (Appraisee & Appraiser)

**GET** `/appraisal/quarterly_check_in_report`

```json
{
  "success": true,
  "data": {
    "employeeDetails": {
      "empNo": "36663",
      "empName": "Demo User",
      "designation": "Branch Manager",
      "department": "Retail Banking",
      "reportingAuthority": "Jane Smith",
      "branch": "Mumbai Main",
      "zone": "West Zone"
    },
    "measurableKRA": [
      {
        "kra_id": "KRA-001",
        "kra": "CASA Growth",
        "unit": "%",
        "category": "Business",
        "target": 15,
        "actual": 14.2,
        "score": 4.73,
        "maxScore": 5,
        "month": "April",
        "appraiseeComment": "Achieved near target despite market challenges",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "KRA-002",
        "kra": "NPA Recovery",
        "unit": "INR Lakhs",
        "category": "Business",
        "target": 50,
        "actual": 52,
        "score": 5.0,
        "maxScore": 5,
        "month": "April",
        "appraiseeComment": "Exceeded target through proactive follow-ups",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "KRA-003",
        "kra": "CASA Growth",
        "unit": "%",
        "category": "Business",
        "target": 15,
        "actual": 15.8,
        "score": 5.0,
        "maxScore": 5,
        "month": "May",
        "appraiseeComment": "Strong performance with new customer acquisition",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "KRA-004",
        "kra": "NPA Recovery",
        "unit": "INR Lakhs",
        "category": "Business",
        "target": 50,
        "actual": 48,
        "score": 4.8,
        "maxScore": 5,
        "month": "May",
        "appraiseeComment": "Slightly below target due to legal delays",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "KRA-005",
        "kra": "CASA Growth",
        "unit": "%",
        "category": "Business",
        "target": 15,
        "actual": 16.5,
        "score": 5.0,
        "maxScore": 5,
        "month": "June",
        "appraiseeComment": "Best month with campaign success",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "KRA-006",
        "kra": "NPA Recovery",
        "unit": "INR Lakhs",
        "category": "Business",
        "target": 50,
        "actual": 55,
        "score": 5.0,
        "maxScore": 5,
        "month": "June",
        "appraiseeComment": "Strong quarter-end push",
        "appraiserComment": "",
        "reviewerComment": ""
      }
    ],
    "nonMeasurableKRA": [
      {
        "kra_id": "NM-KRA-001",
        "kra": "Team Leadership",
        "category": "Behavioral",
        "selfScore": 4,
        "maxScore": 5,
        "appraiseeComment": "Led team effectively during peak season",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "NM-KRA-002",
        "kra": "Customer Service Excellence",
        "category": "Behavioral",
        "selfScore": 5,
        "maxScore": 5,
        "appraiseeComment": "Zero customer complaints this quarter",
        "appraiserComment": "",
        "reviewerComment": ""
      },
      {
        "kra_id": "NM-KRA-003",
        "kra": "Process Compliance",
        "category": "Behavioral",
        "selfScore": 4,
        "maxScore": 5,
        "appraiseeComment": "100% adherence to audit requirements",
        "appraiserComment": "",
        "reviewerComment": ""
      }
    ],
    "monthlyScores": {
      "April": { "total": 9.73, "max": 10, "percentage": 97.3 },
      "May": { "total": 9.8, "max": 10, "percentage": 98.0 },
      "June": { "total": 10.0, "max": 10, "percentage": 100.0 }
    },
    "developmentInputs": [
      {
        "question_id": "DEV-Q1",
        "question": "What were your key achievements this quarter?",
        "answer": "Successfully launched digital banking campaign, acquired 150+ new CASA accounts"
      },
      {
        "question_id": "DEV-Q2",
        "question": "What areas do you want to improve?",
        "answer": "Want to enhance skills in wealth management products"
      }
    ],
    "overallComments": {
      "appraiseeComment": "Productive quarter with strong business performance",
      "appraiserComment": "",
      "reviewerComment": ""
    },
    "averageActual": 98.43,
    "averageMax": 100,
    "quarterlyScore": 29.53,
    "maxQuarterlyScore": 30
  }
}
```

---

### 4. Annual Self-Appraisal Response

**GET** `/appraisal/employee_self_appraisal`

```json
{
  "success": true,
  "data": {
    "employeeDetails": {
      "empNo": "36663",
      "empName": "Demo User",
      "designation": "Branch Manager",
      "department": "Retail Banking",
      "branch": "Mumbai Main",
      "zone": "West Zone",
      "reportingAuthority": "Jane Smith"
    },
    "annual_score_summary": [
      {
        "CATEGORY": "Business Performance",
        "SELF_SCORE": 85,
        "MAX_SCORE": 100,
        "APPRAISER_SCORE": 0,
        "REVIEWER_SCORE": 0
      },
      {
        "CATEGORY": "Behavioral Competencies",
        "SELF_SCORE": 42,
        "MAX_SCORE": 50,
        "APPRAISER_SCORE": 0,
        "REVIEWER_SCORE": 0
      },
      {
        "CATEGORY": "Leadership & Initiative",
        "SELF_SCORE": 38,
        "MAX_SCORE": 50,
        "APPRAISER_SCORE": 0,
        "REVIEWER_SCORE": 0
      }
    ],
    "unit_converter": {
      "percentage": "%",
      "count": "No.",
      "currency": "INR",
      "lakhs": "INR Lakhs"
    },
    "validation_text": "Please ensure all mandatory fields are completed before submission",
    "quarterly_summary": {
      "Q1": { "score": 29.53, "maxScore": 30, "status": "Completed", "percentage": 98.43 },
      "Q2": { "score": 28.5, "maxScore": 30, "status": "Completed", "percentage": 95.0 },
      "Q3": { "score": 27.9, "maxScore": 30, "status": "Completed", "percentage": 93.0 },
      "Q4": { "score": 29.1, "maxScore": 30, "status": "Completed", "percentage": 97.0 }
    },
    "overall_annual_score": 115.03,
    "max_annual_score": 120,
    "annual_percentage": 95.86
  }
}
```

---

### 5. Reviewer/Acceptor Appraisal Response

**GET** `/appraisal/acceptor_appraisal`

```json
{
  "success": true,
  "data": {
    "employeeDetails": {
      "empNo": "36663",
      "empName": "Demo User",
      "designation": "Branch Manager",
      "department": "Retail Banking",
      "branch": "Mumbai Main",
      "zone": "West Zone",
      "appraiser": "Jane Smith",
      "reviewer": "EMP7000"
    },
    "kraData": [
      {
        "kra_id": "KRA-001",
        "kra": "CASA Growth",
        "unit": "%",
        "category": "Business",
        "target": 15,
        "actual": 15.5,
        "selfScore": 4.9,
        "appraiserScore": 4.8,
        "reviewerScore": 0,
        "maxScore": 5,
        "appraiseeComment": "Strong quarter with consistent growth",
        "appraiserComment": "Good performance, slight adjustment for market conditions",
        "reviewerComment": ""
      },
      {
        "kra_id": "KRA-002",
        "kra": "NPA Recovery",
        "unit": "INR Lakhs",
        "category": "Business",
        "target": 50,
        "actual": 51.5,
        "selfScore": 5.0,
        "appraiserScore": 5.0,
        "reviewerScore": 0,
        "maxScore": 5,
        "appraiseeComment": "Exceeded targets consistently",
        "appraiserComment": "Excellent recovery performance",
        "reviewerComment": ""
      },
      {
        "kra_id": "NM-KRA-001",
        "kra": "Team Leadership",
        "category": "Behavioral",
        "selfScore": 4,
        "appraiserScore": 4,
        "reviewerScore": 0,
        "maxScore": 5,
        "appraiseeComment": "Led team through challenging times",
        "appraiserComment": "Demonstrated strong leadership qualities",
        "reviewerComment": ""
      }
    ],
    "overallScores": {
      "selfScore": 94.5,
      "appraiserScore": 93.8,
      "reviewerScore": 0,
      "maxScore": 100
    },
    "appraiserRecommendation": "APPROVE",
    "appraiserRemarks": "Strong overall performance. Recommend for merit increase."
  }
}
```

---

### 6. Quarterly Exception Report Response

**GET** `/appraisal/quarterly_exception_report`

```json
{
  "success": true,
  "data": {
    "employeeDetails": {
      "empNo": "36663",
      "empName": "Demo User",
      "branch": "Mumbai Main",
      "primaryRole": "Branch Manager"
    },
    "kraData": [
      {
        "kra_id": "KRA-001",
        "kra": "CASA Growth",
        "unit": "%",
        "target": 15,
        "actual": 14.2,
        "score": 4.73,
        "maxScore": 5,
        "month": "April",
        "category": "Measurable",
        "comment": ""
      },
      {
        "kra_id": "KRA-002",
        "kra": "NPA Recovery",
        "unit": "INR Lakhs",
        "target": 50,
        "actual": 52,
        "score": 5.0,
        "maxScore": 5,
        "month": "April",
        "category": "Measurable",
        "comment": ""
      },
      {
        "kra_id": "KRA-003",
        "kra": "CASA Growth",
        "unit": "%",
        "target": 15,
        "actual": 15.8,
        "score": 5.0,
        "maxScore": 5,
        "month": "May",
        "category": "Measurable",
        "comment": ""
      }
    ],
    "monthlyScores": {
      "April": 9.73,
      "May": 9.8,
      "June": 10.0
    },
    "measurableKRA": 6,
    "nonMeasurableKRA": 3,
    "averageActual": 98.43,
    "averageMax": 100,
    "totalScore": 29.53,
    "maxScore": 30
  }
}
```

---

### 7. Exception List Response

**GET** `/appraisal/exception_quarterly_verify`

```json
{
  "success": true,
  "result": [
    {
      "exception_id": "EXC-001",
      "cust_ticket_id": "TKT-2024-Q1-001",
      "employee_no": "36664",
      "employee_name": "Alice Johnson",
      "branch_name": "Mumbai Main",
      "primary_role": "Relationship Manager",
      "exception_status": "Pending",
      "created_date": "2024-05-15",
      "exception_type": "Score Correction",
      "url_id": "URL-EXC-001",
      "zone": "West Zone",
      "role_id": "RELATIONSHIP_MANAGER"
    },
    {
      "exception_id": "EXC-002",
      "cust_ticket_id": "TKT-2024-Q1-002",
      "employee_no": "36665",
      "employee_name": "Bob Williams",
      "branch_name": "Delhi North",
      "primary_role": "Operations Manager",
      "exception_status": "Under Review",
      "created_date": "2024-05-18",
      "exception_type": "KRA Modification",
      "url_id": "URL-EXC-002",
      "zone": "North Zone",
      "role_id": "OPERATIONS_MANAGER"
    }
  ],
  "filters": {
    "EMP_NAME": ["Alice Johnson", "Bob Williams", "Charlie Brown"],
    "PRIMARY_ROLE": ["Relationship Manager", "Operations Manager", "Branch Manager"],
    "BRANCH_NAME": ["Mumbai Main", "Delhi North", "Bangalore East"],
    "TICKET_STATUS": ["Pending", "Under Review", "Approved", "Rejected"]
  },
  "total_count": 2,
  "pending_count": 1
}
```

---

### 8. Exception Appraiser Review Response

**GET** `/appraisal/exception_quarterly_verify/review`

```json
{
  "success": true,
  "data": {
    "employeeDetails": {
      "empNo": "36664",
      "empName": "Alice Johnson",
      "designation": "Relationship Manager",
      "branch": "Mumbai Main",
      "ticketId": "TKT-2024-Q1-001"
    },
    "kraData": [
      {
        "kra_id": "KRA-001",
        "kra": "Customer Acquisition",
        "unit": "Count",
        "category": "Business",
        "target": 25,
        "actual": 20,
        "score": 4.0,
        "maxScore": 5,
        "month": "April",
        "appraiseeComment": "System recorded incorrect count due to technical glitch",
        "appraiserComment": ""
      },
      {
        "kra_id": "KRA-002",
        "kra": "Revenue Generation",
        "unit": "INR Lakhs",
        "category": "Business",
        "target": 10,
        "actual": 9,
        "score": 4.5,
        "maxScore": 5,
        "month": "May",
        "appraiseeComment": "One transaction not credited due to backend delay",
        "appraiserComment": ""
      }
    ],
    "attachmentUrl": "https://storage.example.com/attachments/exc_001_proof.pdf",
    "exceptionReason": "Score recalculation due to system error in data capture",
    "requestedAdjustment": {
      "original_score": 8.5,
      "requested_score": 9.2
    },
    "declarationStatus": "AGREED",
    "submittedDate": "2024-05-15"
  }
}
```

---

### 9. Exception Validator Review Response

**GET** `/appraisal/exception_quarterly_validator/review`

```json
{
  "success": true,
  "data": {
    "employeeDetails": {
      "empNo": "36664",
      "empName": "Alice Johnson",
      "designation": "Relationship Manager",
      "branch": "Mumbai Main",
      "ticketId": "TKT-2024-Q1-001"
    },
    "kraData": [
      {
        "kra_id": "KRA-001",
        "kra": "Customer Acquisition",
        "unit": "Count",
        "category": "Business",
        "target": 25,
        "actual": 20,
        "score": 4.0,
        "maxScore": 5,
        "month": "April",
        "appraiseeComment": "System recorded incorrect count",
        "appraiserComment": "Verified system logs, recommend adjustment to 23",
        "validatorActual": 0,
        "validatorTarget": 0,
        "validatorScore": 0,
        "validatorComment": ""
      }
    ],
    "attachmentUrl": "https://storage.example.com/attachments/exc_001_proof.pdf",
    "appraiserRecommendation": "Approve",
    "validationStatus": "Pending Validation",
    "appraiserRemarks": "System error confirmed. Supporting documents are valid."
  }
}
```

---

### 10. Appraisal Home Dashboard Response

**GET** `/appraisal/home/dashboard`

```json
{
  "success": true,
  "data": {
    "self_count_quarterly": 3,
    "pending_appraisal_count": 2,
    "reviewer_pending_appraisals": 5,
    "reviewer_completed_appraisals": 12,
    "appraisal_score_dash": {
      "total_score": 85.5,
      "max_score": 100,
      "grade": "A",
      "rank_in_team": 3
    },
    "quarterly_status": {
      "Q1": "Completed",
      "Q2": "In Progress",
      "Q3": "Not Started",
      "Q4": "Not Started"
    }
  }
}
```

---

### 11. Exception Dashboard Response

**GET** `/appraisal/exception_verify/dashboard`

```json
{
  "success": true,
  "data": {
    "TOTAL_COUNT": 15,
    "PENDING_COUNT": 8,
    "APPROVED_COUNT": 5,
    "REJECTED_COUNT": 2
  }
}
```

---

### 12. Exception Validator Dashboard Response

**GET** `/appraisal/exception_validator/dashboard`

```json
{
  "success": true,
  "data": {
    "TOTAL_COUNT": 20,
    "PENDING_COUNT": 12,
    "VALIDATED_COUNT": 6,
    "REJECTED_COUNT": 2
  }
}
```

---

### How to Use These Mock Responses

1. **Chrome DevTools Override:**
   - Open DevTools (F12) → Network tab
   - Make the actual API request
   - Right-click on request → "Override content"
   - Paste the JSON response

2. **Local Overrides:**
   - DevTools → Sources → Overrides
   - Select a folder for overrides
   - Create file structure matching API path
   - Save JSON response in corresponding file

3. **Mock Service Worker (MSW):**
   ```javascript
   import { http, HttpResponse } from 'msw'

   export const handlers = [
     http.get('http://localhost:8084/appraisal/my_appraisal_dashboard', () => {
       return HttpResponse.json({ /* paste response here */ })
     })
   ]
   ```

4. **Requestly Chrome Extension:**
   - Install extension
   - Create "Modify Response" rule
   - Match URL pattern
   - Paste static JSON response

---

## Quarterly Appraisal Flow

### Appraisee Dashboard

**Route:** `/quarterly/quarterly-appraisee`
**Component:** `QuarterlyAppraisee` (`src/pages/Appraisee/QuarterlyAppraisee.js`)
**API Endpoint:** GET `/appraisal/my_appraisal_dashboard` (send quarter, fy, empNo) — <span style="color:#1f9d55;">✔ Integrated</span>
**Description:** Shows list of quarterly appraisals for the employee with average scores and employee cards.

### Appraiser Dashboard

**Route:** `/appraisal/appraiser-check-in`  
**Component:** `AppraiserCheckInDashboard` (`src/pages/Appraiser/AppraiserDashboardCheckIn/AppraiserCheckInDashboard.js`)  
**API Endpoint:** GET `/appraisal/quarterly_reportee_appraisal/dashboard` (with quarter, fy, empNo, role) — <span style="color:#1f9d55;">✔ Integrated</span>  
**Description:** Shows list of reportees with filters for employee number, name, primary role, appraiser, and status.

---

### 1. Appraisee Check-In Dashboard

**Route:** `/quarterly/quarterly-appraisee`  
**Component:** `QuarterlyAppraisee`  

   1. **Add Check-In Summary or Add Exception**
      - Option to file check-in summary OR raise an exception

   2. **Add Check-In Summary (Form)**  
      **Route:** `/quarterly/quaterly-appraisee-check-in`  
      **Component:** `QuaterlyAppraiseeCheckIn` (`src/pages/Appraisee/QuaterlyAppraiseeCheckIn.js`)  
      **API Endpoints:**
      - GET `/appraisal/quarterly_check_in_report` — <span style="color:#1f9d55;">✔ Integrated</span>
      - POST `/appraisal/quarterly_check_in_report/save` (draft) — <span style="color:#1f9d55;">✔ Integrated</span>
      - POST `/appraisal/quarterly_check_in_report/submit` (final) — <span style="color:#1f9d55;">✔ Integrated</span>

      **Description:** Form with monthly tabs (April, May, June), measurable/non-measurable KRAs, and development inputs (2 questions).

---

### 2. Appraiser Check-In

**Route:** `/appraisal/appraiser-check-in`  
**Component:** `AppraiserCheckInDashboard`  

   1. **Show List of Reportees** (integrated)  
      **API Endpoint:** GET `/appraisal/quarterly_reportee_appraisal/dashboard`

   2. **Add Check-In Summary**  
      **Route:** `/appraisal/check-in-form`  
      **Component:** `AppraisalCheckInForm` (`src/pages/Appraisal/AppraisalCheckInForm.js`)  
      **API Endpoints:**
      - GET `/appraisal/quarterly_check_in_report` (pageType and intent change) — <span style="color:#1f9d55;">✔ Integrated</span>
      - POST `/appraisal/quarterly_check_in_report/save` — <span style="color:#1f9d55;">✔ Integrated</span>
      - POST `/appraisal/quarterly_check_in_report/submit` — <span style="color:#1f9d55;">✔ Integrated</span>

      **Description:** Renders appraisee comments and appraiser must answer the questions accordingly.

---

### 3. Quarterly Exception

**Route:** `/appraisal/exception-quarterly`
**Component:** `QuarterlyException` (`src/pages/Appraisal/ExceptionQuarterly/QuarterlyException.js`)
**Trigger:** Filed for an exception from Appraisee Check-In Dashboard

**Exception Form:**

- **API Endpoints:**
   - GET `/appraisal/quarterly_exception_report` — <span style="color:#1f9d55;">✔ Integrated</span>
   - POST `/appraisal/quarterly_exception_report/submit_exception` — <span style="color:#1f9d55;">✔ Integrated</span>

**Description:** Form with list of measurable and non-measurable KRAs to correct, file upload capability, and declaration section.

**Navigation to Form:**

```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate with required state
navigate('/appraisal/exception-quarterly', {
  state: {
    financialYear: '2025',           // Or 'FY 2024-25' format
    appraisalPeriod: 'Quarterly',
    quarter: 'Q1',                   // Q1, Q2, Q3, Q4
    dateRange: '01 Apr 2025 - 30 Jun 2025',
    employee: {
      empNo: 'EMP123',
      employeeName: 'John Doe',
      branch: 'Main Branch',
      primaryRole: 'Manager',
      appraiser: 'Jane Smith',       // Or { empNo: 'EMP456', name: 'Jane Smith' }
      roles: ['APPRAISEE']
    },
    role: 'APPRAISEE'
  }
});
```

**Required State Properties:**

- `financialYear` (string) - Financial year, e.g., "2025" or "FY 2024-25"
- `appraisalPeriod` (string) - "Quarterly" or "Annual"
- `quarter` (string) - "Q1", "Q2", "Q3", or "Q4"
- `dateRange` (string) - Date range for the quarter, e.g., "01 Apr 2025 - 30 Jun 2025"
- `employee` (object) - Employee details with empNo, employeeName, branch, primaryRole, appraiser
- `role` (string) - Current user role ("APPRAISEE", "APPRAISER", "REVIEWER")

---

### 4. Exception Resolution - Review Exception

**Route:** `/appraisal/exception-resolution`  
**Component:** `ExceptionHome` (`src/pages/Appraisal/ExceptionHome.js`)  
**API Endpoint:** GET `/appraisal/exception_verify/dashboard` (with fy, quarter, empNo, role) — <span style="color:#1f9d55;">✔ Integrated</span>  
**Description:** Dashboard showing total exceptions and pending exceptions with KPI cards.

   1. **Exceptions List**  
      **Route:** `/appraisal/exceptions-list`  
      **Component:** `ExceptionsList` (`src/pages/Appraisal/ExceptionsList.js`)  
      **Description:** Shows filterable list of exceptions to review.

   2. **Review Exception Form**  
      **Route:** `/appraisal/review-quarterly-exception`  
      **Component:** `ReviewQuarterlyException` (`src/pages/Appraisal/ReviewQuarterlyException.js`)  
      **API Endpoints:**
      - GET `/appraisal/exception_quarterly_verify/review` — <span style="color:#1f9d55;">✔ Integrated</span>
      - POST `/appraisal/exception_quarterly_verify/submit` — <span style="color:#1f9d55;">✔ Integrated</span>

      **Description:** Form with radio buttons to accept as-is or modify exception (2 other options), includes file download capability.

---

### 5. Exception Validation - Review Exception

**Route:** `/appraisal/exception-verify`  
**Component:** `ExceptionVerify` (`src/pages/Appraisal/ExceptionVerify.js`)  
**API Endpoint:** GET `/appraisal/exception_validator/dashboard` (with fy, quarter, empNo, role) — <span style="color:#1f9d55;">✔ Integrated</span>  
**Description:** Validator dashboard showing exceptions requiring final validation.

   1. **Employee Exception List**  
      **Route:** `/appraisal/review-exception-list`  
      **Component:** `EmployeeExceptionList` (`src/pages/Appraisal/EmployeeExceptionList/EmployeeExceptionList.js`)  
      **Description:** Filterable validator list (FY, quarter, status). "Review Exception" now routes with populated `location.state` to the validator form.

   2. **Validator Review Form**  
      **Route:** `/appraisal/employee-review-quarterly-exception`  
      **Component:** `EmployeeQuarterlyException` (`src/pages/Appraisal/QuarterlyException/EmployeeQuarterlyException.js`)  
      **API Endpoints:**
      - GET `/appraisal/exception_quarterly_validator/review` — <span style="color:#1f9d55;">✔ Integrated</span>
      - POST `/appraisal/exception_quarterly_validator/submit` — <span style="color:#1f9d55;">✔ Integrated</span>

      **Description:** Final validation stage with measurable KRA grid, attachment download, validator-specific edits/comments, declaration radio group, and submit.

---

### 6. Final Stage

**Description:** View Exception and Appraisal Status Completed.  
Status visible on dashboard pages (AppraisalHome, ExceptionHome).

---

## Annual Appraisal Flow

### Appraisee Dashboard

**Route:** `/annual/appraisee/appraisee-dashboard`  
**Component:** `AppraiseeCheckIn` (`src/pages/Appraisee/AppraiseeCheckIn.js`)  
**API Endpoint:** GET `/appraisal/my_appraisal_dashboard` (quarter passed as empty for annual) — <span style="color:#1f9d55;">✔ Integrated</span>  
**Description:** Shows annual appraisal cards for employee.

### Appraiser Dashboard

**Route:** `/appraiser/dashboard`  
**Component:** `AppraiserDashboard` (`src/pages/Appraiser/AppraiserDashboard.js`)  
**API Endpoint:** GET `/appraisal/reportee_appraisal/dashboard` (quarter passed as empty) — <span style="color:#1f9d55;">✔ Integrated</span>  
**Description:** Shows list of reportees requiring annual appraisal.

---

### 1. Appraisee Adding the Details

**Route:** `/appraisal/appraisee-check-in`  
**Component:** `AppraiseeCheckIn` (`src/pages/Appraisee/AppraiseeCheckIn.js`)  
**API Endpoints:**

- GET `/appraisal/employee_self_appraisal` (with empNo, fy, appraisalPeriod, quarter, role, etc.) — <span style="color:#1f9d55;">✔ Integrated</span>
- POST `/appraisal/submit-self-appraisal` — <span style="color:#1f9d55;">✔ Integrated</span>

**Description:** Annual self-appraisal form with measurable/non-measurable KRAs, development inputs, and appraisee comments on all fields.

---

### 2. Appraiser Adding and Reviewing Details

**Route:** `/appraiser/add-appraisal`  
**Component:** `AppraiserAddAppraisal` (`src/pages/Appraiser/AppraiserAddAppraisal.js`)  

**List View:**

- **API Endpoint:** GET `/appraisal/reportee_appraisal/dashboard` — <span style="color:#1f9d55;">✔ Integrated</span>

**Form View:**

- **API Endpoints:**
  - GET `/appraisal/reportee_appraisal/`
  - POST `/appraisal/reportee_appraisal/submit`
  
**Description:** Appraisee comments are displayed, appraiser adds their responses on top of them for KRAs and development inputs.

---

### 3. Reviewer Mode

**Reviewer Dashboard**

- **Route:** `/appraiser/reviewer-dashboard`  
- **Component:** `ReviewerDashboard` (`src/pages/Appraiser/ReviewerDashboard/ReviewerDashboard.js`)  
- **Description:** Entry point showing reviewer assignments with filters (employee, role, branch, status). Currently seeded with placeholder data while awaiting the reviewer dashboard API.

**Reviewer Form**

- **Route:** `/appraiser/reviewer-mode`  
- **Component:** `ReviewerMode` (`src/pages/Appraiser/ReviewerMode/ReviewerMode.js`)  
- **API Endpoints:**
   - GET `/appraisal/acceptor_appraisal` — <span style="color:#1f9d55;">✔ Integrated</span> (data loader)
   - POST `/appraisal/acceptor_appraisal/submit` — ⚠️ Stubbed in UI (awaiting backend confirmation)

**Description:** The reviewer mode renders appraisee comments, appraiser comments, and editable reviewer comments/scores per KRA. Includes decision radio group (Approve/Send Back/Hold) and consolidated remarks before submission.

---

### 4. Annual Appraisal Home

**Route:** `/appraiser/annual-appraisal-home`  
**Component:** `AnnualAppraisalHome` (`src/pages/Appraiser/AnnualAppraisalHome.js`)  
**Description:** Shows the total score after the whole rounds of process by reviewer.

---

### 5. Appeal Flow

#### 5a. Add Appeal

**Route:** `/annual/add-appeal`  
**Component:** `AddAppeal` (`src/pages/Appeal/AddAppeal.js`)  
**API Endpoints:**

- GET `/appraisal/appeal_report`
- POST `/appraisal/appeal_report/submit`

**Description:** Form to raise appeal with KRA selection, score modification, file upload, and mandatory file requirement.

#### 5b. Review Appeal - List of Appeals

**Route:** `/appeal-resolutions/annual-appeal/employee-appeal-list`  
**Component:** `EmployeeAppealList` (`src/pages/Appeal/EmployeeAppealList.js`)  
**API Endpoint:** GET `/appraisal/appeal_commitee` (note: typo in endpoint)  
**Description:** Shows filterable list of appeals with module name, FY, quarter, scale filters. Approve button with validation alert box.

#### 5c. Appeal Committee Review Form

⚠️ **IMPLEMENTATION GAP:** Component not yet implemented in App.js

**API Endpoints:**

- GET `/appraisal/appeal_report/review`
- POST `/appraisal/appeal_commitee/submit`

**Description:** Appeal committee reviews and approves/rejects appeals.

#### 5d. View Appeal Summary

⚠️ **IMPLEMENTATION GAP:** Component not yet implemented in App.js

**Description:** Goes into View Appeal Summary - final appeal status view.

---

## Navigation Patterns

**State Transfer:** All forms use `location.state` for navigation data transfer including:

- `financialYear` (e.g., "FY 2024-25")
- `appraisalPeriod` ("Quarterly" or "Annual")
- `quarter` ("Q1", "Q2", "Q3", or empty for annual)
- `dateRange`
- `employee` details
- `role` information
- `empNo` (employee number)

**Back Navigation:** Components use `navigate(-1)` with preserved state for seamless back button functionality.

---

## Key Notes

1. **Naming Inconsistencies:**
   - "Quaterly" vs "Quarterly" spelling variations in routes and components
   - API endpoint: "commitee" instead of "committee" (`/appraisal/appeal_commitee`)

2. **Component Reuse:**
   - `AppraiseeCheckIn` is used for both quarterly and annual appraisal entry points
   - `AppraisalCheckInForm` handles both appraisee and appraiser check-ins (distinguished by pageType/intent)

3. **Data Fetching:**
   - Newer components use React Query (`@tanstack/react-query`)
   - Older components use direct API calls via `src/services/api.js`

4. **Authentication:**
   - All routes protected with `isAuthenticated` check
   - Note: Currently bypassed in development (see `App.js` TODO comment)

1. Appraisee-check-in-dashboard
    1. add check-in-summary or Add Exception
        1. clicks on Add-Check-in Summary (Form)
      -> GET ENDPOINT -> /appraisal/quarterly_check_in_report — <span style="color:#1f9d55;">✔ Integrated</span>
      -> POST ENDPOINT -> is the same (/save or /submit) — <span style="color:#1f9d55;">✔ Integrated</span>
        <!-- 2. Development Inputs will show the inputs (2 Questions in the screenshots)         -->
2. appraiser-check-in
    1. show list of people (integrated)
   GET ENDPOINT - /appraisal/quarterly_reportee_appraisal/dashboard — <span style="color:#1f9d55;">✔ Integrated</span>
    2. Clicks on Add Check-in Summary
   GET ENDPOINT -> /appraisal/quarterly_check_in_report — <span style="color:#1f9d55;">✔ Integrated</span>
   POST ENDPOINT -> is the same (/save or /submit) — <span style="color:#1f9d55;">✔ Integrated</span>
    {PAGETYPE AND INTENT WILL CHANGE}
    <!-- 3. Renders Appraisee-comments and you’d have to answer the questions accordingly, -->

3. Quartely-Exception
    2. Filed for an exception from Appraisee-Checkin-Dashboard  
    -> Exception form
   GET ENDPOINT -> /appraisal/quarterly_exception_report — <span style="color:#1f9d55;">✔ Integrated</span>
   POST ENDPOINT -> /appraisal/quarterly_exception_report/submit_exception — <span style="color:#1f9d55;">✔ Integrated</span>
    <!-- 3. list of mesurable and non-mesurable thingys ⇒ correct them out
    4. upload file too -->
4. Exception Resolution - Review Exception
    1. From list of Exception Resolution
   GET ENDPOINT -> /appraisal/exception_quarterly_verify — <span style="color:#1f9d55;">✔ Integrated</span>
    <!-- 2. has a list of Radio buttons to accept as it is and 2 other options -->
    FORM
   GET ENDPOINT -> /appraisal/exception_quarterly_verify/review — <span style="color:#1f9d55;">✔ Integrated</span>
   POST ENDPOINT -> /appraisal/exception_quarterly_verify/submit — <span style="color:#1f9d55;">✔ Integrated</span>

5. Exception Validation - Review Exception  
   LIST
   GET ENDPOINT - /appraisal/exception_quarterly_validator/dashboard
   1. review the Exception essentially - look through the document and other things
   GET ENDPOINT - exception_quarterly_validator/review — <span style="color:#1f9d55;">✔ Integrated</span>
   POST ENDPOINT - exception_quarterly_validator/submit — <span style="color:#1f9d55;">✔ Integrated</span>
6. Final Stage → View Exception and Appraisal Status Completed.

---

### Annual Appraisal Flow

-> Appraisee-dashboard (GET) => `/appraisal/my_appraisal_dashboard` — <span style="color:#1f9d55;">✔ Integrated</span>
-> Appraiser-dashboard (GET) => /appraisal/reportee_appraisal/dashboard (quarter - pass empty) — <span style="color:#1f9d55;">✔ Integrated</span>

1. Appraisee Adding the Details
   GET ENDPOINT -> /employee_self_appraisal — <span style="color:#1f9d55;">✔ Integrated</span>
    1. Bunch of Fields and Appraisee Comments on all of them
    2. Click on Submit
   POST ENDPOINT -> /employee_self_appraisal/submit — <span style="color:#1f9d55;">✔ Integrated</span>
2. Appraiser Adding and Reviewing Details
LIST
   GET ENDPOINT -> /appraisal/reportee_appraisal/dashboard — <span style="color:#1f9d55;">✔ Integrated</span>
    1. Appraisee Comments are given, on top of that,
   FORM GET ENDPOINT -> /appraisal/reportee_appraisal/
   POST ENDPOINT -> /appraisal/reportee_appraisal/submit
3. Reviewer Mode
    GET POINT -> /appraisal/acceptor_appraisal
    POST ENDPOINT -> (to be provided)
    1. goes into reviewing the details
    2. renders appraisee comment, appraiser comment and reviewer comment
4. Shows the total score after the whole rounds of process by reviewer
    1. Add Appeal
      GET ENDPOINT -> /appraisal/appeal_report
      POST -> /appraisal/appeal_report/submit
    2. Review Appeal → Approve Button (Also show Validation on Alert Box)
     LIST of Appeals
     GET -> /appraisal/appeal_commitee
     APPEAL FORM
     GET -> /appraisal/appeal_report/review
     POST -> /appraisal/appeal_commitee/submit

     Appeal Review Form
     GET -> /appraisal/appeal_report/review
     POST -> /appraisal/appeal_commitee/submit
    3. Goes into View Appeal Summary
