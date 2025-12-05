import React, { useState } from 'react';
import { BackButton } from '../../../../components/common';
import LoadingSpinner from '../../../../components/Spinner';
import {
  FinalScoreSummaryTable,
  CheckInDescriptionSection,
} from '../../../../components/Appraisal';
import { useAnnualAppraisalReview } from './useAnnualAppraisalReview';
import './AnnualCheckIn.css';

/**
 * Annual Appraisal Review Component (Appraiser/Reviewer)
 *
 * Displays appraisee's self-appraisal data (read-only) with editable fields for:
 * - Appraiser scores (1-5) for each Non-Measurable KRA
 * - Appraiser comments for each KRA
 * - Reporting Authority questions (IDs 12-18)
 * - Integrity assessment
 */
const AnnualAppraisalReview = () => {
  const { data, developmentInputs, isLoading, isError, context, formState, actions } =
    useAnnualAppraisalReview();

  const { employee, dateRange, metadata ,task} = context;
  const {
    appraiserScores,
    appraiserDevResponses,
    appraiserOptionResponses,
    selfDevResponses,
    selfOptionResponses,
  } = formState;
  const {
    handleSubmit,
    handleAppraiserScoreChange,
    handleAppraiserCommentChange,
    handleAppraiserDevInputChange,
    handleAppraiserOptionChange,
    handleSelfDevInputChange,
    handleSelfOptionChange,
    isSubmitting,
  } = actions;

  // Track which KRA comment sections are open
  const [openComments, setOpenComments] = useState({});

  const toggleComment = (kraId) => {
    setOpenComments((prev) => ({
      ...prev,
      [kraId]: !prev[kraId],
    }));
  };

  // Extract data from transformed response
  const kraData = data?.finalScoreSummary || [];
  const nonMeasurableKraListData = data?.nonMeasurableKras || {};
  const totalNonMeasurableActual = data?.totalNonMeasurableActual || 0;
  const totalNonMeasurableMax = data?.totalNonMeasurableMax || 0;
  console.log('Task in AnnualAppraisalReview :', task);
  const enabled = (task === 'view') ? false : true;

  // Handle missing context
  if (!context.financialYear || !context.appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No financial year or appraisal period found. Please navigate from the dashboard.
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="alert alert-danger">
          <i className="bi bi-x-circle me-2"></i>
          Failed to load reportee appraisal data. Please try again later.
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Annual Appraisal</h1>
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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Annual Appraisal</h1>
        </div>
      </div>

      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        {/* Employee Info Section */}
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />

        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please raise an appeal if actual or target values are incorrect.
          </span>
        </div>

        {/* Final Score Summary (Read-only) */}
        <div className="final-score-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Final Score Summary</h5>
          <FinalScoreSummaryTable kraListData={kraData}  viewType={"repa"}/>
        </div>

        {/* Non-Measurable KRAs with Appraiser Scoring */}
        {Object.keys(nonMeasurableKraListData).length > 0 && (
          <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Discretionary KRA</h5>

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
                        const appraiserInput = appraiserScores[kraId] || {};
                        const appraiseeScore = kra.Actual || kra.Score || null;
                        const appraiserScore = appraiserInput.score || null;
                        const isOpen = openComments[kraId] ?? false;

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
                                        appraiserScore === score
                                          ? 'annual-score-btn-selected'
                                          : 'annual-score-btn-outline'
                                      }`}
                                      onClick={() => handleAppraiserScoreChange(kraId, score)}
                                      disabled={!enabled}
                                    >
                                      {score}
                                    </button>
                                  ))}
                                </div>
                              </td>

                              {/* Final Score Display */}
                              <td style={{ width: '10%' }}>
                                <div className="final-score-box border border-primary rounded px-2 py-1 text-center">
                                  {appraiserScore || appraiseeScore || '-'}
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
                                  <i
                                    className={`bi bi-chat-left-text-fill ${
                                      appraiserInput.comment ? 'text-success' : 'text-primary'
                                    }`}
                                  ></i>
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
                                    <div className="p-2 bg-white rounded border mb-3">
                                      {kra.CommentSelf1 || (
                                        <span className="text-muted">No comment provided</span>
                                      )}
                                    </div>

                                    <div className="mt-3">
                                      <label className="fw-semibold text-muted mb-2">
                                        Appraiser Comment:
                                      </label>
                                      <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="Enter Appraiser Comment"
                                        value={appraiserInput.comment || ''}
                                        onChange={(e) =>
                                          handleAppraiserCommentChange(kraId, e.target.value)
                                        }
                                      />
                                    </div>
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
          </div>
        )}

        {/* Development Inputs Section - Overall Development (Appraisee) */}
        {developmentInputs.overallDevelopment?.length > 0 && (
          <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Development Inputs - Overall Development</h5>
            {developmentInputs.overallDevelopment.map((input, index) => {
              const selfInput = selfDevResponses[input.id] || {};
              return (
                <div className="mb-3" key={input.id}>
                  <label className="form-label fw-bold text-dark">
                    {index + 1}. {input.question} <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control mb-2"
                    rows={3}
                    placeholder="Enter Response"
                    value={selfInput.response ?? input.selfResponse ?? ''}
                    onChange={(e) => handleSelfDevInputChange(input.id, 'response', e.target.value)}
                    disabled={true}
                  />
                  {(input.selfResponse2 || selfInput.response2) && (
                    <div className="mt-2">
                      <label className="form-label text-muted">Additional Response:</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Enter Additional Response"
                        value={selfInput.response2 ?? input.selfResponse2 ?? ''}
                        onChange={(e) =>
                          handleSelfDevInputChange(input.id, 'response2', e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
                <span>
                  Reporting Authority: <strong>{metadata.reportingAuthorityName}</strong>
                </span>
              )}
              {metadata?.reviewingAuthorityName && (
                <span className="ms-3">
                  Reviewing Authority: <strong>{metadata.reviewingAuthorityName}</strong>
                </span>
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
                  value={appraiserDevResponses[input.id] || ''}
                  onChange={(e) => handleAppraiserDevInputChange(input.id, e.target.value)}
                  disabled={!enabled}
                />
              </div>
            ))}
          </div>
        )}

        {/* Option-Based Inputs Section */}
        {developmentInputs.optionBased?.length > 0 && (
          <div className="option-based-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Additional Information</h5>
            {developmentInputs.optionBased.map((input) => {
              // Determine which state and handler to use based on the input key
              const isAppraiserField = true; // input.key === 'integrity';
              const currentValue = isAppraiserField
                ? appraiserOptionResponses[input.key]
                : selfOptionResponses[input.key] ?? input.selfResponse?.toLowerCase();
              const handleChange = isAppraiserField
                ? (value) => handleAppraiserOptionChange(input.key, value)
                : (value) => handleSelfOptionChange(input.key, value);

              return (
                <div className="mb-3" key={input.id}>
                  <label className="form-label fw-bold text-dark">{input.question}</label>
                  <div className="d-flex flex-wrap gap-3">
                    {input.options.map((option) => (
                      <div className="form-check" key={option.value}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`option-${input.id}`}
                          id={`option-${input.id}-${option.value}`}
                          value={option.value}
                          checked={currentValue === option.value}
                          onChange={() => handleChange(option.value)}
                          disabled={!enabled}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(enabled)?<div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>:null}
    </div>
  );
};

export default AnnualAppraisalReview;
