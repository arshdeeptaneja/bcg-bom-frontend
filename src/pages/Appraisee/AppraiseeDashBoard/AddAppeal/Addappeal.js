import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BackButton } from '../../../../components/common';
import LoadingSpinner from '../../../../components/Spinner';
import {
  CheckInDescriptionSection,
  FinalScoreSummaryTable,
} from '../../../../components/Appraisal';
import { useAddAppeal } from './useAddAppeal';
import AppealKRASection from './AppealKRASection';
import FileUploadSection from './FileUploadSection';
import './AddAppeal.css';

function AddAppeal() {
  const navigate = useNavigate();

  // Use custom hook for all data and logic
  const { data, context, formState, actions, isValid, isLoading, isError, error } = useAddAppeal();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appealId, setAppealId] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  console.log('Add Appeal Task', context.task);
  const enabled = (context.task =="view")?true:false;

  // Handle file upload with error handling
  const handleFileUpload = (files) => {
    try {
      actions.handleFileUpload(files);
      setValidationErrors((prev) => prev.filter((e) => !e.includes('file')));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Validate and submit appeal
  const handleSubmit = async () => {
    const errors = [];

    // Validate KRA selection
    if (formState.selectedKras.size === 0) {
      errors.push('Please select at least one KRA to appeal');
    }

    // Validate appeal texts
    for (const kraId of formState.selectedKras) {
      const text = formState.appealTexts.get(kraId);
      if (!text || text.trim() === '') {
        errors.push(`Missing appeal justification for selected KRA`);
        break;
      }
    }

    // Validate file upload (optional based on requirements)
    // if (formState.uploadedFiles.length === 0) {
    //   errors.push('Please upload at least one supporting document');
    // }

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setValidationErrors([]);
      const response = await actions.handleSubmit();

      console.log('RESPONSE', response);

      // Extract appeal ID from response
      const responseAppealId =
        response?.TICKETID ||
        response?.data?.appealId ||
        response?.appealId ||
        `APPEAL-${Date.now()}`;
      setAppealId(responseAppealId);
      setShowSuccessModal(true);
      toast.success('Appeal submitted successfully!');
    } catch (err) {
      console.error('Submit appeal error:', err);
      toast.error(err.message || 'Failed to submit appeal. Please try again.');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // navigate(`/appraisal/appraisee-check-in?${queryParams}`);
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appeal</h1>
          </div>
        </div>
        <LoadingSpinner />
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
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appeal</h1>
          </div>
        </div>
        <div className="pageWrapper-content m-3">
          <div className="alert alert-danger">
            <h5 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Error Loading Data
            </h5>
            <p className="mb-0">
              {error?.message || 'Failed to load appraisal data. Please try again.'}
            </p>
            <hr />
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check for missing context
  if (!context.financialYear || !context.employee) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-content m-3">
          <div className="alert alert-warning">
            <h5 className="alert-heading">
              <i className="bi bi-info-circle-fill me-2"></i>
              Missing Information
            </h5>
            <p className="mb-0">
              Required information is missing. Please navigate from the dashboard.
            </p>
            <hr />
            <button className="btn btn-outline-warning" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appeal</h1>
        </div>
      </div>

      <div className="pageWrapper-content d-flex flex-column p-3 gap-4">
        {/* Validation Errors Summary */}
        {validationErrors.length > 0 && (
          <div className="validation-summary">
            <div className="validation-summary-title">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              Please fix the following errors:
            </div>
            <ul className="validation-summary-list">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Employee Information Section */}
        <CheckInDescriptionSection employee={context.employee} dateRange={context.dateRange} />

        {/* Note Section */}
        <div className="note mt-5 mb-5">
          <span className="text-muted fw-bold">Note: </span>
          <span className="text-muted">
            Please raise an appeal if actual or target values are incorrect. This appeal form is for
            appealing against the scores assigned by your appraiser.
          </span>
        </div>

        {/* Discretionary Score Header */}
        <div className="d-flex justify-content-end mb-3">
          <span className="text-muted me-2">Discretionary Score:</span>
          <span className="fw-bold text-primary">
            {data.totalNonMeasurableActual + data.totalMeasurableActual}/
            {data.totalNonMeasurableMax + data.totalMeasurableMax}
          </span>
        </div>

        {/* Final Score Summary Section */}
        <div className="final-score-summary-table-section d-flex flex-column shadow-sm p-3">
          <h5 className="text-primary fw-bold mb-3">Final Score Summary</h5>
          <FinalScoreSummaryTable
            kraListData={data.finalScoreSummary}
            selectedCategories={formState.selectedCategories}
            onSelectionChange={actions.handleCategorySelection}
            finalScoreEdits={formState.finalScoreEdits}
            onFinalScoreChange={actions.handleFinalScoreChange}
            isEditable={enabled}
            viewType="addAppeal"
          />
        </div>

        {/* Discretionary KRAs Section */}
        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm p-3">
          <h5 className="text-primary fw-bold mb-3">Discretionary KRAs - Select KRAs to Appeal</h5>

          {/* Measurable KRAs */}
          {Object.entries(data.measurableKras).map(([groupName, kras]) => (
            <div key={groupName} className="mb-4">
              <AppealKRASection
                kras={kras}
                selectedKras={formState.selectedKras}
                appealTexts={formState.appealTexts}
                actualValueEdits={formState.actualValueEdits}
                onKraSelect={actions.handleKraSelection}
                onAppealTextChange={actions.handleAppealTextChange}
                onActualChange={actions.handleActualChange}
                type="measurable"
                groupName={groupName}
                totalActualScore={data.totalMeasurableActual}
                totalMaxScore={data.totalMeasurableMax}
                enabled={enabled}
              />
            </div>
          ))}

          {/* Score Scale Information for Non-Measurable KRAs */}
          <div className="score-scale-info bg-light p-3 rounded border mb-4">
            <p className="fw-bold mb-2">Please fill score in actual as per the scale below:</p>
            <ol className="mb-0 ps-3">
              <li>
                <strong>Strongly disagree:</strong> shows very poor performance across the given
                dimensions
              </li>
              <li>
                <strong>Disagree:</strong> fell short of expectations & shows weak performance in
                few or more of the given dimensions
              </li>
              <li>
                <strong>Neutral:</strong> expresses required level of proficiency on the dimension
                at the level
              </li>
              <li>
                <strong>Agree:</strong> performs well above expectations across the given dimensions
              </li>
              <li>
                <strong>Strongly agree:</strong> over-delivers & shows high degree of proficiency in
                the given dimensions
              </li>
            </ol>
          </div>

          {/* Non-Measurable KRAs */}
          {Object.entries(data.nonMeasurableKras).map(([groupName, kras]) => (
            <div key={groupName} className="mb-4">
              <AppealKRASection
                kras={kras}
                selectedKras={formState.selectedKras}
                appealTexts={formState.appealTexts}
                actualValueEdits={formState.actualValueEdits}
                onKraSelect={actions.handleKraSelection}
                onAppealTextChange={actions.handleAppealTextChange}
                onActualChange={actions.handleActualChange}
                type="non-measurable"
                groupName={groupName}
                totalActualScore={data.totalNonMeasurableActual}
                totalMaxScore={data.totalNonMeasurableMax}
                enabled={enabled}
              />
            </div>
          ))}

          {/* Selection Summary */}
          {formState.selectedKras.size > 0 && (
            <div className="info-box mt-4">
              <div className="info-box-title">
                <i className="bi bi-check-circle-fill me-2"></i>
                Selection Summary
              </div>
              <p className="mb-0">
                You have selected <strong>{formState.selectedKras.size}</strong> KRA(s) for appeal.
                Please ensure you have provided justification for each selected KRA.
              </p>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="file-upload-section d-flex flex-column shadow-sm p-3">
          <h5 className="text-primary fw-bold mb-3">Supporting Documents</h5>
          {(!enabled)?<FileUploadSection
            files={formState.uploadedFiles}
            onFileUpload={handleFileUpload}
            onFileRemove={actions.handleFileRemove}
            // enabled={!enabled}
          />:null}
        </div>
      </div>

      {/* Submit Button */}
      {(!enabled)?<div className="save-and-submit-button-section d-flex flex-column align-items-end gap-2 m-3">
        <button
          className={`btns btn-primarys ${(!isValid ||formState.uploadedFiles.length==0 || actions.isSubmitting) ? 'disabled-btn' : ''}`}
          onClick={handleSubmit}
          disabled={!isValid || actions.isSubmitting}
          title={!isValid ? 'Please select at least one KRA and provide justification' : ''}
        >
          {actions.isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Submitting Appeal...
            </>
          ) : (
            <>
              <i className="bi bi-send-fill me-2"></i>
              Submit Appeal
            </>
          )}
        </button>
        {!isValid && formState.selectedKras.size === 0 && (
          <div className="text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Please select at least one KRA to enable submission
          </div>
        )}
      </div> : null}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="appeal-success-modal">
          <div className="appeal-success-modal-content">
            <div className="appeal-success-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h4 className="fw-bold" style={{ color: 'var(--accent-color)' }}>
              Appeal Submitted Successfully!
            </h4>
            <div className="appeal-id-display">Appeal ID: #{appealId}</div>
            <p className="text-muted">
              Your appeal has been registered and will be reviewed by the appeal committee. You will
              be notified once the review is complete.
            </p>
            <hr />
            <p className="text-muted small mb-4">
              <i className="bi bi-info-circle me-1"></i>
              For any queries, please contact your HR department.
            </p>
            <button
              className="btn btn-primary px-5"
              style={{ background: 'var(--accent-color)', border: 'none' }}
              onClick={handleSuccessModalClose}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddAppeal;
