import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BackButton } from '../../../../components/common';
import { CheckInDescriptionSection } from '../../../../components/Appraisal';
import LoadingSpinner from '../../../../components/Spinner';
import { useReviewAppeal } from './useReviewAppeal';
import AppealReviewKRASection from './AppealReviewKRASection';
import './ReviewAppeal.css';

function ReviewAppeal() {
  const navigate = useNavigate();

  const { data, context, formState, actions, isValid, isLoading, isError, error } =
    useReviewAppeal();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const enabled = context.viewOnly ? false : true;
  // Handle submit with confirmation
  const handleSubmitClick = () => {
    if (!isValid) {
      toast.error('Please complete all required fields');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    try {
      const response = await actions.handleSubmit();
      setResponseData(response);
      setShowSuccessModal(true);
      toast.success('Appeal review submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate(-1);
  };

  // Prepare employee data for CheckInDescriptionSection
  const descriptionEmployee = useMemo(
    () => ({
      empNo: data?.employee?.empNo || context.empNo,
      employeeName: data?.employee?.employeeName || '-',
      branch: data?.employee?.branch || '-',
      primaryRole: data?.employee?.primaryRole || '-',
      appraiser: data?.employee?.appraiser || '-',
    }),
    [data, context.empNo]
  );

  const roleLabel =
    context.role === 'REVIEWER' ? 'Reviewing Authority' : 'Reporting Authority (Appraiser)';

  // Loading state
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '40vh' }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
          </div>
        </div>
        <div className="card shadow-sm p-3">
          <div className="alert alert-danger mb-0">
            <h5 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Error Loading Data
            </h5>
            <p className="mb-0">
              {error?.message || 'Failed to load appeal data. Please try again.'}
            </p>
            <hr />
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      {/* Header */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
        </div>
        <h5 className="text-muted fw-bold mb-0">FY {context.financialYear} · Annual Appraisal</h5>
      </div>

      <div className="pageWrapper-content d-flex flex-column gap-3">
        {/* Employee Information - CheckInDescriptionSection */}
        <CheckInDescriptionSection
          employee={descriptionEmployee}
          dateRange={data.dateRange || ''}
          showDownloadButton={!!data.fileUrl}
          onDownload={() => window.open(data.fileUrl, '_blank')}
        />

        {/* Role Info Banner */}
        <div className="alert alert-info d-flex align-items-center py-2 mb-0">
          <i className="bi bi-person-badge me-2"></i>
          You are reviewing as: <strong className="ms-1">{roleLabel}</strong>
        </div>

        {/* Final Score Summary */}
        {data.finalScoreSummary && data.finalScoreSummary.length > 0 && (
          <div className="card shadow-sm p-4">
            <h5 className="text-primary fw-bold mb-3">
              <i className="bi bi-bar-chart-fill me-2"></i>Final Score Summary
            </h5>
            <div className="table-responsive">
              <table className="table final-score-summary-appeal">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Select</th>
                    <th style={{ width: '180px' }}>Category</th>
                    <th style={{ width: '90px' }}>Roles</th>
                    <th style={{ width: '120px' }}>Actual</th>
                    <th style={{ width: '100px' }}>Weightage</th>
                    <th style={{ width: '100px' }}>Score</th>
                    <th style={{ width: '140px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.finalScoreSummary
                    .filter((row) => row.KraName == 'Business Dimension')

                    .map((row, idx) => {
                      const categoryId = `summary-${row.KraName}-${idx}`;
                      const isSelected = formState.selectedKras?.has(categoryId);
                      const action = formState.kraActions?.get(categoryId);
                      const score = formState.kraScores?.get(categoryId) || '';
                      const postAppealScore =
                        formState.postAppealScores?.get(categoryId) ?? row.PostAppealScore ?? '';

                      return (
                        <tr
                          key={idx}
                          className={row.KraName === 'Total Score' ? 'fw-bold' : ''}
                          style={{ backgroundColor: isSelected ? '#e3f2fd' : 'transparent' }}
                        >
                          {/* Select Checkbox */}
                          <td className="text-center align-middle" style={{ padding: '12px' }}>
                            {row.KraName !== 'Total Score' && (
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected || false}
                                onChange={() => actions.handleKraSelection(categoryId)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                disabled={!enabled}
                              />
                            )}
                          </td>

                          {/* Category */}
                          <td className="category-cell">{row.KraName}</td>

                          {/* Roles - 3 stacked rows */}
                          <td style={{ padding: 0 }}>
                            <div className="role-label-cell">Actual</div>
                            <div className="role-label-cell">Appraisee</div>
                            <div className="role-label-cell" style={{ borderBottom: 'none' }}>
                              Appellate
                            </div>
                          </td>

                          {/* Actual Values aligned with roles */}
                          <td style={{ padding: 0 }}>
                            <div className="role-value-cell">
                              <span
                                style={{
                                  borderBottom: '1px solid #dee2e6',
                                  display: 'inline-block',
                                  minWidth: '50px',
                                  padding: '2px 8px',
                                }}
                              >
                                {row.ReportingAuthorityScore ?? '-'}
                              </span>
                            </div>
                            <div className="role-value-cell">
                              <span
                                style={{
                                  borderBottom: '1px solid #dee2e6',
                                  display: 'inline-block',
                                  minWidth: '50px',
                                  padding: '2px 8px',
                                }}
                              >
                                {row.SelfScore ?? '-'}
                              </span>
                            </div>
                            <div className="role-value-cell" style={{ borderBottom: 'none' }}>
                              <input
                                type="text"
                                className="appeal-score-input appellate-input"
                                value={postAppealScore}
                                onChange={(e) =>
                                  actions.handlePostAppealScoreChange(categoryId, e.target.value)
                                }
                                readOnly={!(isSelected && action === 'ACCEPT_AND_EDIT')}
                                style={{ width: '60px' }}
                                min="0"
                                step="0.1"
                                placeholder="0.0"
                                disabled={!enabled}
                              />
                            </div>
                          </td>

                          {/* Weightage */}
                          <td className="text-center align-middle">{row.MaxScore ?? '-'}</td>

                          {/* Score - editable */}
                          <td className="text-center align-middle" style={{ padding: '8px' }}>
                            {isSelected && action === 'ACCEPT_AND_EDIT' ? (
                              <input
                                type="number"
                                className="appeal-score-input"
                                value={score}
                                onChange={(e) =>
                                  actions.handleScoreChange(categoryId, e.target.value)
                                }
                                min="0"
                                step="0.1"
                                placeholder="0.0"
                                disabled={!enabled}
                              />
                            ) : (
                              <input
                                type="text"
                                className="appeal-score-input"
                                value={
                                  row.AcceptingAuthorityScore ?? row.ReviewingAuthorityScore ?? ''
                                }
                                readOnly
                                style={{ backgroundColor: '#f8f9fa' }}
                                disabled={!enabled}
                              />
                            )}
                          </td>

                          {/* Action */}
                          <td className="action-cell align-middle" style={{ padding: '8px' }}>
                            {row.KraName !== 'Total Score' && isSelected ? (
                              <div className="action-options">
                                <label className="action-option">
                                  <input
                                    type="radio"
                                    name={`action-${categoryId}`}
                                    value="ACCEPT_AS_IS"
                                    checked={action === 'ACCEPT_AS_IS'}
                                    onChange={(e) =>
                                      actions.handleActionChange(categoryId, e.target.value)
                                    }
                                    disabled={!enabled}
                                  />
                                  <span className="action-label">ACCEPT AS IT IS</span>
                                </label>
                                <label className="action-option">
                                  <input
                                    type="radio"
                                    name={`action-${categoryId}`}
                                    value="ACCEPT_AND_EDIT"
                                    checked={action === 'ACCEPT_AND_EDIT'}
                                    onChange={(e) =>
                                      actions.handleActionChange(categoryId, e.target.value)
                                    }
                                    disabled={!enabled}
                                  />
                                  <span className="action-label">ACCEPT AND EDIT</span>
                                </label>
                                <label className="action-option">
                                  <input
                                    type="radio"
                                    name={`action-${categoryId}`}
                                    value="REJECT"
                                    checked={action === 'REJECT'}
                                    onChange={(e) =>
                                      actions.handleActionChange(categoryId, e.target.value)
                                    }
                                    disabled={!enabled}
                                  />
                                  <span className="action-label">REJECT</span>
                                </label>
                              </div>
                            ) : row.KraName !== 'Total Score' ? (
                              <span
                                className="select-prompt"
                                style={{ color: '#999', fontSize: '0.8rem', fontStyle: 'italic' }}
                              >
                                Select to review
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Discretionary Non-Measurable KRAs */}
        {data.nonMeasurableKras && data.nonMeasurableKras.length > 0 && (
          <div className="card shadow-sm p-4">
            <h5 className="text-primary fw-bold mb-3">
              <i className="bi bi-list-check me-2"></i>
              Discretionary Non-Measurable KRAs ({data.nonMeasurableKras.length})
            </h5>
            <AppealReviewKRASection
              kras={data.nonMeasurableKras}
              selectedKras={formState.selectedKras}
              kraActions={formState.kraActions}
              kraScores={formState.kraScores}
              kraComments={formState.kraComments}
              selectedScores={formState.selectedScores}
              onKraSelect={actions.handleKraSelection}
              onActionChange={actions.handleActionChange}
              onScoreChange={actions.handleScoreChange}
              onSelectedScoreChange={actions.handleSelectedScoreChange}
              onCommentChange={actions.handleCommentChange}
              type="non-measurable"
              disabled={!enabled}
            />
          </div>
        )}

        {/* Discretionary Measurable KRAs */}
        {data.measurableKras && data.measurableKras.length > 0 && (
          <div className="card shadow-sm p-4">
            <h5 className="text-primary fw-bold mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Discretionary Measurable KRAs ({data.measurableKras.length})
            </h5>
            <AppealReviewKRASection
              kras={data.measurableKras}
              selectedKras={formState.selectedKras}
              kraActions={formState.kraActions}
              kraScores={formState.kraScores}
              kraComments={formState.kraComments}
              selectedScores={formState.selectedScores}
              onKraSelect={actions.handleKraSelection}
              onActionChange={actions.handleActionChange}
              onScoreChange={actions.handleScoreChange}
              onSelectedScoreChange={actions.handleSelectedScoreChange}
              onCommentChange={actions.handleCommentChange}
              type="measurable"
              disabled={!enabled}
            />
          </div>
        )}

        {/* No KRAs Message */}
        {(!data.nonMeasurableKras || data.nonMeasurableKras.length === 0) &&
          (!data.measurableKras || data.measurableKras.length === 0) && (
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              No KRAs available for review.
            </div>
          )}

        {/* Selection Summary */}
        {formState.selectedKras.size > 0 && (
          <div className="alert alert-success d-flex align-items-center mb-0">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>{formState.selectedKras.size}</strong>&nbsp;KRA(s) selected for review
          </div>
        )}

        {/* Overall Comment */}
        <div className="card shadow-sm p-4">
          <h5 className="text-primary fw-bold mb-3">
            <i className="bi bi-chat-left-text me-2"></i>Overall Comment
          </h5>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Enter your overall comment for this appeal review..."
            value={formState.overallComment || data.member3Comment || ''}
            onChange={(e) => actions.handleOverallCommentChange(e.target.value)}
            disabled={!enabled}
          />
          {formState.overallComment.trim() === '' && formState.selectedKras.size > 0 && (
            <div className="text-danger small mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              Overall comment is required
            </div>
          )}
        </div>
      </div>

      {/* Submit Button - Outside main content wrapper */}
      <div className="d-flex justify-content-end gap-3 py-3">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmitClick}
          disabled={!isValid || actions.isSubmitting || !enabled}
        >
          {actions.isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Submitting...
            </>
          ) : (
            <>
              <i className="bi bi-send-fill me-2"></i>
              Submit Review
            </>
          )}
        </button>
      </div>
      {!isValid && (
        <div className="text-muted small text-end mb-3">
          <i className="bi bi-info-circle me-1"></i>
          Select KRAs, choose actions, and add overall comment to submit
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-question-circle text-warning me-2"></i>
                  Confirm Submission
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to submit this appeal review?</p>
                <p className="text-muted small">
                  You have reviewed <strong>{formState.selectedKras.size}</strong> KRA(s).
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleConfirmSubmit}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4">
              <div className="mb-3">
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: '4rem' }}
                ></i>
              </div>
              <h4 className="text-primary mb-3">Review Submitted Successfully!</h4>
              {responseData?.ticketId && (
                <p className="mb-3">
                  <strong>Ticket ID:</strong> {responseData.ticketId}
                </p>
              )}
              <p className="text-muted">
                The appeal review has been recorded and the employee will be notified.
              </p>
              <button className="btn btn-primary mt-3" onClick={handleSuccessClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewAppeal;
