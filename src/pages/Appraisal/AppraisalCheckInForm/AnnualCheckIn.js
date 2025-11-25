import React from 'react';
import { BackButton } from '../../../components/common';
import LoadingSpinner from '../../../components/Spinner';
import {
  CheckInSummaryTable,
  FinalScoreSummaryTable,
  CheckInDescriptionSection,
  MeasurableKra,
  NonMeasurableKra,
  DevelopmentInputs,
} from '../../../components/Appraisal';
import { useAnnualAppraisal } from './useAnnualAppraisal';

const AnnualCheckIn = () => {
  // Use the annual-specific hook directly
  const {
    data,
    developmentInputs,
    isLoading,
    isError,
    context,
    roleState,
    formState,
    actions,
  } = useAnnualAppraisal();

  const { employee, dateRange } = context;
  const { currentRole, isEditableBy, handleRoleChange } = roleState;
  const { handleSubmit, handleDevelopmentInputChange, isSubmitting } = actions;

  // Use API data or fallback to empty/mock data
  const kraData = data?.finalScoreSummary || [];
  const measurableKraListData = data?.measurableKras || [];
  const nonMeasurableKraListData = data?.nonMeasurableKras || {};
  const actualScoreData = data?.monthlyScoreSummary?.actualScoreData || {};
  const maxScoreData = data?.monthlyScoreSummary?.maxScoreData || {};
  const totalMeasurableActual = data?.totalMeasurableActual || 0;
  const totalMeasurableMax = data?.totalMeasurableMax || 0;
  const totalNonMeasurableActual = data?.totalNonMeasurableActual || 0;
  const totalNonMeasurableMax = data?.totalNonMeasurableMax || 0;
  const validationMessage = data?.validationMessage || '';

  // Handle missing context
  if (!context.financialYear || !context.appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div>No financial year or appraisal period found</div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="alert alert-danger">
          Failed to load annual appraisal data. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Annual Appraisal
            </h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Annual Appraisal
          </h1>
        </div>
        <div className="d-flex flex-row align-items-center">
          <label htmlFor="roleSelect" className="me-2 text-muted fw-bold">
            Role:
          </label>
          <select
            id="roleSelect"
            value={currentRole}
            onChange={handleRoleChange}
            className="form-select form-select-sm"
            style={{ width: '180px' }}
          >
            <option value="APPRAISEE">Appraisee (Self)</option>
            <option value="APPRAISER">Appraiser (Level 1)</option>
            <option value="REVIEWER">Reviewer (Final)</option>
          </select>
        </div>
      </div>
      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />
        {validationMessage && (
          <div className="alert alert-info mt-3" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            {validationMessage}
          </div>
        )}
        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please raise an exception if actual or target values are incorrect.
          </span>
        </div>
        <div className="final-score-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Final Score Summary</h5>
          <FinalScoreSummaryTable kraListData={kraData} />
        </div>
        {Object.keys(actualScoreData).length > 0 && (
          <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Monthly Score Summary</h5>
            <CheckInSummaryTable
              actualScoreData={actualScoreData}
              maxScoreData={maxScoreData}
              className="mt-5"
            />
          </div>
        )}
        {(measurableKraListData.length > 0 ||
          Object.keys(nonMeasurableKraListData).length > 0) && (
          <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Discretionary KRA</h5>
            {measurableKraListData.length > 0 && (
              <div className="discretionary-kra-list">
                <MeasurableKra
                  totalActualScore={totalMeasurableActual}
                  totalMaxScore={totalMeasurableMax}
                  kraListData={measurableKraListData}
                />
              </div>
            )}
            {Object.keys(nonMeasurableKraListData).length > 0 && (
              <NonMeasurableKra
                totalActualScore={totalNonMeasurableActual}
                totalMaxScore={totalNonMeasurableMax}
                kraListData={nonMeasurableKraListData}
              />
            )}
          </div>
        )}
        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          {developmentInputs.length > 0 ? (
            developmentInputs.map((input, index) => (
              <div className="mb-3" key={input.id}>
                <label className="form-label fw-bold text-dark">
                  {index + 1}. {input.question} <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter Your Response"
                  value={formState.formData.sectionComments?.[input.key] || ''}
                  onChange={(e) => handleDevelopmentInputChange(input.key, e.target.value)}
                  disabled={!isEditableBy.APPRAISEE}
                />
              </div>
            ))
          ) : (
            <DevelopmentInputs
              questions={[]}
              role={currentRole}
              isEditableBy={isEditableBy}
            />
          )}
        </div>
      </div>
      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default AnnualCheckIn;
