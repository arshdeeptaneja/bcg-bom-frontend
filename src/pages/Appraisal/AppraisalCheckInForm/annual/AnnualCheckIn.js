import React, { useState } from 'react';
import { BackButton } from '../../../../components/common';
import LoadingSpinner from '../../../../components/Spinner';
import {
  CheckInSummaryTable,
  FinalScoreSummaryTable,
  CheckInDescriptionSection,
  MeasurableKra,
} from '../../../../components/Appraisal';
import { useAnnualAppraisal } from './useAnnualAppraisal';
import './AnnualCheckIn.css';

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

  const { employee, dateRange, metadata } = context;
  const { currentRole, isEditableBy, handleRoleChange } = roleState;
  const { 
    nonMeasurableScores, 
    developmentResponses, 
    optionResponses 
  } = formState;
  const { 
    handleSubmit, 
    handleNonMeasurableScoreChange,
    handleNonMeasurableCommentChange,
    handleDevelopmentInputChange,
    handleOptionChange,
    isSubmitting 
  } = actions;

  // Track which KRA comment sections are open
  const [openComments, setOpenComments] = useState({});

  const toggleComment = (kraId) => {
    setOpenComments((prev) => ({
      ...prev,
      [kraId]: !prev[kraId],
    }));
  };
  console.log('hey annual data:', data);

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
            
            {/* Measurable KRAs */}
            {measurableKraListData.length > 0 && (
              <div className="discretionary-kra-list">
                <MeasurableKra
                  totalActualScore={totalMeasurableActual}
                  totalMaxScore={totalMeasurableMax}
                  kraListData={measurableKraListData}
                />
              </div>
            )}
            
            {/* Non-Measurable KRAs - Grouped by GROUP_NAME */}
            {Object.keys(nonMeasurableKraListData).length > 0 && (
              <div className="non-measurable-kra-section">
                <div className="d-flex flex-row justify-content-between mb-3">
                  <h6 className="fw-bold">Non-Measurable</h6>
                  <div className="d-flex flex-row gap-2">
                    <span className="text-muted">Discretionary Non-Measurable Score:</span>
                    <span className="fw-bold">
                      {totalNonMeasurableActual.toFixed(1)} / {totalNonMeasurableMax.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Header Bar */}
                <div className="annual-kra-header-bar p-3 d-flex flex-row justify-content-between fw-bold bg-primary text-white rounded-top">
                  <span className="text-start" style={{ width: '50%' }}>
                    Non-Measurable KRA
                  </span>
                  <span className="text-center" style={{ width: '30%' }}>
                    Select Score
                  </span>
                  <span className="text-center" style={{ width: '10%' }}>
                    Final Score
                  </span>
                  <span className="text-end" style={{ width: '10%' }}>
                    Comments
                  </span>
                </div>

                {/* KRA Groups */}
                {Object.entries(nonMeasurableKraListData).map(([groupName, kraList]) => (
                  <div key={groupName} className="kra-group mb-3">
                    {/* Group Header */}
                    <div className="kra-group-header px-3 py-2 bg-success bg-opacity-10 border-start border-success border-4">
                      <h6 className="fw-semibold mb-0 text-success">{groupName}</h6>
                    </div>

                    {/* KRA Items */}
                    <table className="table table-borderless mb-0">
                      <tbody>
                        {kraList.map((kra, index) => {
                          const kraId = kra.KraId;
                          const kraScore = nonMeasurableScores[kraId] || {};
                          const selectedScore = kraScore.score || null;
                          const isOpen = openComments[kraId] ?? false;
                          const isAppraiseeEditable = isEditableBy.APPRAISEE && kra.IsEditable !== false;

                          return (
                            <React.Fragment key={kraId}>
                              <tr className="kra-row">
                                {/* KRA Name & Description */}
                                <td style={{ width: '50%' }}>
                                  <div className="d-flex flex-column gap-1">
                                    <div className="d-flex align-items-center gap-1">
                                      <span className="fw-bold">
                                        {index + 1}. {kra.KraName}
                                      </span>
                                      <span className="text-danger">*</span>
                                      {kra.Tooltip && (
                                        <i 
                                          className="bi bi-info-circle text-primary" 
                                          title={kra.Tooltip}
                                        ></i>
                                      )}
                                    </div>
                                    <div className="text-primary small fst-italic">
                                      {kra.KraDescription}
                                    </div>
                                  </div>
                                </td>

                                {/* Score Selector (1-5 buttons) */}
                                <td style={{ width: '30%' }}>
                                  <div className="d-flex gap-2 justify-content-center">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                      <button
                                        key={score}
                                        type="button"
                                        className={`annual-score-btn ${
                                          selectedScore === score
                                            ? 'annual-score-btn-selected'
                                            : 'annual-score-btn-outline'
                                        }`}
                                        onClick={() => handleNonMeasurableScoreChange(kraId, score)}
                                        disabled={!isAppraiseeEditable}
                                      >
                                        {score}
                                      </button>
                                    ))}
                                  </div>
                                </td>

                                {/* Final Score Display */}
                                <td style={{ width: '10%' }}>
                                  <div className="final-score-box border border-primary rounded px-2 py-1 text-center">
                                    {selectedScore || '-'}
                                  </div>
                                </td>

                                {/* Comments Toggle */}
                                <td className="text-center" style={{ width: '10%' }}>
                                  <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={() => toggleComment(kraId)}
                                    aria-label="Toggle comment"
                                  >
                                    <i className={`bi bi-chat-left-text-fill ${
                                      kraScore.comment ? 'text-success' : 'text-primary'
                                    }`}></i>
                                  </button>
                                </td>
                              </tr>

                              {/* Comment Section (Collapsible) */}
                              {isOpen && (
                                <tr className="comment-row">
                                  <td colSpan={4}>
                                    <div className="px-4 py-3 bg-light rounded">
                                      <label className="fw-semibold text-muted mb-2">
                                        Appraisee Comment:
                                      </label>
                                      <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="Enter Your Comment"
                                        value={kraScore.comment || ''}
                                        onChange={(e) => 
                                          handleNonMeasurableCommentChange(kraId, e.target.value, 'APPRAISEE')
                                        }
                                        disabled={!isAppraiseeEditable}
                                      />
                                      
                                      {/* Show appraiser/reviewer comments if available */}
                                      {(kraScore.appraiserComment || currentRole !== 'APPRAISEE') && (
                                        <div className="mt-3">
                                          <label className="fw-semibold text-muted mb-2">
                                            Appraiser Comment:
                                          </label>
                                          {isEditableBy.APPRAISER ? (
                                            <textarea
                                              className="form-control"
                                              rows={2}
                                              placeholder="Enter Appraiser Comment"
                                              value={kraScore.appraiserComment || ''}
                                              onChange={(e) => 
                                                handleNonMeasurableCommentChange(kraId, e.target.value, 'APPRAISER')
                                              }
                                            />
                                          ) : (
                                            <p className="mb-0 text-muted">
                                              {kraScore.appraiserComment || 'None'}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      
                                      {(kraScore.reviewerComment || currentRole === 'REVIEWER') && (
                                        <div className="mt-3">
                                          <label className="fw-semibold text-muted mb-2">
                                            Reviewer Comment:
                                          </label>
                                          {isEditableBy.REVIEWER ? (
                                            <textarea
                                              className="form-control"
                                              rows={2}
                                              placeholder="Enter Reviewer Comment"
                                              value={kraScore.reviewerComment || ''}
                                              onChange={(e) => 
                                                handleNonMeasurableCommentChange(kraId, e.target.value, 'REVIEWER')
                                              }
                                            />
                                          ) : (
                                            <p className="mb-0 text-muted">
                                              {kraScore.reviewerComment || 'None'}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Development Inputs Section - Overall Development (Appraisee) */}
        {developmentInputs.overallDevelopment?.length > 0 && (
          <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Development Inputs - Overall Development</h5>
            {developmentInputs.overallDevelopment.map((input, index) => (
              <div className="mb-3" key={input.id}>
                <label className="form-label fw-bold text-dark">
                  {index + 1}. {input.question} <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter Your Response"
                  value={developmentResponses[input.id]?.response || ''}
                  onChange={(e) => handleDevelopmentInputChange(input.id, e.target.value, 'response')}
                  disabled={!isEditableBy.APPRAISEE}
                />
              </div>
            ))}
          </div>
        )}

        {/* Development Inputs Section - Reporting/Reviewing Authority */}
        {developmentInputs.reportingReviewAuthority?.length > 0 && (
          <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">
              Remarks by Reporting Authority / Reviewing Authority
            </h5>
            <p className="text-muted small mb-3">
              {metadata?.reportingAuthorityName && (
                <span>Reporting Authority: <strong>{metadata.reportingAuthorityName}</strong></span>
              )}
              {metadata?.reviewingAuthorityName && (
                <span className="ms-3">Reviewing Authority: <strong>{metadata.reviewingAuthorityName}</strong></span>
              )}
            </p>
            {developmentInputs.reportingReviewAuthority.map((input, index) => (
              <div className="mb-3" key={input.id}>
                <label className="form-label fw-bold text-dark">
                  {index + 1}. {input.question}
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter Response"
                  value={developmentResponses[input.id]?.response || ''}
                  onChange={(e) => handleDevelopmentInputChange(input.id, e.target.value, 'response')}
                  disabled={!isEditableBy.APPRAISER && !isEditableBy.REVIEWER}
                />
              </div>
            ))}
          </div>
        )}

        {/* Option-Based Inputs Section */}
        {developmentInputs.optionBased?.length > 0 && (
          <div className="option-based-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Additional Information</h5>
            {developmentInputs.optionBased.map((input) => (
              <div className="mb-3" key={input.id}>
                <label className="form-label fw-bold text-dark">
                  {input.question}
                </label>
                <div className="d-flex flex-wrap gap-3">
                  {input.options.map((option) => (
                    <div className="form-check" key={option.value}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`option-${input.id}`}
                        id={`option-${input.id}-${option.value}`}
                        value={option.value}
                        checked={optionResponses[input.key] === option.value}
                        onChange={() => handleOptionChange(input.key, option.value)}
                        disabled={
                          (input.editableBy === 'APPRAISEE' && !isEditableBy.APPRAISEE) ||
                          (input.editableBy === 'APPRAISER_REVIEWER' && !isEditableBy.APPRAISER && !isEditableBy.REVIEWER)
                        }
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`option-${input.id}-${option.value}`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Show details textarea for Yes/No questions when Yes is selected */}
                {(input.key === 'healthProblems' && optionResponses.healthProblems === 'yes') && (
                  <div className="mt-2">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Please provide details"
                      value={optionResponses.healthDetails || ''}
                      onChange={(e) => handleOptionChange('healthDetails', e.target.value)}
                      disabled={!isEditableBy.APPRAISEE}
                    />
                  </div>
                )}
                {(input.key === 'disciplinaryActions' && optionResponses.disciplinaryActions === 'yes') && (
                  <div className="mt-2">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Please provide details"
                      value={optionResponses.disciplinaryDetails || ''}
                      onChange={(e) => handleOptionChange('disciplinaryDetails', e.target.value)}
                      disabled={!isEditableBy.APPRAISEE}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
