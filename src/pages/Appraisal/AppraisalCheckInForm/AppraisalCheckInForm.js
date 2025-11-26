/**
 * The `AppraisalCheckInForm` function is a React component that dynamically renders either the
 * QuarterlyCheckIn or AnnualCheckIn component based on the appraisal period.
 * @returns The `AppraisalCheckInForm` component is being returned. It dynamically renders either the
 * `QuarterlyCheckIn` or `AnnualCheckIn` component based on the `isQuarterlyFlow` state from the
 * `useAppraisalCheckIn` hook.
 */
import React from 'react';
import './AppraisalCheckInForm.css';
import { useAppraisalContext } from './useAppraisalContext';
import { QuarterlyCheckIn } from './quarterly';
import { AnnualCheckIn } from './annual';

/**
 * This is the main check-in form for the Appraisal Process.
 * It acts as a thin controller that routes to the appropriate flow-specific component.
 * Each child component (QuarterlyCheckIn, AnnualCheckIn) is now self-contained
 * with its own dedicated hook.
 */
function AppraisalCheckInForm() {
  const { financialYear, appraisalPeriod, isQuarterlyFlow, isContextValid } = useAppraisalContext();

  if (!isContextValid || !financialYear || !appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div>No financial year or appraisal period found</div>
      </div>
    );
  }

  // Route to the appropriate flow-specific component
  // Each component uses its own dedicated hook internally
  return isQuarterlyFlow ? <QuarterlyCheckIn /> : <AnnualCheckIn />;
}

export default AppraisalCheckInForm;