/**
 * The QuarterlyCheckIn component in React handles the display and interaction logic for a quarterly
 * check-in form, including sections for score summaries, KRA inputs, comments, and development inputs.
 * @returns The `QuarterlyCheckIn` component is being returned. It contains JSX elements that make up
 * the UI for a quarterly check-in form. The component includes various sections such as header,
 * description, final score summary, monthly score summary, discretionary KRA sections for measurable
 * and non-measurable KRAs, additional comments sections for different types of comments, development
 * inputs section, and save/submit buttons.
 */
import React, { useState } from 'react';
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

const QuarterlyCheckIn = ({
  data,
  isLoading,
  context,
  roleState,
  formState,
  actions,
}) => {
  const { employee, dateRange } = context;
  const { currentRole, isEditableBy, handleRoleChange } = roleState;
  const { handleSave, handleSubmit, handleKraChange, handleSectionCommentChange, isSaving, isSubmitting } = actions;

  const [showMeasurableComment, setShowMeasurableComment] = useState(false);
  const [showNonMeasurableComment, setShowNonMeasurableComment] = useState(false);

  // Use API data or fallback to empty/mock data
  const kraData = data?.finalScoreSummary || [];
  const measurableKraListData = data?.measurableKras || [];
  const nonMeasurableKraListData = data?.nonMeasurableKras || {};
  
  // Use form data for measurable KRAs if available
  const formMeasurableKras = Object.values(formState.formData.measurableKraScores || {});
  const displayMeasurableKras = formMeasurableKras.length > 0 ? formMeasurableKras : measurableKraListData;

  const actualScoreData = data?.monthlyScoreSummary?.actualScoreData || {};
  const maxScoreData = data?.monthlyScoreSummary?.maxScoreData || {};
  const totalMeasurableActual = data?.totalMeasurableActual || 0;
  const totalMeasurableMax = data?.totalMeasurableMax || 0;
  const totalNonMeasurableActual = data?.totalNonMeasurableActual || 0;
  const totalNonMeasurableMax = data?.totalNonMeasurableMax || 0;
  const validationMessage = data?.validationMessage || '';

  // Development inputs questions
  const developmentInputsQuestions = data?.developmentInputs || [];

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Quarterly Check-In
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
            Quarterly Check-In
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
                  kraListData={displayMeasurableKras}
                  onKraChange={handleKraChange}
                  isEditable={isEditableBy.APPRAISEE} // Allow editing based on role
                />
                <div className="mt-3 p-2">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <label className="form-label fw-bold text-muted mb-0">Performance Measurable Comments</label>
                    <button 
                      className="btn btn-link p-0 text-decoration-none" 
                      onClick={() => setShowMeasurableComment(!showMeasurableComment)}
                    >
                      <i className={`bi bi-chat-left-text-fill ${formState.formData.sectionComments?.measurable?.[0] ? 'text-success' : 'text-primary'}`}></i>
                    </button>
                  </div>
                  {showMeasurableComment && (
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Enter comments for measurable performance..."
                      value={formState.formData.sectionComments?.measurable?.[0] || ''}
                      onChange={(e) => handleSectionCommentChange('measurable', [e.target.value])}
                      disabled={!isEditableBy.APPRAISEE}
                    />
                  )}
                </div>
              </div>
            )}
            {Object.keys(nonMeasurableKraListData).length > 0 && (
              <div className="non-measurable-section">
                <NonMeasurableKra
                  totalActualScore={totalNonMeasurableActual}
                  totalMaxScore={totalNonMeasurableMax}
                  kraListData={nonMeasurableKraListData}
                />
                <div className="mt-3 p-2">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <label className="form-label fw-bold text-muted mb-0">Non-Measurable Comments</label>
                    <button 
                      className="btn btn-link p-0 text-decoration-none" 
                      onClick={() => setShowNonMeasurableComment(!showNonMeasurableComment)}
                    >
                      <i className={`bi bi-chat-left-text-fill ${formState.formData.sectionComments?.nonMeasurable ? 'text-success' : 'text-primary'}`}></i>
                    </button>
                  </div>
                  {showNonMeasurableComment && (
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Enter comments for non-measurable performance..."
                      value={formState.formData.sectionComments?.nonMeasurable || ''}
                      onChange={(e) => handleSectionCommentChange('nonMeasurable', e.target.value)}
                      disabled={!isEditableBy.APPRAISEE}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Additional Section Comments */}
        <div className="additional-comments-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Additional Comments</h5>
            
            <div className="mb-3">
                <label className="form-label fw-bold text-muted">Performance Non-Measurable Comments</label>
                <textarea
                    className="form-control"
                    rows={2}
                    value={formState.formData.sectionComments?.performanceNonMeasurable || ''}
                    onChange={(e) => handleSectionCommentChange('performanceNonMeasurable', e.target.value)}
                    disabled={!isEditableBy.APPRAISEE}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold text-muted">Performance Semi-Measurable Comments</label>
                <textarea
                    className="form-control"
                    rows={2}
                    value={formState.formData.sectionComments?.semiMeasurable || ''}
                    onChange={(e) => handleSectionCommentChange('semiMeasurable', e.target.value)}
                    disabled={!isEditableBy.APPRAISEE}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold text-muted">Performance Period Comments</label>
                <textarea
                    className="form-control"
                    rows={2}
                    value={formState.formData.sectionComments?.period || ''}
                    onChange={(e) => handleSectionCommentChange('period', e.target.value)}
                    disabled={!isEditableBy.APPRAISEE}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold text-muted">Areas of Performance Comments</label>
                <textarea
                    className="form-control"
                    rows={2}
                    value={formState.formData.sectionComments?.areas || ''}
                    onChange={(e) => handleSectionCommentChange('areas', e.target.value)}
                    disabled={!isEditableBy.APPRAISEE}
                />
            </div>
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          <DevelopmentInputs
            questions={developmentInputsQuestions}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
        </div>
      </div>
      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button
          className="btn btn-outline-primary"
          onClick={handleSave}
          disabled={isSaving || isSubmitting}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSaving || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default QuarterlyCheckIn;
