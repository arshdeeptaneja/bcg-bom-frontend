# Mock Data & Routes

This document contains mock API response payloads and example cURL commands for the Quarterly Appraisal Flow.

## Quick Route Access & Mock Payloads

### Appraisee Quarterly Check-In Form (Self Entry)

**Direct Route:** `http://localhost:3000/quarterly/quaterly-appraisee-check-in` or `navigate('/quarterly/quaterly-appraisee-check-in', { state })`

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

**Direct Route:** `http://localhost:3000/appraisal/check-in-form`

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

# Submit appraiser remarks
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

**Direct Route:** `navigate('/appraisal/exception-quarterly', { state })`

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
- Dashboard list: `http://localhost:3000/appraiser/reviewer-dashboard?financialYear=FY%202024-25&appraisalPeriod=Annual&quarter=`
- Reviewer form: `http://localhost:3000/appraiser/reviewer-mode`

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

## Mock API Response Payloads

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
        "appraiseeComment": "",
        "appraiserComment": ""
      }
    ],
    "exceptionDetails": {
      "reason": "Score Correction",
      "description": "Actuals were not updated in time",
      "attachment": "proof.pdf"
    }
  }
}
```
