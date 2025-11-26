/**
 * The `AppraisalCheckInForm` function is a React component that dynamically renders either the
 * QuarterlyCheckIn or AnnualCheckIn component based on the appraisal period.
 * @returns The `AppraisalCheckInForm` component is being returned. It dynamically renders either the
 * `QuarterlyCheckIn` or `AnnualCheckIn` component based on the `isQuarterlyFlow` state from the
 * `useAppraisalCheckIn` hook.
 */
import React from 'react';
import './AppraisalCheckInForm.css';
import { useAppraisalCheckIn } from './useAppraisalCheckIn';
import QuarterlyCheckIn from './QuarterlyCheckIn';
import AnnualCheckIn from './AnnualCheckIn';

/**
 * This is the main check-in form for the Appraisal Process.
 * It acts as a controller that loads the appropriate view based on the appraisal period.
 */
function AppraisalCheckInForm() {
  const {
    data,
    isLoading,
    isError,
    isQuarterlyFlow,
    context,
    roleState,
    formState,
    actions,
  } = useAppraisalCheckIn();

  const { financialYear, appraisalPeriod } = context;

  if (!financialYear || !appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div>No financial year or appraisal period found</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="alert alert-danger">
          Failed to load appraisal data. Please try again later.
        </div>
      </div>
    );
  }

  const commonProps = {
    data,
    isLoading,
    context,
    roleState,
    formState,
    actions,
  };

  return isQuarterlyFlow ? (
    <QuarterlyCheckIn {...commonProps} />
  ) : (
    <AnnualCheckIn {...commonProps} />
  );
}

export default AppraisalCheckInForm;