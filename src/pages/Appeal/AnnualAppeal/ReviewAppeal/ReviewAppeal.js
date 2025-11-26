import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BackButton } from '../../../../components/common';
import { useReviewAppeal } from './useReviewAppeal';
import AppealReviewKRASection from './AppealReviewKRASection';
import './ReviewAppeal.css';

function ReviewAppeal() {
  const navigate = useNavigate();

  const {
    data,
    context,
    formState,
    actions,
    isValid,
    isLoading,
    isError,
    error
  } = useReviewAppeal();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [responseData, setResponseData] = useState(null);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="mt-3 text-muted">Loading appeal review data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
          </div>
        </div>
        <div className="pageWrapper-content m-3">
          <div className="alert alert-danger">
            <h5 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Error Loading Data
            </h5>
            <p className="mb-0">{error?.message || 'Failed to load appeal data. Please try again.'}</p>
            <hr />
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = context.role === 'REVIEWER' ? 'Reviewing Authority' : 'Reporting Authority (Appraiser)';

  return (
    <div className="pageWrapper review-appeal-container">
      {/* Header */}
      <div className="pageWrapper-header review-appeal-header">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary">FY {context.financialYear}</span>
          <span className="badge bg-success">Annual Appraisal</span>
        </div>
      </div>

      <div className="pageWrapper-content review-appeal-content">
        {/* Role Info Banner */}
        <div className="role-info-banner mb-4">
          <i className="bi bi-person-badge me-2"></i>
          You are reviewing as: <strong>{roleLabel}</strong>
        </div>

        {/* Employee Information */}
        <div className="appeal-section mb-4">
          <h5 className="section-title">
            <i className="bi bi-person-fill me-2"></i>Employee Information
          </h5>
          <div className="employee-info-card">
            <div className="row">
              <div className="col-md-4">
                <div className="info-item">
                  <span className="info-label">Employee No:</span>
                  <span className="info-value">{data.employee.empNo || context.empNo}</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{data.employee.employeeName || '-'}</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="info-item">
                  <span className="info-label">Branch:</span>
                  <span className="info-value">{data.employee.branch || '-'}</span>
                </div>
              </div>
            </div>
            {data.dateRange && (
              <div className="row mt-2">
                <div className="col-12">
                  <div className="info-item">
                    <span className="info-label">Appraisal Period:</span>
                    <span className="info-value">{data.dateRange}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Score Summary */}
        {data.finalScoreSummary && data.finalScoreSummary.length > 0 && (
          <div className="appeal-section mb-4">
            <h5 className="section-title">
              <i className="bi bi-bar-chart-fill me-2"></i>Final Score Summary
            </h5>
            <div className="table-responsive">
              <table className="table table-bordered score-summary-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-center">Max Score</th>
                    <th className="text-center">Self Score</th>
                    <th className="text-center">Reporting Authority</th>
                    <th className="text-center">Reviewing Authority</th>
                    <th className="text-center">Accepting Authority</th>
                    <th className="text-center">Post Appeal Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.finalScoreSummary.map((row, idx) => (
                    <tr key={idx} className={row.KraName === 'Total Score' ? 'fw-bold table-secondary' : ''}>
                      <td>{row.KraName}</td>
                      <td className="text-center">{row.MaxScore ?? '-'}</td>
                      <td className="text-center">{row.SelfScore ?? '-'}</td>
                      <td className="text-center">{row.ReportingAuthorityScore ?? '-'}</td>
                      <td className="text-center">{row.ReviewingAuthorityScore ?? '-'}</td>
                      <td className="text-center">{row.AcceptingAuthorityScore ?? '-'}</td>
                      <td className="text-center">{row.PostAppealScore ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* File Download Section */}
        {data.fileUrl && (
          <div className="appeal-section mb-4">
            <h5 className="section-title">
              <i className="bi bi-file-earmark-pdf me-2"></i>Supporting Document
            </h5>
            <div className="file-download-card">
              <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                <i className="bi bi-download me-2"></i>Download Attachment
              </a>
            </div>
          </div>
        )}

        {/* Discretionary Non-Measurable KRAs */}
        {data.nonMeasurableKras && data.nonMeasurableKras.length > 0 && (
          <div className="appeal-section mb-4">
            <h5 className="section-title">
              <i className="bi bi-list-check me-2"></i>
              Discretionary Non-Measurable KRAs ({data.nonMeasurableKras.length})
            </h5>
            <AppealReviewKRASection
              kras={data.nonMeasurableKras}
              selectedKras={formState.selectedKras}
              kraActions={formState.kraActions}
              kraScores={formState.kraScores}
              kraComments={formState.kraComments}
              onKraSelect={actions.handleKraSelection}
              onActionChange={actions.handleActionChange}
              onScoreChange={actions.handleScoreChange}
              onCommentChange={actions.handleCommentChange}
              type="non-measurable"
            />
          </div>
        )}

        {/* Discretionary Measurable KRAs */}
        {data.measurableKras && data.measurableKras.length > 0 && (
          <div className="appeal-section mb-4">
            <h5 className="section-title">
              <i className="bi bi-graph-up me-2"></i>
              Discretionary Measurable KRAs ({data.measurableKras.length})
            </h5>
            <AppealReviewKRASection
              kras={data.measurableKras}
              selectedKras={formState.selectedKras}
              kraActions={formState.kraActions}
              kraScores={formState.kraScores}
              kraComments={formState.kraComments}
              onKraSelect={actions.handleKraSelection}
              onActionChange={actions.handleActionChange}
              onScoreChange={actions.handleScoreChange}
              onCommentChange={actions.handleCommentChange}
              type="measurable"
            />
          </div>
        )}

        {/* No KRAs Message */}
        {(!data.nonMeasurableKras || data.nonMeasurableKras.length === 0) && 
         (!data.measurableKras || data.measurableKras.length === 0) && (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            No KRAs available for review.
          </div>
        )}

        {/* Selection Summary */}
        {formState.selectedKras.size > 0 && (
          <div className="selection-summary mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>{formState.selectedKras.size}</strong> KRA(s) selected for review
          </div>
        )}

        {/* Overall Comment */}
        <div className="appeal-section mb-4">
          <h5 className="section-title">
            <i className="bi bi-chat-left-text me-2"></i>Overall Comment
          </h5>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Enter your overall comment for this appeal review..."
            value={formState.overallComment}
            onChange={(e) => actions.handleOverallCommentChange(e.target.value)}
          />
          {formState.overallComment.trim() === '' && formState.selectedKras.size > 0 && (
            <div className="text-danger small mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              Overall comment is required
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="appeal-section text-end">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmitClick}
            disabled={!isValid || actions.isSubmitting}
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
          {!isValid && (
            <div className="text-muted small mt-2">
              <i className="bi bi-info-circle me-1"></i>
              Select KRAs, choose actions, and add overall comment to submit
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5 className="mb-3">
              <i className="bi bi-question-circle text-warning me-2"></i>
              Confirm Submission
            </h5>
            <p>Are you sure you want to submit this appeal review?</p>
            <p className="text-muted small">
              You have reviewed <strong>{formState.selectedKras.size}</strong> KRA(s).
            </p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmSubmit}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="success-icon mb-3">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
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
      )}
    </div>
  );
}

export default ReviewAppeal;
