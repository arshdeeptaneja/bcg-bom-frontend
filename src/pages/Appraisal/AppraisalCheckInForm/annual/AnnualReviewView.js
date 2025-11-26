import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnualReviewView } from './useAnnualReviewView';
import CheckInDescriptionSection from '../../../../components/Appraisal/CheckInDescriptionSection/CheckInDescriptionSection';
import FinalScoreSummaryTable from '../../../../components/Appraisal/CheckInTables/FinalScoreSummaryTable/FinalScoreSummaryTable';
import BackButton from '../../../../components/common/BackButton/BackButton';
import './AnnualReviewView.css';

/**
 * Annual Review View-Only Component
 *
 * Displays completed annual appraisal data in read-only format.
 * Users can view all scores, comments, and evaluations from all roles
 * without the ability to modify any data.
 */
const AnnualReviewView = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, context, isContextValid } = useAnnualReviewView();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="annual-review-view-container">
        <div className="loading-spinner-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading annual review data...</p>
        </div>
      </div>
    );
  }

  // Handle error or invalid context
  if (isError || !isContextValid || !data) {
    return (
      <div className="annual-review-view-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Unable to Load Review</h4>
          <p>
            {!isContextValid
              ? 'Missing required parameters. Please check the URL and try again.'
              : 'Failed to load annual review data. Please try again or contact support.'}
          </p>
          <hr />
          <div className="d-flex justify-content-start">
            <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { finalScoreSummary, nonMeasurableKras, measurableKras, metadata } = data;

  return (
    <div className="annual-review-view-container">
      {/* Header with View-Only Badge and Back Button */}
      <div className="review-header">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <BackButton onClick={() => navigate(-1)} />
            <h2 className="mb-0">Annual Performance Review</h2>
            <span className="badge bg-info fs-6">
              <i className="bi bi-eye me-2"></i>
              View Only
            </span>
          </div>
        </div>
      </div>

      {/* Employee Context Section */}
      <section className="review-section mb-4">
        <CheckInDescriptionSection
          employee={{
            empNo: context.employee.number,
            empName: context.employee.name,
            organisation: context.employee.organisation,
            scale: context.employee.scale,
            jobFamily: context.employee.jobFamily,
            cohort: context.employee.cohort,
            primary: context.employee.primary,
            secondary: context.employee.secondary,
            tertiary: context.employee.tertiary,
          }}
          dateRange={{
            startDate: context.dateRange.startDate,
            endDate: context.dateRange.endDate,
          }}
          showDownloadButton={false}
        />
      </section>

      {/* Authority Information */}
      {(context.authorities.reportingAuthority.name ||
        context.authorities.reviewingAuthority.name ||
        context.authorities.acceptingAuthority.name) && (
        <section className="review-section mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Authority Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {context.authorities.reportingAuthority.name && (
                  <div className="col-md-4">
                    <div className="authority-info">
                      <small className="text-muted">Reporting Authority</small>
                      <p className="mb-0 fw-semibold">
                        {context.authorities.reportingAuthority.name}
                      </p>
                      <small className="text-muted">
                        {context.authorities.reportingAuthority.number}
                      </small>
                    </div>
                  </div>
                )}
                {context.authorities.reviewingAuthority.name && (
                  <div className="col-md-4">
                    <div className="authority-info">
                      <small className="text-muted">Reviewing Authority</small>
                      <p className="mb-0 fw-semibold">
                        {context.authorities.reviewingAuthority.name}
                      </p>
                      <small className="text-muted">
                        {context.authorities.reviewingAuthority.number}
                      </small>
                    </div>
                  </div>
                )}
                {context.authorities.acceptingAuthority.name && (
                  <div className="col-md-4">
                    <div className="authority-info">
                      <small className="text-muted">Accepting Authority</small>
                      <p className="mb-0 fw-semibold">
                        {context.authorities.acceptingAuthority.name}
                      </p>
                      <small className="text-muted">
                        {context.authorities.acceptingAuthority.number}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Score Summary */}
      {finalScoreSummary && finalScoreSummary.length > 0 && (
        <section className="review-section mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Final Score Summary
              </h5>
            </div>
            <div className="card-body">
              <FinalScoreSummaryTable kraListData={finalScoreSummary} />
            </div>
          </div>
        </section>
      )}

      {/* Non-Measurable KRAs */}
      {nonMeasurableKras && Object.keys(nonMeasurableKras).length > 0 && (
        <section className="review-section mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Non-Measurable KRAs
              </h5>
            </div>
            <div className="card-body">
              {Object.entries(nonMeasurableKras).map(([groupName, kras]) => (
                <div key={groupName} className="kra-group mb-4">
                  <h6 className="kra-group-title text-primary mb-3">
                    <i className="bi bi-folder me-2"></i>
                    {groupName}
                  </h6>
                  {kras.map((kra, index) => (
                    <div key={kra.KraId || index} className="kra-item mb-4 p-3 border rounded">
                      <div className="kra-header mb-3">
                        <h6 className="fw-bold">{kra.KraName || 'N/A'}</h6>
                        {kra.KraDescription && (
                          <p className="text-muted small mb-2">{kra.KraDescription}</p>
                        )}
                        <div className="d-flex gap-2 align-items-center">
                          <span className="badge bg-secondary">
                            Max Score: {kra.MaxScore || 0}
                          </span>
                          {kra.Tooltip && (
                            <span className="text-muted small">
                              <i className="bi bi-info-circle me-1"></i>
                              {kra.Tooltip}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scores from all roles */}
                      <div className="scores-grid mb-3">
                        <div className="row g-2">
                          {kra.RepaScore !== null && kra.RepaScore !== undefined && (
                            <div className="col-md-3">
                              <div className="score-card">
                                <small className="text-muted d-block">Reporting Authority</small>
                                <span className="badge bg-primary fs-6">
                                  {kra.RepaScore} / {kra.MaxScore}
                                </span>
                              </div>
                            </div>
                          )}
                          {kra.RevaScore !== null && kra.RevaScore !== undefined && (
                            <div className="col-md-3">
                              <div className="score-card">
                                <small className="text-muted d-block">Reviewing Authority</small>
                                <span className="badge bg-success fs-6">
                                  {kra.RevaScore} / {kra.MaxScore}
                                </span>
                              </div>
                            </div>
                          )}
                          {kra.AcScore !== null && kra.AcScore !== undefined && (
                            <div className="col-md-3">
                              <div className="score-card">
                                <small className="text-muted d-block">Accepting Authority</small>
                                <span className="badge bg-warning text-dark fs-6">
                                  {kra.AcScore} / {kra.MaxScore}
                                </span>
                              </div>
                            </div>
                          )}
                          {kra.PostAppealScore !== null && kra.PostAppealScore !== undefined && (
                            <div className="col-md-3">
                              <div className="score-card">
                                <small className="text-muted d-block">Post Appeal</small>
                                <span className="badge bg-info fs-6">
                                  {kra.PostAppealScore} / {kra.MaxScore}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comments from all roles */}
                      {(kra.CommentSelf1 ||
                        kra.CommentSelf2 ||
                        kra.CommentRepa ||
                        kra.CommentReva ||
                        kra.CommentAc) && (
                        <div className="comments-section">
                          <h6 className="small fw-bold text-secondary mb-2">Comments</h6>
                          <div className="accordion" id={`accordion-${kra.KraId}`}>
                            {kra.CommentSelf1 && (
                              <div className="accordion-item">
                                <h2
                                  className="accordion-header"
                                  id={`heading-self1-${kra.KraId}`}
                                >
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-self1-${kra.KraId}`}
                                  >
                                    Self Comment 1
                                  </button>
                                </h2>
                                <div
                                  id={`collapse-self1-${kra.KraId}`}
                                  className="accordion-collapse collapse"
                                >
                                  <div className="accordion-body">
                                    <p className="mb-0 text-muted">{kra.CommentSelf1}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {kra.CommentRepa && (
                              <div className="accordion-item">
                                <h2
                                  className="accordion-header"
                                  id={`heading-repa-${kra.KraId}`}
                                >
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-repa-${kra.KraId}`}
                                  >
                                    Reporting Authority Comment
                                  </button>
                                </h2>
                                <div
                                  id={`collapse-repa-${kra.KraId}`}
                                  className="accordion-collapse collapse"
                                >
                                  <div className="accordion-body">
                                    <p className="mb-0 text-muted">{kra.CommentRepa}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {kra.CommentReva && (
                              <div className="accordion-item">
                                <h2
                                  className="accordion-header"
                                  id={`heading-reva-${kra.KraId}`}
                                >
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-reva-${kra.KraId}`}
                                  >
                                    Reviewing Authority Comment
                                  </button>
                                </h2>
                                <div
                                  id={`collapse-reva-${kra.KraId}`}
                                  className="accordion-collapse collapse"
                                >
                                  <div className="accordion-body">
                                    <p className="mb-0 text-muted">{kra.CommentReva}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {kra.CommentAc && (
                              <div className="accordion-item">
                                <h2
                                  className="accordion-header"
                                  id={`heading-ac-${kra.KraId}`}
                                >
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-ac-${kra.KraId}`}
                                  >
                                    Accepting Authority Comment
                                  </button>
                                </h2>
                                <div
                                  id={`collapse-ac-${kra.KraId}`}
                                  className="accordion-collapse collapse"
                                >
                                  <div className="accordion-body">
                                    <p className="mb-0 text-muted">{kra.CommentAc}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {!kra.CommentSelf1 &&
                            !kra.CommentRepa &&
                            !kra.CommentReva &&
                            !kra.CommentAc && (
                              <p className="text-muted fst-italic small">
                                No comments provided
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Measurable KRAs (if any) */}
      {measurableKras && measurableKras.length > 0 && (
        <section className="review-section mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Measurable KRAs
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>KRA Name</th>
                      <th>Target</th>
                      <th>Actual</th>
                      <th>Max Score</th>
                      <th>Score</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurableKras.map((kra, index) => (
                      <tr key={kra.KraId || index}>
                        <td>{kra.KraName || 'N/A'}</td>
                        <td>{kra.Target !== null ? kra.Target : 'N/A'}</td>
                        <td>{kra.Actual !== null ? kra.Actual : 'N/A'}</td>
                        <td>{kra.MaxScore || 0}</td>
                        <td>
                          <span className="badge bg-primary">
                            {kra.Score !== null ? kra.Score : 'N/A'}
                          </span>
                        </td>
                        <td>
                          {kra.CommentSelf1 ? (
                            <span className="text-muted small">{kra.CommentSelf1}</span>
                          ) : (
                            <span className="text-muted fst-italic small">
                              No comment provided
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer with Back Button */}
      <div className="review-footer mt-4">
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AnnualReviewView;
