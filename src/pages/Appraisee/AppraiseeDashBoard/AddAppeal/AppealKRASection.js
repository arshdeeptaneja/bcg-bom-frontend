import React, { useState } from 'react';

/**
 * AppealKRASection - Component for displaying KRAs with appeal functionality
 * Supports both measurable and non-measurable KRAs
 * 
 * @param {Object} props
 * @param {Array} props.kras - Array of KRA objects
 * @param {Set} props.selectedKras - Set of selected KRA IDs
 * @param {Map} props.appealTexts - Map of KRA ID to appeal text
 * @param {Function} props.onKraSelect - Callback when KRA is selected/deselected
 * @param {Function} props.onAppealTextChange - Callback when appeal text changes
 * @param {string} props.type - 'measurable' or 'non-measurable'
 * @param {string} props.groupName - Group name for the KRAs
 */
const AppealKRASection = ({
  kras = [],
  selectedKras = new Set(),
  appealTexts = new Map(),
  onKraSelect,
  onAppealTextChange,
  type = 'measurable',
  groupName = ''
}) => {
  const [expandedComments, setExpandedComments] = useState(new Set());

  const toggleComment = (kraId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kraId)) {
        newSet.delete(kraId);
      } else {
        newSet.add(kraId);
      }
      return newSet;
    });
  };

  const isSelected = (kraId) => selectedKras.has(kraId);
  const getAppealText = (kraId) => appealTexts.get(kraId) || '';
  const isCommentExpanded = (kraId) => expandedComments.has(kraId);

  if (!kras || kras.length === 0) {
    return null;
  }

  return (
    <div className="appeal-kra-section mb-4">
      {groupName && (
        <h5 className="fw-bold mb-3" style={{ color: 'var(--accent-color)' }}>
          {groupName}
        </h5>
      )}
      
      <div className="border rounded">
        <table className="table mb-0" style={{ borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
            <tr>
              {type === 'measurable' ? (
                <>
                  <th style={{ width: '5%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Select</th>
                  <th style={{ width: '30%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>KRA</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Actual</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Target</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Max Score</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Score</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Comments</th>
                </>
              ) : (
                <>
                  <th style={{ width: '5%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Select</th>
                  <th style={{ width: '40%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>KRA</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Score</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Max Score</th>
                  <th style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>Comments</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {kras.map((kra) => (
              <React.Fragment key={kra.KraId}>
                <tr 
                  className={`align-middle ${isSelected(kra.KraId) ? 'table-active' : ''}`}
                  style={{
                    backgroundColor: isSelected(kra.KraId) ? '#e7f3ff' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isSelected(kra.KraId)}
                      onChange={() => onKraSelect(kra.KraId)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>
                    <div className="fw-semibold">{kra.KraName}</div>
                    {kra.KraDescription && (
                      <div className="text-muted small mt-1" style={{ fontStyle: 'italic' }}>
                        {kra.KraDescription}
                      </div>
                    )}
                    {type === 'non-measurable' && kra.Tooltip && (
                      <div className="text-muted small mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        {kra.Tooltip}
                      </div>
                    )}
                  </td>
                  {type === 'measurable' ? (
                    <>
                      <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>{kra.Actual}</td>
                      <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>{kra.Target}</td>
                      <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>{kra.MaxScore}</td>
                      <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>{kra.Score}</td>
                    </>
                  ) : (
                    <>
                      <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>{kra.Score}</td>
                      <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>{kra.MaxScore}</td>
                    </>
                  )}
                  <td className="text-center" style={{ padding: '12px 16px', border: '1px solid #ddd', verticalAlign: 'middle' }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => toggleComment(kra.KraId)}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-color)',
                        cursor: 'pointer',
                        padding: '0'
                      }}
                      title={isCommentExpanded(kra.KraId) ? "Hide comment" : "Show comment"}
                    >
                      <i className={`bi ${isCommentExpanded(kra.KraId) ? 'bi-chevron-up' : 'bi-chat-left-text-fill'} fs-5`}></i>
                    </button>
                  </td>
                </tr>
                
                {/* Existing comment row */}
                {isCommentExpanded(kra.KraId) && kra.CommentSelf1 && (
                  <tr>
                    <td colSpan={type === 'measurable' ? 7 : 5} className="bg-light" style={{ padding: '12px 16px', border: '1px solid #ddd' }}>
                      <div className="p-2">
                        <div className="small text-muted mb-1">
                          <strong>Your previous comment:</strong>
                        </div>
                        <div className="text-dark small">{kra.CommentSelf1}</div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Appeal text input row - only shown when KRA is selected */}
                {isSelected(kra.KraId) && (
                  <tr>
                    <td colSpan={type === 'measurable' ? 7 : 5} className="p-3" style={{ backgroundColor: '#f8f9fa', padding: '12px 16px', border: '1px solid #ddd' }}>
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-pencil-square me-2"></i>
                        Appeal Justification *
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Please provide detailed justification for your appeal on this KRA..."
                        value={getAppealText(kra.KraId)}
                        onChange={(e) => onAppealTextChange(kra.KraId, e.target.value)}
                        required
                      />
                      {getAppealText(kra.KraId).trim() === '' && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          Appeal justification is required for selected KRAs
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppealKRASection;
