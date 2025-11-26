# Annual Appraisal Routes Reference

Quick reference for annual appraisal client URLs with required parameters.

---

## 1. Annual Check-In (Self Appraisal)

**Route:** `/appraisal/check-in-form`  
**Component:** `AppraisalCheckInForm` → `AnnualCheckIn`  
**Purpose:** Appraisee self-assessment for annual appraisal

### Client URL
```
http://localhost:3000/appraisal/check-in-form?empNo=38965&financialYear=FY%202024-25&quarter=Q2&appraisalPeriod=Annual&urlId=4&roleType=Administrative%20Officers&zoneName=Test%20Zone
```

### Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `empNo` | string | ✅ | `38965` | Employee number |
| `financialYear` | string | ✅ | `FY 2024-25` | Financial year (URL encoded: `FY%202024-25`) |
| `quarter` | string | ❌ | `Q2` | Quarter (defaults based on current date) |
| `appraisalPeriod` | string | ✅ | `Annual` | Must be `Annual` for this flow |
| `urlId` | string | ❌ | `4` | URL/Assignment ID |
| `roleType` | string | ❌ | `Administrative Officers` | Role type |
| `zoneName` | string | ❌ | `Test Zone` | Zone name |

### State Alternative
Can also be accessed via `navigate()` with `location.state`:
```javascript
navigate('/appraisal/check-in-form', {
  state: {
    employee: { empNo: '38965', zoneName: 'Test Zone' },
    financialYear: 'FY 2024-25',
    quarter: 'Q2',
    appraisalPeriod: 'Annual',
    urlId: '4',
    roleType: 'Administrative Officers'
  }
});
```

---

## 2. Annual Appraiser Review

**Route:** `/appraisal/annual/appraiser-review`  
**Component:** `AnnualAppraisalReview`  
**Purpose:** Appraiser/Reviewer assessment of reportee's annual appraisal

### Client URL
```
http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Test%20Zone&roleType=Administrative%20Officers
```

### Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `empNo` | string | ✅ | `38965` | Employee number being reviewed |
| `financialYear` | string | ✅ | `FY 2024-25` | Financial year (URL encoded: `FY%202024-25`) |
| `quarter` | string | ❌ | `Q2` | Quarter (defaults to `Q2`) |
| `url` | string | ✅ | `4` | URL/Assignment ID |
| `zoneName` | string | ❌ | `Test Zone` | Zone name |
| `roleType` | string | ❌ | `Administrative Officers` | Role type (defaults to `Administrative Officers`) |
| `appraisalPeriod` | string | ❌ | `Annual` | Appraisal period (defaults to `Annual`) |

### State Alternative
```javascript
navigate('/appraisal/annual/appraiser-review', {
  state: {
    empNo: '38965',
    financialYear: 'FY 2024-25',
    quarter: 'Q2',
    url: '4',
    zoneName: 'Test Zone',
    roleType: 'Administrative Officers',
    appraisalPeriod: 'Annual'
  }
});
```

---

## 3. Annual Reviewer/Acceptor Review

**Route:** `/appraisal/annual/reviewer`  
**Component:** `AnnualReview`  
**Purpose:** Reviewing Authority / Accepting Authority assessment of annual appraisal

### Client URL
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Test%20Zone&roleType=Administrative%20Officers&currentAuthority=REVIEWER
```

### Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `empNo` | string | ✅ | `38965` | Employee number being reviewed |
| `financialYear` | string | ✅ | `FY 2024-25` | Financial year (URL encoded: `FY%202024-25`) |
| `quarter` | string | ❌ | `Q2` | Quarter (defaults to `Q2`) |
| `url` | string | ✅ | `4` | URL/Assignment ID (can also use `urlId`) |
| `urlId` | string | ❌ | `4` | Alternative to `url` |
| `zoneName` | string | ❌ | `Test Zone` | Zone name |
| `roleType` | string | ❌ | `Administrative Officers` | Role type |
| `appraisalPeriod` | string | ❌ | `Annual` | Appraisal period (defaults to `Annual`) |
| `currentAuthority` | string | ❌ | `REVIEWER` | Authority type: `REVIEWER` or `ACCEPTOR` (defaults to `REVIEWER`) |

### State Alternative
```javascript
navigate('/appraisal/annual/reviewer', {
  state: {
    empNo: '38965',
    financialYear: 'FY 2024-25',
    quarter: 'Q2',
    url: '4',
    zoneName: 'Test Zone',
    roleType: 'Administrative Officers',
    appraisalPeriod: 'Annual',
    currentAuthority: 'REVIEWER', // or 'ACCEPTOR'
    employee: { name: 'John Doe', empNo: '38965', designation: 'Officer' }
  }
});
```

### Notes
- Component includes role switcher dropdown to toggle between REVIEWER and ACCEPTOR modes
- 3-column layout shows: Appraisee | Appraiser | Reviewer/Acceptor data
- Yellow highlighting indicates editable sections

---

## 4. Annual Appraisal Home (Appraiser Dashboard)

**Route:** `/appraiser/annual-appraisal-home`  
**Component:** `AnnualAppraisalHome`  
**Purpose:** Appraiser dashboard showing reportees for annual appraisal

### Client URL
```
http://localhost:3000/appraiser/annual-appraisal-home
```

### Parameters
This route typically uses auth context for the logged-in user. No URL params required.

---

## 5. Appraisee Dashboard (Annual)

**Route:** `/annual/appraisee/appraisee-dashboard`  
**Component:** `AppraiseeDashboard`  
**Purpose:** Appraisee dashboard for annual appraisal status

### Client URL
```
http://localhost:3000/annual/appraisee/appraisee-dashboard
```

---

## 6. Add Appeal (Annual)

**Route:** `/annual/add-appeal`  
**Component:** `AddAppeal`  
**Purpose:** Appraisee can submit appeal against annual appraisal scores with supporting documents

### Client URL (Direct Browser Access)
```
http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer
```

### Full URL with All Parameters
```
http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer&financialYear=2025&appraisalPeriod=Annual&empNo=38965&employeeName=Santosh%20Kumar%20Mishra&primaryRole=Branch%20Manager&role=APPRAISEE
```

### URL Query Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `roleId` | string | ✅ | `4` | Role ID for fetching appeal data from API |
| `roleType` | string | ✅ | `Administrative Officer` | Role type (URL encoded: `Administrative%20Officer`) |
| `financialYear` | string | ❌ | `2025` | Financial year (defaults to `2025`) |
| `appraisalPeriod` | string | ❌ | `Annual` | Appraisal period (defaults to `Annual`) |
| `quarter` | string | ❌ | `Q1` | Quarter (optional for annual) |
| `empNo` | string | ❌ | `38965` | Employee number |
| `employeeName` | string | ❌ | `Santosh Kumar Mishra` | Employee full name |
| `primaryRole` | string | ❌ | `Branch Manager` | Primary role/designation |
| `branch` | string | ❌ | `Mumbai Main` | Branch/office location |
| `appraiser` | string | ❌ | `Jane Smith` | Appraiser name |
| `role` | string | ❌ | `APPRAISEE` | User role (defaults to `APPRAISEE`) |

### API Endpoints

#### GET: Fetch Appeal Report Data
```
GET /appraisal/appeal_report?roleId=4&roleType=Administrative%20Officer
```

#### POST: Submit Appeal
```
POST /appraisal/appeal_report/submit
Content-Type: multipart/form-data

Form Fields:
- payload: JSON string with appeal data
- attachment: File (optional)
```

### State Alternative (via navigate)
```javascript
navigate('/annual/add-appeal', {
  state: {
    roleId: '4',
    roleType: 'Administrative Officer',
    financialYear: 'FY 2024-25',
    appraisalPeriod: 'Annual',
    dateRange: '01 Apr 2024 - 31 Mar 2025',
    employee: {
      empNo: '36663',
      employeeName: 'John Doe',
      primaryRole: 'Branch Manager',
      branch: 'Mumbai Main',
      appraiser: 'Jane Smith',
      roles: ['Role 1', 'Role 2', 'Role 3', 'Role 4']
    },
    role: 'APPRAISEE'
  }
});
```

### State Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `roleId` | string | ✅ | `4` | Role ID for API call |
| `roleType` | string | ✅ | `Administrative Officer` | Role type for API call |
| `financialYear` | string | ✅ | `FY 2024-25` | Financial year for the appraisal |
| `appraisalPeriod` | string | ✅ | `Annual` | Must be `Annual` for annual appraisal |
| `dateRange` | string | ✅ | `01 Apr 2024 - 31 Mar 2025` | Date range for the appraisal period |
| `employee` | object | ✅ | See below | Employee information object |
| `employee.empNo` | string | ✅ | `36663` | Employee number |
| `employee.employeeName` | string | ✅ | `John Doe` | Employee full name |
| `employee.primaryRole` | string | ✅ | `Branch Manager` | Primary role/designation |
| `employee.branch` | string | ✅ | `Mumbai Main` | Branch/office location |
| `employee.appraiser` | string | ✅ | `Jane Smith` | Appraiser name |
| `employee.roles` | array | ❌ | `['Role 1', 'Role 2']` | Additional roles timeline (up to 4) |
| `role` | string | ❌ | `APPRAISEE` | User role (defaults to `APPRAISEE`) |
| `quarter` | string | ❌ | `Q1` | Quarter (for quarterly appeals, optional for annual) |

### Features

#### Form Sections
1. **Employee Information Section**
   - Displays employee details (name, number, designation, branch)
   - Shows role timeline with additional roles
   - Displays appraisal date range

2. **Final Score Summary**
   - Shows KRA categories and weightages
   - Displays total scores

3. **Discretionary KRAs - Measurable**
   - Select KRAs to appeal via checkboxes
   - View Actual vs Target values
   - See Max Score and Current Score
   - Expand to view previous comments
   - Enter appeal justification (required when selected)

4. **Discretionary KRAs - Non-Measurable**
   - Select KRAs to appeal via checkboxes
   - View current scores
   - Scoring scale information (1-5)
   - Expand to view previous comments
   - Enter appeal justification (required when selected)

5. **File Upload Section**
   - Drag-and-drop or click to upload
   - Supported formats: .xls, .xlf, .xlsx, .jpeg, .jpg, .png
   - Maximum total size: 5MB
   - View uploaded files with size info
   - Remove individual files

#### Validation Rules
- At least one KRA must be selected
- All selected KRAs must have appeal justification text
- File type and size validation (client-side)

#### Submission
- Converts files to Base64 for transmission
- Displays success modal with Appeal ID upon successful submission
- Shows validation errors at top of form
- Redirects to appraisee dashboard after successful submission

### API Endpoints Used

#### GET: Fetch Appraisal Data
```
/appraisal/employee_self_appraisal
```
**Query Params:**
- `empNo`: Employee number
- `financialYear`: Financial year
- `appraisalPeriod`: "Annual"
- `quarter`: (optional)

**Response:** Appraisal data including measurable and non-measurable KRAs with scores

#### POST: Submit Appeal
```
/appraisal/appeal_report/submit
```
**Content-Type:** `multipart/form-data`

**Payload Structure:**
```javascript
{
  employeeId: "36663",
  financialYear: "FY 2024-25",
  appraisalPeriod: "Annual",
  appeals: [
    {
      kraId: 1,
      kraName: "CASA Account Growth",
      kraType: "MEASURABLE",
      currentScore: 24,
      appealText: "Detailed justification..."
    }
  ],
  attachments: [
    {
      fileName: "evidence.pdf",
      fileType: "application/pdf",
      fileSize: 102400,
      fileData: "base64EncodedString..."
    }
  ],
  submittedAt: "2024-11-27T00:00:00.000Z"
}
```

**Response:**
```javascript
{
  success: true,
  appealId: "APPEAL-123456",
  message: "Appeal submitted successfully"
}
```

### Navigation Flow

#### Entry Points
1. From Appraisee Dashboard - "Add Appeal" button
2. From annual appraisal review page - "Submit Appeal" action

#### Exit Points
1. Success - Redirects to `/annual/appraisee/appraisee-dashboard`
2. Cancel - Back button returns to previous page
3. Error - Remains on page with error messages

### User Experience

#### Loading States
- Initial data load: Full-page spinner with "Loading appraisal data..." message
- File upload: Progress indicator
- Submission: Disabled button with "Submitting Appeal..." text and spinner

#### Error States
- **Missing Context:** Warning banner with "Required information is missing. Please navigate from the dashboard."
- **API Error:** Error alert with retry button
- **Validation Errors:** Summary box at top with bulleted list of errors
- **File Errors:** Inline error messages in file upload section

#### Success State
- Modal overlay with:
  - Success icon (green checkmark)
  - "Appeal Submitted Successfully!" message
  - Appeal ID displayed prominently
  - Information about next steps
  - "OK" button to close and redirect

### Visual Design

#### Color Scheme
- Primary accent: `var(--accent-color)` - #0189d0
- Selected KRA highlight: #e7f3ff (light blue)
- Error messages: #dc3545 (red)
- Success: #28a745 (green)
- Warnings: #ffc107 (yellow)

#### Layout
- Max content width: 1400px
- Sections: White background with shadow
- Spacing: Consistent 2rem padding
- Responsive: Adapts to tablet and mobile screens

### Testing

#### Test URLs
Since this route requires state, test by:
1. Navigate from appraisee dashboard after login
2. Use browser console to navigate with state:
```javascript
window.location.href = '/annual/add-appeal';
// Note: Will show "Missing Information" warning
// Use proper navigation from dashboard instead
```

#### Manual Testing Checklist
- ✅ Employee information displays correctly
- ✅ Score summary loads
- ✅ KRA sections render with correct data
- ✅ Checkbox selection works
- ✅ Appeal text input appears when KRA selected
- ✅ Validation prevents empty justifications
- ✅ File upload accepts valid types
- ✅ File upload rejects invalid types
- ✅ File size limit enforced
- ✅ Submit button enables/disables correctly
- ✅ Submission shows loading state
- ✅ Success modal appears with Appeal ID
- ✅ Redirect works after success

---

## 7. Annual Review View-Only

**Route:** `/appraisal/annual/view`
**Component:** `AnnualReviewView`
**Purpose:** Read-only view of completed annual appraisal data for historical reference, auditing, and review purposes

### Client URL
```
http://localhost:3000/appraisal/annual/view?empNo=38965&url=4&financialYear=FY%202024-25&zoneName=Test%20Zone&roleType=Administrative%20Officers&quarter=Q2
```

### Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `empNo` | string | ✅ | `38965` | Employee number whose appraisal is being viewed |
| `url` | string | ✅ | `4` | URL/Assignment ID |
| `financialYear` | string | ✅ | `FY 2024-25` | Financial year (URL encoded: `FY%202024-25`) |
| `zoneName` | string | ❌ | `Test Zone` | Zone name (URL encoded: `Test%20Zone`) |
| `roleType` | string | ❌ | `Administrative Officers` | Role type |
| `quarter` | string | ❌ | `Q2` | Quarter (optional for annual) |

### State Alternative
```javascript
navigate('/appraisal/annual/view', {
  state: {
    empNo: '38965',
    url: '4',
    financialYear: 'FY 2024-25',
    zoneName: 'Test Zone',
    roleType: 'Administrative Officers',
    quarter: 'Q2'
  }
});
```

### Features

#### Visual Indicators
- **View-Only Badge:** Prominent badge in header indicating read-only mode
- **No Edit Controls:** All input fields, buttons, and interactive elements are disabled
- **Static Score Display:** Scores shown as badges instead of interactive buttons
- **Read-Only Comments:** Comments displayed in expandable accordions

#### Data Display Sections

1. **Employee Context Section**
   - Employee number, name, designation
   - Organization, scale, job family, cohort
   - Role information (primary, secondary, tertiary)
   - Appraisal date range
   - Uses existing `CheckInDescriptionSection` component

2. **Authority Information**
   - Reporting Authority (name and employee number)
   - Reviewing Authority (name and employee number)
   - Accepting Authority (name and employee number)
   - Only displays if data is available

3. **Final Score Summary**
   - Score categories with weightages
   - Total score calculation
   - Uses existing `FinalScoreSummaryTable` component

4. **Non-Measurable KRAs**
   - Grouped by category (e.g., "Customer Service", "Operations")
   - KRA name, description, and tooltips
   - Multi-role score display:
     - Reporting Authority score
     - Reviewing Authority score
     - Accepting Authority score
     - Post-appeal score (if applicable)
   - Expandable comments from all roles:
     - Self Comment 1
     - Reporting Authority Comment
     - Reviewing Authority Comment
     - Accepting Authority Comment

5. **Measurable KRAs** (if applicable)
   - Table format showing:
     - KRA Name
     - Target vs Actual values
     - Max Score and Final Score
     - Comments

#### Missing Data Handling
- Missing scores: Displays "N/A" or dash
- Empty comments: Shows "No comment provided" in italics
- Missing authority names: Shows "Not Available" or hides section
- Graceful handling of partial data

#### Navigation
- **Back Button:** Returns to previous page (typically dashboard)
- **No Unsaved Changes Prompt:** Since it's view-only, no warnings on navigation
- Uses browser history (`navigate(-1)`)

### Loading & Error States

#### Loading State
- Full-page spinner with message: "Loading annual review data..."
- Centered loading indicator

#### Error States
- **Invalid Context:** Alert with message "Missing required parameters. Please check the URL and try again."
- **API Error:** Alert with retry option and back button
- **Empty Data:** Gracefully handles null/empty responses

#### Success State
- Complete appraisal data displayed in organized sections
- Smooth fade-in animations for each section

### Styling & Design

#### Color Scheme
- View-Only Badge: Info blue (`bg-info`)
- Score Badges:
  - Reporting Authority: Primary blue (`bg-primary`)
  - Reviewing Authority: Success green (`bg-success`)
  - Accepting Authority: Warning yellow (`bg-warning`)
  - Post Appeal: Info blue (`bg-info`)

#### Layout
- Max content width: 1400px
- Card-based sections with shadow
- Responsive grid for score display
- Mobile-friendly accordion for comments

#### Accessibility
- Proper ARIA labels for read-only indicators
- Keyboard navigation support
- Screen reader compatible
- High contrast for disabled elements
- Focus indicators for interactive elements

### API Endpoint Used

#### GET: Fetch View-Only Appraisal Data
```
/appraisal/acceptor_appraisal/view
```

**Query Params:**
- `empNo`: Employee number
- `url`: URL/Assignment ID
- `zoneName`: Zone name
- `roleType`: Role type
- `financialYear`: Financial year
- `quarter`: Quarter (optional)

**Headers:**
```javascript
{
  'accept': '*/*',
  'Authorization': 'Bearer {token}'
}
```

**Response:** Complete appraisal data including:
- Employee metadata
- Final score summary
- Non-measurable KRAs grouped by category
- Measurable KRAs
- Comments from all roles
- Authority information

### Data Transformation

Uses existing `transformAnnualAppraisalData` function from `appraisalTransformers.js` to convert API response to component-compatible format.

**Transformed Structure:**
```javascript
{
  finalScoreSummary: [
    {
      Category: "Business Dimension",
      MaxScore: 20,
      SelfScore: 18,
      ReportingAuthorityScore: 17,
      ReviewingAuthorityScore: 17,
      AcceptingAuthorityScore: 16,
      PostAppealScore: 17
    }
  ],
  nonMeasurableKras: {
    "Customer Service": [
      {
        KraId: 1,
        KraName: "Customer Satisfaction",
        MaxScore: 5,
        RepaScore: 4,
        RevaScore: 4,
        AcScore: 3,
        CommentSelf1: "Maintained high satisfaction...",
        CommentRepa: "Good performance...",
        // ... other fields
      }
    ]
  },
  metadata: {
    empName: "John Doe",
    empNumber: "38965",
    reportingAuthorityName: "Jane Smith",
    // ... other metadata
  }
}
```

### React Query Integration

**Cache Key:**
```javascript
['annualReviewView', empNo, url, zoneName, roleType, financialYear, quarter]
```

**Cache Settings:**
- Stale time: 5 minutes
- Retry: 1 attempt
- Enabled only when context is valid

### Navigation Flow

#### Entry Points
1. From appraisal dashboard - "View" button on completed appraisals
2. From appraisal home - Historical record links
3. From reviewer dashboard - View submitted appraisals
4. Direct URL access with valid parameters

#### Exit Points
1. Back button - Returns to previous page
2. Dashboard navigation - Via top navigation
3. Browser back button - Standard browser navigation

### Security

- **Authentication Required:** Route is protected and requires valid JWT token
- **Authorization:** Backend validates user has permission to view the appraisal
- **No Modification:** All form elements are non-interactive (pointer-events: none)

### Print Support

Optimized CSS for printing:
- Hides navigation elements
- Removes interactive buttons
- Maintains readable layout
- Page break handling for long content

### Performance Optimizations

- **React Query Caching:** 5-minute cache for repeated views
- **Lazy Loading:** Components load only when data is available
- **Memoization:** Context and transformed data are memoized
- **Conditional Rendering:** Sections only render if data exists

### Testing

#### Manual Test URL
```
http://localhost:3000/appraisal/annual/view?empNo=38965&url=4&financialYear=FY%202024-25&zoneName=Central%20Zone&roleType=Administrative%20Officers
```

#### Test Checklist
- ✅ View-Only badge displays prominently
- ✅ Employee context section loads correctly
- ✅ Authority information displays (when available)
- ✅ Final score summary renders
- ✅ Non-measurable KRAs grouped correctly
- ✅ Scores from all roles display properly
- ✅ Comments expand/collapse in accordions
- ✅ Missing data shows appropriate placeholders
- ✅ Back button navigation works
- ✅ No edit functionality available
- ✅ Loading state displays during data fetch
- ✅ Error states show appropriate messages
- ✅ Responsive design works on mobile
- ✅ Print layout is optimized

#### Test Scenarios

**Scenario 1: Complete Data**
- All KRAs have scores from all roles
- All comments are present
- Authority information complete
- Expected: Full display with no placeholders

**Scenario 2: Partial Data**
- Some roles haven't scored
- Some comments missing
- Expected: "N/A" and "No comment provided" placeholders

**Scenario 3: Invalid Parameters**
- Missing required parameters (empNo, url, or financialYear)
- Expected: Warning message with back button

**Scenario 4: API Error**
- Network error or server error
- Expected: Error alert with retry option

**Scenario 5: Empty Response**
- Valid parameters but no data returned
- Expected: Graceful handling with appropriate message

### Differences from Editable Views

| Feature | Editable View | View-Only |
|---------|--------------|-----------|
| Score Input | Buttons/Dropdowns | Static badges |
| Comments | Textarea inputs | Read-only accordions |
| Submit Button | Present | Absent |
| Save Draft | Available | Not available |
| Form Validation | Active | None |
| Role Switching | Available | Fixed view |
| Visual Indicator | None or "Edit Mode" | "View Only" badge |
| URL Pattern | `.../reviewer` or `.../appraiser-review` | `.../view` |

### Related Routes

- **Self Appraisal:** `/appraisal/check-in-form` - Appraisee fills their annual appraisal
- **Appraiser Review:** `/appraisal/annual/appraiser-review` - Appraiser evaluates reportee
- **Reviewer/Acceptor:** `/appraisal/annual/reviewer` - Reviewer/Acceptor evaluates with edit capability

### Implementation Files

**Component:**
```
src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualReviewView.js
src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualReviewView.css
```

**Hook:**
```
src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualReviewView.js
```

**Tests:**
```
src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualReviewView.test.js
```

**Routing:**
```
src/App.js - AnnualReviewViewLayout component
```

### Notes

- This is a **read-only** interface - no data modification allowed
- Uses same API endpoint as editable views but with different intent
- Designed for historical reference and auditing purposes
- Automatically handles missing data with appropriate placeholders
- Fully responsive and mobile-friendly
- Print-optimized for documentation purposes
- Integrated with React Query for efficient caching
- Supports both URL parameters and location state for navigation

---

## URL Encoding Reference

| Character | Encoded |
|-----------|---------|
| Space | `%20` |
| `-` | `-` (no encoding needed) |

**Example:** `FY 2024-25` → `FY%202024-25`

---

## Quick Test URLs

### Self Appraisal (Appraisee)
```
http://localhost:3000/appraisal/check-in-form?empNo=38965&financialYear=FY%202024-25&appraisalPeriod=Annual&urlId=4&zoneName=Central%20Zone&roleType=Administrative%20Officers
```

### Appraiser Review
```
http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&url=4
```

### Reviewer/Acceptor Review
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&url=4&currentAuthority=REVIEWER
```

### Acceptor Review
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&url=4&currentAuthority=ACCEPTOR
```

### Add Appeal (Annual)
```
http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer
```

### Add Appeal (Full Parameters)
```
http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer&financialYear=2025&appraisalPeriod=Annual&empNo=38965&employeeName=Santosh%20Kumar%20Mishra
```

### Review Appeal (Appraiser)
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=APPRAISER
```

### Review Appeal (Reviewing Authority)
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=REVIEWER
```

---

## 8. Review Appeal (Appraiser/Reviewing Authority)

**Route:** `/appeal/review`
**Component:** `ReviewAppeal`
**Purpose:** Appraiser (Reporting Authority) and Reviewing Authority review and approve/reject employee appeals against annual appraisal scores

### Client URL
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=APPRAISER
```

### Parameters

| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `roleId` | string | ✅ | `4` | Role ID for fetching appeal data from API |
| `roleType` | string | ✅ | `Administrative Officer` | Role type (URL encoded: `Administrative%20Officer`) |
| `empNo` | string | ✅ | `38965` | Employee number whose appeal is being reviewed |
| `financialYear` | string | ✅ | `2025` | Financial year |
| `role` | string | ✅ | `APPRAISER` | Reviewer role: `APPRAISER` or `REVIEWER` |

### State Alternative
```javascript
navigate('/appeal/review', {
  state: {
    roleId: '4',
    roleType: 'Administrative Officer',
    empNo: '38965',
    financialYear: '2025',
    role: 'APPRAISER' // or 'REVIEWER'
  }
});
```

### Features

#### Review Actions
For each appealed KRA, the reviewer can:
1. **ACCEPT AS IT IS** - Accept the appealed score without changes
2. **ACCEPT AND EDIT** - Accept the appeal but modify the score
3. **REJECT** - Reject the appeal with mandatory reason

#### Form Sections
1. **Header Section**
   - Title: "Review Appeal"
   - Financial year badge
   - Appraisal type badge (Annual Appraisal)
   - Back button

2. **Employee Information**
   - Employee ID, Name, Primary Role
   - Branch/Office
   - Duration (date range)
   - Reporting Authority details
   - Reviewing Authority details
   - Accepting Authority details

3. **Score Display**
   - Discretionary Score comparison (Old vs New)
   - Shows impact of appeal on total scores

4. **Final Score Summary Table**
   - Score categories with weightages
   - Scores by different authorities
   - Post-appeal scores

5. **Appeal KRA Review Sections**
   - **Measurable KRAs**: Table showing actual, target, scores
   - **Non-Measurable KRAs**: Table with 1-5 scoring scale
   - Each KRA shows:
     - Checkbox for selection
     - KRA name and description
     - Role scores (Actual, Appraisee, Appellate)
     - Old score vs New (appealed) score
     - Appraisee's appeal comment
     - Action radio buttons
     - Conditional inputs:
       - New score field (for ACCEPT AND EDIT)
       - Reason textarea (for REJECT)

6. **File Download**
   - Download supporting documents uploaded by appraisee
   - Only shows if file exists

7. **Overall Comment**
   - Required textarea for reviewer's overall comment

8. **Submit Section**
   - "Approve" button
   - Confirmation modal before submission
   - Success modal after submission

#### Validation Rules
- At least one KRA must be selected for review
- Each selected KRA must have an action chosen
- If ACCEPT AND EDIT: New score is required and must be ≤ max score
- If REJECT: Reason comment is required
- Overall comment is mandatory

#### Submission
- Status determined automatically:
  - All accepted → APPROVED
  - All rejected → REJECTED
  - Mix of accepted/rejected → PARTIALLY_APPROVED
- Displays success modal with confirmation
- Returns to previous page after successful submission

### API Endpoints Used

#### GET: Fetch Appeal Data for Review
```
GET /appraisal/appeal_report/review
```

**Query Params:**
- `roleId`: Role ID
- `roleType`: Role type
- `empNo`: Employee number
- `financialYear`: Financial year

**Response:** Appeal data including:
- Employee information
- Final score summary
- Appealed KRAs (measurable and non-measurable)
- Old vs New scores
- Appeal comments
- Supporting document URL

#### POST: Submit Appeal Review Decision
```
POST /appraisal/appeal_report/review/approve (Mock)
```

**Payload:**
```javascript
{
  roleId: "4",
  roleType: "Administrative Officer",
  empNo: "38965",
  financialYear: "2025",
  reviewerRole: "APPRAISER", // or "REVIEWER"
  kraDecisions: [
    {
      kraId: 130,
      action: "ACCEPT_AND_EDIT", // or "ACCEPT_AS_IS" or "REJECT"
      newScore: 90, // Only for ACCEPT_AND_EDIT
      comment: "Adjusted based on performance evidence",
      oldScore: 85,
      appealedScore: 115,
      kraType: "discretionary_non_measurable"
    }
  ],
  overallComment: "Overall review comment here",
  status: "APPROVED" // or "REJECTED" or "PARTIALLY_APPROVED"
}
```

**Response:**
```javascript
{
  success: true,
  message: "Appeal review approved successfully",
  ticketId: "APPEAL-1234567890"
}
```

### Navigation Flow

#### Entry Points
1. From appeal list/dashboard - "Review Appeal" button
2. Direct URL with parameters

#### Exit Points
1. Success - Redirects to previous page or dashboard
2. Cancel - Back button returns to previous page
3. Error - Remains on page with error messages

### User Experience

#### Loading States
- Initial data load: Full-page spinner with "Loading appeal review data..."
- Submission: Disabled button with "Submitting..." and spinner

#### Error States
- **Missing Parameters:** Warning with "Required information is missing"
- **API Error:** Error alert with retry button
- **Validation Errors:** Inline validation messages on form fields

#### Success State
- Confirmation modal: "Are you sure you want to submit?"
- Success modal with success message
- Auto-redirect after confirmation

### Visual Design

#### Color Scheme
- Primary: Green theme (matching existing appraisal flows)
- Selected KRA highlight: Light blue (#e7f3ff)
- Action buttons: Radio buttons with labels
- Validation errors: Red text

#### Layout
- Max content width: 1400px
- Card-based sections with shadows
- Responsive Bootstrap grid
- Table layout for KRA review

### Workflow

1. **Appraiser Review (First Level)**
   - URL: `...&role=APPRAISER`
   - Appraiser reviews appeals from their reportees
   - Can accept, edit, or reject each appealed KRA

2. **Reviewing Authority (Second Level)**
   - URL: `...&role=REVIEWER`
   - Reviews appeals that passed appraiser review
   - Final decision on appeal outcomes

### Testing

#### Test URL (Appraiser)
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=APPRAISER
```

#### Test URL (Reviewing Authority)
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=REVIEWER
```

#### Manual Testing Checklist
- ✅ Employee information displays correctly
- ✅ Score comparison shows (old vs new)
- ✅ Appeal KRAs load in table format
- ✅ KRA selection works
- ✅ Action radio buttons work
- ✅ Conditional inputs appear based on action
- ✅ New score validation (≤ max score)
- ✅ Reason required for REJECT
- ✅ Overall comment validation
- ✅ File download works (if file exists)
- ✅ Confirmation modal appears
- ✅ Submission works with mock API
- ✅ Success modal displays
- ✅ Redirect works after success

### Notes

- Uses mock API endpoint (can be switched to real endpoint by uncommenting in api.js)
- Single component for both APPRAISER and REVIEWER roles
- Sequential workflow: Appraiser reviews first, then Reviewing Authority
- Comprehensive validation prevents invalid submissions
- All form state managed through custom hook (useReviewAppeal)

---

*Last Updated: November 2025*
