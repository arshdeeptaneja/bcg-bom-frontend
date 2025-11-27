/**
 * The `EmployeeQuarterlyException` function in JavaScript is used to review and validate quarterly
 * exceptions for employees, displaying relevant data and allowing for submission of validation.
 * @param fy - The `fy` parameter in the code refers to the financial year. It is used to specify the
 * financial year for which the data is being processed or displayed. The financial year typically
 * consists of a start date and an end date and is commonly used in financial and accounting contexts
 * to organize and report financial information
 * @returns The `EmployeeQuarterlyException` component is being returned. It contains JSX elements for
 * rendering a page where a user can review quarterly exceptions, view employee details, download
 * attachments, review and submit KRAs, and provide comments. The component handles data fetching,
 * mutation, and state management related to the review process.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckInDescriptionSection } from '../../../components/Appraisal';
import KraTable from '../ExceptionReview/KraTable';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { useExceptionValidator } from '../shared/hooks/useExceptionValidator';

function EmployeeQuarterlyException() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getEmployeeDetails, getUserProperty } = useAuth();

  const employeeDetails = getEmployeeDetails();
  const loggedInEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.EMP_ID || '');
  const roleName = getUserProperty('ROLE_NAME', employeeDetails?.currentUser?.ROLE_NAME || '');
  const zone = getUserProperty('ZNNAME', employeeDetails?.currentUser?.ZONE_NAME || '');

  const fallbackEmployee = useMemo(
    () => ({
      empNo: loggedInEmpNo,
      employeeName: employeeDetails?.currentUser?.EMP_NAME || 'Employee Name',
      branch: employeeDetails?.currentUser?.BRANCH_NAME || 'Branch',
      primaryRole: employeeDetails?.currentUser?.PRIMARY_ROLE || 'Primary Role',
      appraiser: employeeDetails?.currentUser?.APPRAISER_NAME || 'Appraiser Name',
      validator: employeeDetails?.currentUser?.VALIDATOR_NAME || '',
      roles: employeeDetails?.currentUser?.roles || [],
    }),
    [employeeDetails, loggedInEmpNo]
  );

  const {
    financialYear = 'FY 2024-25',
    appraisalPeriod = 'Quarterly',
    quarter = 'Q1',
    dateRange,
    employee = fallbackEmployee,
    role = 'VALIDATOR',
    roleId,
    custTicketId,
    exceptionId,
    urlId,
  } = location.state || {};

  const validatorEmployee = employee || fallbackEmployee;
  const reviewEmpNo = validatorEmployee?.empNo || loggedInEmpNo;
  const validatorRoleName = roleName || role || 'VALIDATOR';
  const validatorZone =
    zone || validatorEmployee?.zone || employeeDetails?.currentUser?.ZONE_NAME || '';

  // Use custom hook for all business logic
  const {
    kraRows,
    selectedRows,
    scoreData,
    enrichedEmployee,
    derivedDateRange,
    isLoading,
    isSubmitting,
    handleRowChange,
    handleSubmit,
    handleDownload,
  } = useExceptionValidator({
    empNo: loggedInEmpNo,
    quarter,
    financialYear,
    roleName: validatorRoleName,
    roleId,
    zone: validatorZone,
    custTicketId: custTicketId || exceptionId,
    urlId: employee.url,
    dateRange,
    onSuccess: () => navigate(-1),
  });

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Review Quarterly Exception
            </h1>
          </div>
        </div>
        <div
          className="pageWrapper-content d-flex justify-content-center align-items-center"
          style={{ minHeight: '400px' }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Review Quarterly Exception
          </h1>
        </div>
      </div>

      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection
          employee={{
            ...validatorEmployee,
            ...enrichedEmployee,
          }}
          dateRange={derivedDateRange}
          showDownloadButton
          onDownload={handleDownload}
        />

        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please review the corrected actuals, targets, and comments before submitting the
            validation.
          </span>
        </div>

        {/* Score Summary Section */}
        {scoreData.hasScores && (
          <div className="d-flex justify-content-between align-items-center mx-4">
            <h5 className="text-primary fw-bold mb-0">Non-discretionary Score</h5>
            <div className="d-flex flex-column gap-3">
              <span className="text-muted">
                Old Score:{' '}
                <span className="fw-bold text-dark">
                  {scoreData.oldScore}/{scoreData.maxScoreTotal}
                </span>
              </span>
              <span className="text-success">
                New Score:{' '}
                <span className="fw-bold">
                  {scoreData.newScore}/{scoreData.maxScoreTotal}
                </span>
              </span>
            </div>
          </div>
        )}

        <KraTable
          rows={kraRows}
          onRowChange={handleRowChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default EmployeeQuarterlyException;
