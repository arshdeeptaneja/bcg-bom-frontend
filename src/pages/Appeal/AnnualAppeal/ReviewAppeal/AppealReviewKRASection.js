import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for displaying and reviewing appeal KRAs
 * Table structure matches the green-themed reference with blue theming
 */
function AppealReviewKRASection({
  kras,
  selectedKras,
  kraActions,
  kraScores,
  kraComments,
  onKraSelect,
  onActionChange,
  onScoreChange,
  onCommentChange,
  type
}) {
  if (!kras || kras.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No {type} KRAs available for review.
      </div>
    );
  }

  return (
    <div className="appeal-review-kra-section">
      <div className="table-responsive">
        <table className="table table-bordered kra-review-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Select KRA</th>
              <th style={{ width: '180px' }}>KRA</th>
              <th style={{ width: '100px' }}>Roles</th>
              <th style={{ width: '100px' }}>Actual</th>
              <th style={{ width: '80px' }}>Target</th>
              <th style={{ width: '80px' }}>Max Score</th>
              <th style={{ width: '100px' }}>Score</th>
              <th style={{ width: '120px' }}>Comment</th>
              <th style={{ width: '160px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {kras.map((kra, index) => {
              const kraId = kra.appealId || kra.kraId || `${kra.kraName}-${index}`;
              const isSelected = selectedKras.has(kraId);
              const action = kraActions.get(kraId);
              const score = kraScores.get(kraId) || '';
              const comment = kraComments.get(kraId) || '';

              return (
                <tr key={kraId} className={isSelected ? 'selected-row' : ''}>
                  {/* Select Checkbox */}
                  <td className="text-center align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onKraSelect(kraId)}
                      className="form-check-input kra-checkbox"
                    />
                  </td>

                  {/* KRA Name */}
                  <td className="align-middle">
                    <div className="kra-name">{kra.kraName}</div>
                    {kra.description && (
                      <div className="kra-description">{kra.description}</div>
                    )}
                    <div className="appeal-id">Appeal ID: {kra.appealId}</div>
                  </td>

                  {/* Roles Column - 3 rows */}
                  <td className="roles-cell">
                    <div className="role-row">Actual</div>
                    <div className="role-row">Appraisee</div>
                    <div className="role-row">Appellate</div>
                  </td>

                  {/* Actual Values - 3 rows */}
                  <td className="values-cell">
                    <div className="value-row">
                      <input type="text" className="form-control form-control-sm value-input" value={kra.actualOldValue || '-'} readOnly />
                    </div>
                    <div className="value-row">
                      <input type="text" className="form-control form-control-sm value-input" value={kra.actual || '-'} readOnly />
                    </div>
                    <div className="value-row">
                      <input type="text" className="form-control form-control-sm value-input appellate-input" value={kra.actualNewValue || '-'} readOnly />
                    </div>
                  </td>

                  {/* Target */}
                  <td className="text-center align-middle">
                    <span>{kra.target || kra.targetOldValue || '-'}</span>
                  </td>

                  {/* Max Score */}
                  <td className="text-center align-middle">
                    <span>{kra.maxScore}</span>
                  </td>

                  {/* Score Column - with editable input */}
                  <td className="score-cell">
                    <div className="score-display">
                      <span className="old-score">{kra.oldScore}</span>
                    </div>
                    {isSelected && action === 'ACCEPT_AND_EDIT' ? (
                      <div className="score-input-wrapper">
                        <input
                          type="number"
                          className="form-control form-control-sm score-input"
                          value={score}
                          onChange={(e) => onScoreChange(kraId, e.target.value)}
                          max={kra.maxScore}
                          min="0"
                          step="0.1"
                          placeholder="0.0"
                        />
                      </div>
                    ) : (
                      <div className="score-display">
                        <span className="new-score">{kra.newScore || '-'}</span>
                      </div>
                    )}
                  </td>

                  {/* Comment */}
                  <td className="comment-cell align-middle">
                    {isSelected && action === 'REJECT' ? (
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={comment}
                        onChange={(e) => onCommentChange(kraId, e.target.value)}
                        placeholder="Reason..."
                      />
                    ) : (
                      <div className="comment-text">{kra.appraiseeComment || '-'}</div>
                    )}
                  </td>

                  {/* Action Radio Buttons */}
                  <td className="action-cell align-middle">
                    {isSelected ? (
                      <div className="action-options">
                        <label className="action-option">
                          <input
                            type="radio"
                            name={`action-${kraId}`}
                            value="ACCEPT_AS_IS"
                            checked={action === 'ACCEPT_AS_IS'}
                            onChange={(e) => onActionChange(kraId, e.target.value)}
                          />
                          <span className="action-label">ACCEPT AS IT IS</span>
                        </label>
                        <label className="action-option">
                          <input
                            type="radio"
                            name={`action-${kraId}`}
                            value="ACCEPT_AND_EDIT"
                            checked={action === 'ACCEPT_AND_EDIT'}
                            onChange={(e) => onActionChange(kraId, e.target.value)}
                          />
                          <span className="action-label">ACCEPT AND EDIT</span>
                        </label>
                        <label className="action-option">
                          <input
                            type="radio"
                            name={`action-${kraId}`}
                            value="REJECT"
                            checked={action === 'REJECT'}
                            onChange={(e) => onActionChange(kraId, e.target.value)}
                          />
                          <span className="action-label">REJECT</span>
                        </label>
                      </div>
                    ) : (
                      <span className="select-prompt">Select to review</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

AppealReviewKRASection.propTypes = {
  kras: PropTypes.array.isRequired,
  selectedKras: PropTypes.instanceOf(Set).isRequired,
  kraActions: PropTypes.instanceOf(Map).isRequired,
  kraScores: PropTypes.instanceOf(Map).isRequired,
  kraComments: PropTypes.instanceOf(Map).isRequired,
  onKraSelect: PropTypes.func.isRequired,
  onActionChange: PropTypes.func.isRequired,
  onScoreChange: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['measurable', 'non-measurable']).isRequired
};

export default AppealReviewKRASection;
