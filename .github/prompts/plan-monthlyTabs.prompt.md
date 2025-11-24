## Plan: Monthly Tabs & Buckets

Add full month-tab behavior to `QuarterlyCheckIn` so both measurable and non-measurable KRAs are sourced from `krasByMonth`, aligned to the April fiscal start. Keep score summaries cumulative while the per-tab grids show only the active month’s entries. Update the transformer to bucket all KRAs by month, ensuring the UI can render and edit month-specific data without refiltering each render.

### Steps
1. Update `transformQuarterlyAppraisalData` (`src/pages/Appraisal/AppraisalCheckInForm/appraisalTransformers.js`) so `krasByMonth` becomes `{ [monthNumber]: { measurable: [], nonMeasurable: [] } }`, storing month labels plus existing flat lists for backward compatibility.
2. Introduce a `getQuarterMonths(context.quarter)` helper in `QuarterlyCheckIn.js` that returns ordered month numbers/names for FY quarters (Q1=>Apr-Jun, Q2=>Jul-Sep, etc.) and derive `defaultActiveMonth` from today or the quarter’s first month.
3. Add `useState` for `activeMonth` in `QuarterlyCheckIn`, render Bootstrap-style `.month-tabs` buttons (reuse `QuaterMeasurableKra.css` rules) and toggle state on click.
4. Compute `measurableForMonth`/`nonMeasurableForMonth` from `data.krasByMonth[activeMonth]` with empty-state messaging; pass them to `MeasurableKra`/`NonMeasurableKra` while totals, summary tables, and validation copy remain quarter-wide.
5. Ensure `formState` handlers (`handleKraChange`, section comments, save/submit payload builders in `useAppraisalCheckIn.js`) can reconcile edits captured per month back into the cumulative payload so appraisee/appraiser roles keep current functionality.

### Further Considerations
1. Confirm quarter/month mapping edge cases (`Q4` spans two calendar years) before coding helper logic.
2. Decide whether monthly empty states should mention raising exceptions or stay neutral to match legacy tone.
