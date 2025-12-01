import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for displaying and reviewing appeal KRAs
 * Table structure matches the green-themed reference UI
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
  const [openCommentKra, setOpenCommentKra] = useState(null);

  if (!kras || kras.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No {type} KRAs available for review.
      </div>
    );
  }

  const isMeasurable = type === 'measurable';

  return (
    <div className="appeal-review-kra-section">
      <div className="table-responsive">
        <table className="table table-bordered kra-review-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Select KRA</th>
              <th style={{ width: '200px' }}>KRA</th>
              <th style={{ width: '90px' }}>Roles</th>
              <th style={{ width: '100px' }}>{isMeasurable ? 'Actual' : 'Selected Score'}</th>
              <th style={{ width: '80px' }}>{isMeasurable ? 'Target' : 'Target Score'}</th>
              <th style={{ width: '80px' }}>{isMeasurable ? 'Max Score' : 'Final Score'}</th>
              <th style={{ width: '90px' }}>Score</th>
              <th style={{ width: '80px' }}>Comment</th>
              <th style={{ width: '140px' }}>Action</th>
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
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>

                  {/* KRA Name */}
                  <td className="align-middle" style={{ padding: '12px' }}>
                    <div className="kra-name">{kra.kraName}</div>
                    {kra.description && (
                      <div className="kra-description" style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                        {kra.description}
                      </div>
                    )}
                  </td>

                  {/* Roles Column - 3 stacked rows */}
                  <td className="roles-cell" style={{ padding: 0 }}>
                    <div className="role-label-cell">Actual</div>
                    <div className="role-label-cell">Appraisee</div>
                    <div className="role-label-cell" style={{ borderBottom: 'none' }}>Appellate</div>
                  </td>

                  {/* Actual/Selected Score Values - 3 rows */}
                  <td className="values-cell" style={{ padding: 0 }}>
                    <div className="role-value-cell">
                      <span style={{ borderBottom: '1px solid #dee2e6', display: 'inline-block', minWidth: '50px', padding: '2px 8px' }}>
                        {kra.actualOldValue || kra.actual || '-'}
                      </span>
                    </div>
                    <div className="role-value-cell">
                      <span style={{ borderBottom: '1px solid #dee2e6', display: 'inline-block', minWidth: '50px', padding: '2px 8px' }}>
                        {kra.actual || kra.appraiseeScore || '-'}
                      </span>
                    </div>
                    <div className="role-value-cell" style={{ borderBottom: 'none' }}>
                      <input 
                        type="text" 
                        className="appeal-score-input appellate-input" 
                        value={kra.actualNewValue || kra.newScore || ''} 
                        readOnly 
                        style={{ width: '60px' }}
                      />
                    </div>
                  </td>

                  {/* Target */}
                  <td className="text-center align-middle">
                    <span>{kra.target || kra.targetOldValue || kra.maxScore || '-'}</span>
                  </td>

                  {/* Max Score / Final Score */}
                  <td className="text-center align-middle">
                    <span>{kra.maxScore || '-'}</span>
                  </td>

                  {/* Score Column - old score on top, editable below */}
                  <td className="score-cell" style={{ padding: '8px' }}>
                    <div style={{ marginBottom: '4px', color: '#666', fontSize: '0.85rem' }}>
                      {kra.oldScore}
                    </div>
                    {isSelected && action === 'ACCEPT_AND_EDIT' ? (
                      <input
                        type="number"
                        className="appeal-score-input"
                        value={score}
                        onChange={(e) => onScoreChange(kraId, e.target.value)}
                        max={kra.maxScore}
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                      />
                    ) : (
                      <input
                        type="text"
                        className="appeal-score-input"
                        value={kra.newScore || ''}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    )}
                  </td>

                  {/* Comment Button */}
                  <td className="text-center align-middle">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setOpenCommentKra(openCommentKra === kraId ? null : kraId)}
                      title={kra.appraiseeComment || 'No comment'}
                      style={{ 
                        backgroundColor: kra.appraiseeComment ? '#006837' : 'transparent',
                        borderRadius: '4px',
                        padding: '4px 8px'
                      }}
                    >
                      <i className={`bi bi-chat-left-text-fill ${kra.appraiseeComment ? 'text-white' : 'text-muted'}`}></i>
                    </button>
                    {isSelected && action === 'REJECT' && (
                      <textarea
                        className="form-control form-control-sm mt-2"
                        rows="2"
                        value={comment}
                        onChange={(e) => onCommentChange(kraId, e.target.value)}
                        placeholder="Reason..."
                        style={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </td>

                  {/* Action Radio Buttons */}
                  <td className="action-cell align-middle" style={{ padding: '8px' }}>
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
