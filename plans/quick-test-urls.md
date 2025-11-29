# Quick Test URLs - Annual Appraisal Routes

All URLs with full query parameters for testing annual appraisal flows.

**Base URL:** `http://localhost:3000`

---

## 1. Self Appraisal (Appraisee Check-In)

**Route:** `/appraisal/check-in-form`

### Minimal Parameters
```
http://localhost:3000/appraisal/check-in-form?empNo=38965&financialYear=FY%202024-25&appraisalPeriod=Annual&urlId=4
```

### Full Parameters
```
http://localhost:3000/appraisal/check-in-form?empNo=38965&financialYear=FY%202024-25&quarter=Q2&appraisalPeriod=Annual&urlId=4&roleType=Administrative%20Officers&zoneName=Central%20Zone
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `empNo` | `38965` | ✅ | Employee number |
| `financialYear` | `FY%202024-25` | ✅ | URL encoded space |
| `quarter` | `Q2` | ❌ | Optional, defaults to current |
| `appraisalPeriod` | `Annual` | ✅ | Must be "Annual" |
| `urlId` | `4` | ❌ | Assignment/URL ID |
| `roleType` | `Administrative%20Officers` | ❌ | URL encoded |
| `zoneName` | `Central%20Zone` | ❌ | URL encoded |

---

## 2. Appraiser Review

**Route:** `/appraisal/annual/appraiser-review`

### Minimal Parameters
```
http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&url=4
```

### Full Parameters
```
http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Central%20Zone&roleType=Administrative%20Officers&appraisalPeriod=Annual
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `empNo` | `38965` | ✅ | Employee being reviewed |
| `financialYear` | `FY%202024-25` | ✅ | URL encoded |
| `quarter` | `Q2` | ❌ | Defaults to Q2 |
| `url` | `4` | ✅ | Assignment ID |
| `zoneName` | `Central%20Zone` | ❌ | URL encoded |
| `roleType` | `Administrative%20Officers` | ❌ | Defaults if missing |
| `appraisalPeriod` | `Annual` | ❌ | Defaults to Annual |

---

## 3. Reviewer/Acceptor Review - REVIEWER Mode

**Route:** `/appraisal/annual/reviewer`

### Minimal Parameters
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&url=4
```

### Full Parameters (REVIEWER)
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Central%20Zone&roleType=Administrative%20Officers&appraisalPeriod=Annual&currentAuthority=REVIEWER
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `empNo` | `38965` | ✅ | Employee being reviewed |
| `financialYear` | `FY%202024-25` | ✅ | URL encoded |
| `quarter` | `Q2` | ❌ | Defaults to Q2 |
| `url` | `4` | ✅ | Assignment ID (or use `urlId`) |
| `urlId` | `4` | ❌ | Alternative to `url` |
| `zoneName` | `Central%20Zone` | ❌ | URL encoded |
| `roleType` | `Administrative%20Officers` | ❌ | Role type |
| `appraisalPeriod` | `Annual` | ❌ | Defaults to Annual |
| `currentAuthority` | `REVIEWER` | ❌ | Defaults to REVIEWER |

---

## 4. Reviewer/Acceptor Review - ACCEPTOR Mode

**Route:** `/appraisal/annual/reviewer`

### Minimal Parameters
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&url=4&currentAuthority=ACCEPTOR
```

### Full Parameters (ACCEPTOR)
```
http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Central%20Zone&roleType=Administrative%20Officers&appraisalPeriod=Annual&currentAuthority=ACCEPTOR
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `empNo` | `38965` | ✅ | Employee being reviewed |
| `financialYear` | `FY%202024-25` | ✅ | URL encoded |
| `quarter` | `Q2` | ❌ | Defaults to Q2 |
| `url` | `4` | ✅ | Assignment ID |
| `zoneName` | `Central%20Zone` | ❌ | URL encoded |
| `roleType` | `Administrative%20Officers` | ❌ | Role type |
| `appraisalPeriod` | `Annual` | ❌ | Defaults to Annual |
| `currentAuthority` | `ACCEPTOR` | ✅ | Must be "ACCEPTOR" for this mode |

---

## 5. Appraiser Dashboard (Annual Home)

**Route:** `/appraiser/annual-appraisal-home`

### URL
```
http://localhost:3000/appraiser/annual-appraisal-home
```

### Notes
- No URL parameters required
- Uses authenticated user from context
- Displays all reportees for annual appraisal

---

## 6. Appraisee Dashboard (Annual)

**Route:** `/annual/appraisee/appraisee-dashboard`

### URL
```
http://localhost:3000/annual/appraisee/appraisee-dashboard
```

### Notes
- No URL parameters required
- Uses authenticated user from context
- Shows appraisee's annual appraisal status

---

## 7. Add Appeal (Annual) - Minimal

**Route:** `/annual/add-appeal`

### Minimal Parameters
```
http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `roleId` | `4` | ✅ | Role ID for API |
| `roleType` | `Administrative%20Officer` | ✅ | URL encoded |

---

## 8. Add Appeal (Annual) - Full Parameters

**Route:** `/annual/add-appeal`

### Full Parameters
```
http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer&financialYear=FY%202024-25&appraisalPeriod=Annual&empNo=38965&employeeName=Santosh%20Kumar%20Mishra&primaryRole=Branch%20Manager&branch=Mumbai%20Main&appraiser=Jane%20Smith&role=APPRAISEE&quarter=Q2&dateRange=01%20Apr%202024%20-%2031%20Mar%202025
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `roleId` | `4` | ✅ | Role ID |
| `roleType` | `Administrative%20Officer` | ✅ | URL encoded |
| `financialYear` | `FY%202024-25` | ❌ | URL encoded, defaults to current |
| `appraisalPeriod` | `Annual` | ❌ | Defaults to Annual |
| `empNo` | `38965` | ❌ | Employee number |
| `employeeName` | `Santosh%20Kumar%20Mishra` | ❌ | URL encoded |
| `primaryRole` | `Branch%20Manager` | ❌ | URL encoded |
| `branch` | `Mumbai%20Main` | ❌ | URL encoded |
| `appraiser` | `Jane%20Smith` | ❌ | URL encoded |
| `role` | `APPRAISEE` | ❌ | User role |
| `quarter` | `Q2` | ❌ | Quarter (optional for annual) |
| `dateRange` | `01%20Apr%202024%20-%2031%20Mar%202025` | ❌ | URL encoded date range |

---

## 9. Review Appeal (Appraiser Level)

**Route:** `/appeal/review`

### Minimal Parameters
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=APPRAISER
```

### Full Parameters
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=APPRAISER&quarter=Q2&appraisalPeriod=Annual
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `roleId` | `4` | ✅ | Role ID |
| `roleType` | `Administrative%20Officer` | ✅ | URL encoded |
| `empNo` | `38965` | ✅ | Employee number |
| `financialYear` | `2025` | ✅ | Year only (not FY format) |
| `role` | `APPRAISER` | ✅ | Reviewer role |
| `quarter` | `Q2` | ❌ | Optional |
| `appraisalPeriod` | `Annual` | ❌ | Appraisal period |

---

## 10. Review Appeal (Reviewing Authority Level)

**Route:** `/appeal/review`

### Minimal Parameters
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=REVIEWER
```

### Full Parameters
```
http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=REVIEWER&quarter=Q2&appraisalPeriod=Annual
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `roleId` | `4` | ✅ | Role ID |
| `roleType` | `Administrative%20Officer` | ✅ | URL encoded |
| `empNo` | `38965` | ✅ | Employee number |
| `financialYear` | `2025` | ✅ | Year only |
| `role` | `REVIEWER` | ✅ | Reviewer role |
| `quarter` | `Q2` | ❌ | Optional |
| `appraisalPeriod` | `Annual` | ❌ | Appraisal period |

---

## 11. View-Only Appraisal

**Route:** `/appraisal/annual/view`

### Minimal Parameters
```
http://localhost:3000/appraisal/annual/view?empNo=38965&url=4&financialYear=FY%202024-25
```

### Full Parameters
```
http://localhost:3000/appraisal/annual/view?empNo=38965&url=4&financialYear=FY%202024-25&zoneName=Central%20Zone&roleType=Administrative%20Officers&quarter=Q2
```

### Parameter Breakdown
| Param | Value | Required | Notes |
|-------|-------|----------|-------|
| `empNo` | `38965` | ✅ | Employee number |
| `url` | `4` | ✅ | Assignment ID |
| `financialYear` | `FY%202024-25` | ✅ | URL encoded |
| `zoneName` | `Central%20Zone` | ❌ | URL encoded |
| `roleType` | `Administrative%20Officers` | ❌ | Role type |
| `quarter` | `Q2` | ❌ | Optional |

---

## URL Encoding Cheat Sheet

| Character/Text | Encoded | Notes |
|---|---|---|
| Space | `%20` | Common in names and multi-word strings |
| `-` | `-` | No encoding needed |
| `FY 2024-25` | `FY%202024-25` | Financial year format |
| `Central Zone` | `Central%20Zone` | Zone names |
| `Administrative Officers` | `Administrative%20Officers` | Role types |
| `Branch Manager` | `Branch%20Manager` | Designations |
| `Santosh Kumar Mishra` | `Santosh%20Kumar%20Mishra` | Employee names |
| `01 Apr 2024 - 31 Mar 2025` | `01%20Apr%202024%20-%2031%20Mar%202025` | Date ranges |

---

## Testing Tips

### Copy & Paste URLs
1. Replace employee number: `38965` → your test employee
2. Replace role ID: `4` → your test role ID
3. Adjust financialYear: `FY 2024-25` → your test year
4. Adjust zone/roleType as needed

### Direct Browser Access
- Paste any minimal URL directly into browser
- You'll be redirected if auth is missing
- Auth tokens must exist in `localStorage`

### Navigation via State
- Most routes also support `location.state` navigation
- Use React DevTools to inspect state

### API Parameter Differences
- **Self Appraisal:** Uses `urlId` and `appraisalPeriod=Annual`
- **Appraiser/Reviewer:** Uses `url` instead of `urlId`
- **Appeals:** Uses `roleId` and `role` parameter for distinguishing APPRAISER vs REVIEWER

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "No financial year or appraisal period found" | Missing `financialYear` or `appraisalPeriod` | Add required params |
| 401 Unauthorized | No auth token in localStorage | Login first |
| Blank page/no data | Valid URL but employee/role doesn't exist | Verify employee/role in DB |
| Wrong component renders | Quarterly vs Annual mismatch | Check `appraisalPeriod=Annual` |

---

## Quick Switch Between Routes

### From Self Appraisal to Appraiser Review
```
FROM: /appraisal/check-in-form?empNo=38965&...&appraisalPeriod=Annual&urlId=4
TO:   /appraisal/annual/appraiser-review?empNo=38965&...&url=4
```
*Note: Parameter `urlId` becomes `url`*

### From Appraiser Review to Reviewer Review
```
FROM: /appraisal/annual/appraiser-review?empNo=38965&...
TO:   /appraisal/annual/reviewer?empNo=38965&...&currentAuthority=REVIEWER
```

### From Annual Appraisal to Appeal
```
FROM: /appraisal/check-in-form?empNo=38965&...
TO:   /annual/add-appeal?roleId=4&roleType=...
```
*Note: Different parameter structure*

---

## Example Test Sequences

### Sequence 1: Complete Annual Appraisal Flow
```
1. Self Appraisal (Appraisee)
   http://localhost:3000/appraisal/check-in-form?empNo=38965&financialYear=FY%202024-25&appraisalPeriod=Annual&urlId=4&zoneName=Central%20Zone&roleType=Administrative%20Officers

2. Appraiser Review
   http://localhost:3000/appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&url=4

3. Reviewer Review (REVIEWER mode)
   http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&url=4&currentAuthority=REVIEWER

4. Acceptor Review (ACCEPTOR mode)
   http://localhost:3000/appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&url=4&currentAuthority=ACCEPTOR

5. View Submitted Appraisal
   http://localhost:3000/appraisal/annual/view?empNo=38965&url=4&financialYear=FY%202024-25
```

### Sequence 2: Appeal Workflow
```
1. Add Appeal
   http://localhost:3000/annual/add-appeal?roleId=4&roleType=Administrative%20Officer

2. Appraiser Reviews Appeal
   http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=APPRAISER

3. Reviewing Authority Reviews Appeal
   http://localhost:3000/appeal/review?roleId=4&roleType=Administrative%20Officer&empNo=38965&financialYear=2025&role=REVIEWER
```

### Sequence 3: Dashboard Navigation
```
1. Appraiser Dashboard
   http://localhost:3000/appraiser/annual-appraisal-home

2. Appraisee Dashboard
   http://localhost:3000/annual/appraisee/appraisee-dashboard
```

---

## Browser DevTools Debugging

### Network Tab
- Monitor all API calls by filtering `/appraisal/` endpoints
- Check request parameters sent
- Verify response data structure

### Console Tab
- Check for JavaScript errors
- Look for API error messages
- Use browser console to log URL parameters:
```javascript
const params = new URLSearchParams(window.location.search);
console.log(Object.fromEntries(params));
```

### Local Storage
- Check for `accessToken` presence
- Verify `userData` structure
- Monitor state changes

---

*Last Updated: November 2025*
