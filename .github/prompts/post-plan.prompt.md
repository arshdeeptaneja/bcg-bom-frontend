# Quarterly Check-in Report Integration Guide

This document outlines the necessary corrections for integrating the `quarterly_check_in_report/save` endpoint.

## 1. API Endpoint Corrections

### Field Mappings
The following fields in the JSON payload need to be mapped correctly to match the backend DTO (`SaveQuarterlyCheckInReportRequest`):

| Client Field Name | Backend Field Name | Description |
| :--- | :--- | :--- |
| `HIGHLIGHTS_COMMENTS` | `performancePeriodComment` | Highlights of performance |
| `BELOW_EXPECTATIONS_COMMENTS` | `areasPerformanceComment` | Areas for improvement/below expectations |

### Data Types
Ensure the following fields use the correct data types:

*   **`financialYear`**: Should be an **Integer** (e.g., `2025`), not a String.

### KRA Data Structure
*   **`old_actual`**: The backend service explicitly looks for `old_actual` in the KRA data object (`kra.get("old_actual")`). Ensure this field is included in the `kraData` array items, even if it duplicates `actual_og` or is null/empty initially.

## 2. Corrected Payload Example

```json
{
  "financialYear": 2025,
  "quarter": "Q3",
  "empNumber": "38965",
  "urlId": "U-34545",
  "submittype": "self",
  "startDate": "2024-07-01 00:00:00.0",
  "endDate": "2024-09-30 00:00:00.0",
  "reportingAuthority": "string",
  "organizationName": "string",
  "performanceMeasurableComment": [],
  "nonMeasurableComment": "",
  "performanceNonMeasurableComment": "",
  "performanceSemiMeasurableComment": "",
  "performancePeriodComment": "Highlights comment goes here",
  "areasPerformanceComment": "Areas for improvement comment goes here",
  "kraData": [
    {
      "KRA_CODE": 100003,
      "kra_desc": "% Growth in average MSME outstanding advances",
      "kratype": "measurable",
      "target": 70,
      "actual": 99,
      "score": 10.2,
      "maxscore": 10,
      "old_actual": "70", 
      "actual_og": "70",
      "target_og": "70",
      "unit": "%",
      "ACHIEVEMENT": 100,
      "MONTH": 11,
      "KRA_COMMENT": "",
      "IS_PARENT_KRA": false
      // ... other fields as needed
    }
  ]
}
```

## 3. Corrected CURL Command

Use this CURL command to test the endpoint with the corrected structure:

```bash
curl 'http://localhost:8084/appraisal/quarterly_check_in_report/save' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'Authorization: Bearer kf93jF!8sh2%wX9aL0pQzV3rB8xYtU2eR6sD9jH1kM5nW4qT' \
  -H 'Cache-Control: no-cache' \
  -H 'Referer: http://localhost:3000/' \
  -H 'sec-ch-ua: "Chromium";v="142", "Microsoft Edge";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
  "financialYear": 2025,
  "quarter": "Q3",
  "empNumber": "38965",
  "urlId": "U-34545",
  "kraData": [
    {
      "actual_score": 10.2,
      "reva_actual": "",
      "COMMENT_SELF_2": null,
      "PARENT_KRA": null,
      "MONTH": 11,
      "COMMENT_SELF_1": null,
      "kratype": "measurable",
      "kra_desc": "% Growth in average MSME outstanding advances",
      "bonus": 0,
      "show_target": "",
      "maxscore": 10,
      "MANUAL_FLAG": null,
      "self_actual": "",
      "repa_target": "70",
      "reva_target": "",
      "APPRAISER_ACTUAL": "",
      "score": 10.2,
      "SUB_KRA_EXIST": null,
      "COMMENT_REVA": null,
      "lakshyaid": "",
      "kra_display_flag": 0,
      "show_actual": "",
      "KRA_COMMENT": "",
      "mpb": null,
      "mpb_og": null,
      "ACTUAL_EDIT_STATUS": null,
      "actual": 99,
      "IS_PARENT_KRA": false,
      "repa_score": 10.2,
      "target_og": "70",
      "repa_actual_score": 10.2,
      "COMMENT_REPA": null,
      "reva_score": 0,
      "APPRAISEE_ACTUAL": "",
      "actual_og": "70",
      "old_actual": "70",
      "KRA_CODE": 100003,
      "target": 70,
      "KRA_METRIC": "",
      "ACHIEVEMENT": 100,
      "unit": "%",
      "repa_actual": "70",
      "KRA_STATUS": null
    }
  ],
  "submittype": "self",
  "startDate": "2024-07-01 00:00:00.0",
  "endDate": "2024-09-30 00:00:00.0",
  "reportingAuthority": "string",
  "organizationName": "string",
  "performanceMeasurableComment": [],
  "nonMeasurableComment": "",
  "performanceNonMeasurableComment": "",
  "performanceSemiMeasurableComment": "",
  "performancePeriodComment": "Highlights comment goes here",
  "areasPerformanceComment": "Areas for improvement comment goes here"
}'
```
