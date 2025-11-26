import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for displaying and reviewing appeal KRAs
 * Supports both measurable and non-measurable KRA types
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
      <table className="table table-bordered">
        <thead className="table-success">
          <tr>
            <th>Select</th>
            <th>KRA</th>
            <th>Roles</th>
            <th>Actual</th>
            <th>Target</th>
            <th>Max Score</th>
            <th>Score</th>
            <th>Comment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {kras.map((kra) => {
            const isSelected = selectedKras.has(kra.kraId);
            const action = kraActions.get(kra.kraId);
            const score = kraScores.get(kra.kraId);
            const comment = kraComments.get(kra.kraId);

            return (
              <tr key={kra.kraId} className={isSelected ? 'table-active' : ''}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onKraSelect(kra.kraId)}
                    className="form-check-input"
                  />
                </td>
                <td>
                  <strong>{kra.kraName}</strong>
                  {kra.description && (
                    <div className="small text-muted">{kra.description}</div>
                  )}
                </td>
                <td>
                  <div className="small">
                    <div>Actual: {kra.actual || '-'}</div>
                    <div>Appraisee: {kra.appraiseeScore || '-'}</div>
                    <div>Appellate: {kra.appellateScore || '-'}</div>
                  </div>
                </td>
                <td>{kra.actual || '-'}</td>
                <td>{kra.target || '-'}</td>
                <td>{kra.maxScore || '-'}</td>
                <td>
                  <div>Old: {kra.oldScore}</div>
                  <div>New: {kra.newScore}</div>
                </td>
                <td className="small">{kra.appraiseeComment || 'No comment'}</td>
                <td>
                  {isSelected && (
                    <div className="action-radio-group">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`action-${kra.kraId}`}
                          id={`accept-${kra.kraId}`}
                          value="ACCEPT_AS_IS"
                          checked={action === 'ACCEPT_AS_IS'}
                          onChange={(e) => onActionChange(kra.kraId, e.target.value)}
                        />
                        <label className="form-check-label small" htmlFor={`accept-${kra.kraId}`}>
                          ACCEPT AS IT IS
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`action-${kra.kraId}`}
                          id={`edit-${kra.kraId}`}
                          value="ACCEPT_AND_EDIT"
                          checked={action === 'ACCEPT_AND_EDIT'}
                          onChange={(e) => onActionChange(kra.kraId, e.target.value)}
                        />
                        <label className="form-check-label small" htmlFor={`edit-${kra.kraId}`}>
                          ACCEPT AND EDIT
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`action-${kra.kraId}`}
                          id={`reject-${kra.kraId}`}
                          value="REJECT"
                          checked={action === 'REJECT'}
                          onChange={(e) => onActionChange(kra.kraId, e.target.value)}
                        />
                        <label className="form-check-label small" htmlFor={`reject-${kra.kraId}`}>
                          REJECT
                        </label>
                      </div>

                      {/* Conditional inputs based on action */}
                      {action === 'ACCEPT_AND_EDIT' && (
                        <div className="mt-2">
                          <label className="form-label small">New Score:</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={score || ''}
                            onChange={(e) => onScoreChange(kra.kraId, e.target.value)}
                            max={kra.maxScore}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}

                      {action === 'REJECT' && (
                        <div className="mt-2">
                          <label className="form-label small">Reason:</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            value={comment || ''}
                            onChange={(e) => onCommentChange(kra.kraId, e.target.value)}
                            placeholder="Enter rejection reason..."
                          />
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
