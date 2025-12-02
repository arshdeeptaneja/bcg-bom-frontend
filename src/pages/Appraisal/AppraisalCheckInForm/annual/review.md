- Option Based -> check if Option 1 is not null then put in Option based category
- Appraiser Dashboard navigation to be checked and added in @AppraiseeCheckin.js 
- remove isEditableBy, everything is editable for "appraiser" 


### Add Appeal flow 
- Add "Add Score" Column in table layout 
- "Add Score" - Actual 
- "total" -> target 
- "Final" -> Actual 
- heading (right -> render score (non_mesurable_score_total/discretionary_max_score_total))


### Review Appeal (REPA/REVA)

-> Quartely Score top Panel 
-> Appelate can edit his scores too


Quartely 
- appraisal_status -> pending | complete_self (Appraisee has completed, Appraiser is yet to be filled)
    | complete (Appraisee and Appraiser - done)

Annual 
- status -> pending | complete_self |   complete



- on Click of Appeal Resolution (appraisal/dashboard) -> navigate to /appeal-resolutions/annual-appeal/employee-appeal-list
- in #EmployeeAppealList -> on click of "View Appeal" -> http://localhost:3000/appeal/review?roleId=4083&roleType=Administrative%20%Officer&empNo=38877&financialYear=2025 (#ReviewAppeal Component)
- Status Mapping in #ReviewAppeal 
- in #ReviewAppeal Component 
    - In Table Mapping 
    - Selected Score -> "Actual" 
    - 

- 
