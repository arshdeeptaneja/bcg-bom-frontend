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
**Purpose:** Submit appeal for annual appraisal

### Client URL
```
http://localhost:3000/annual/add-appeal
```

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

---

*Last Updated: November 2025*
