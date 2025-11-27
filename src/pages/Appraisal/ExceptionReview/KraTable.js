/**
 * The `KraTable` component in React renders a table for displaying and editing Key Result Areas (KRAs)
 * with checkboxes, input fields, and action options.
 * @returns The `KraTable` component is being returned. It is a functional component that renders a
 * table with rows of data based on the `rows` prop passed to it. The component handles various user
 * interactions such as checkbox selection, input changes, action selection, and comment toggling. It
 * also provides a submit button to trigger the `onSubmit` function when any row is checked.
 */
import React from 'react';
import './KraTable.css';

const MODE_VERIFY = 'verify';
const MODE_VALIDATE = 'validate';
export default function KraTable({
  rows = [],
  onRowChange,
  onSubmit,
  isSubmitting,
  mode = MODE_VERIFY,
}) {
  // Helper function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[monthNumber - 1] || 'Unknown';
  };

  const anyChecked = rows.some((r) => r.checked);

  const updateRow = (id, patch) => {
    if (!onRowChange) return;
    onRowChange(id, patch);
  };

  const handleCheckbox = (id) => {
    const current = rows.find((r) => r.id === id);
    updateRow(id, { checked: !current?.checked });
  };

  const handleAction = (id, action) => {
    updateRow(id, { action });
  };

  const handleInput = (id, field, value) => updateRow(id, { [field]: value });

  const toggleComment = (id) => {
    const current = rows.find((r) => r.id === id);
    updateRow(id, { commentOpen: !current?.commentOpen });
  };

  const handleSubmit = () => {
    if (!anyChecked || !onSubmit) return;
    onSubmit();
  };

  const renderEmptyState = !rows.length;

  return (
    <div className="kra-root">
      <h4 className="kra-title-top">Measurable</h4>

      {renderEmptyState && <div className="empty-kra">No KRA records available for review.</div>}

      <div className="kra-table-wrap text-center" role="table">
        <div className="kra-header-row d-flex flex-row justify-content-between align-items-center text-center table-header">
          <div className="col select-col">Select KRA</div>
          <div className="col kra-col">KRA</div>
          <div className="col kra-col">Roles</div>
          <div className="col kra-col">Unit</div>
          <div className="col actual-col">Actual</div>
          <div className="col target-col">Target</div>
          <div className="col max-col">Max Score</div>
          <div className="col score-col">Score</div>
          <div className="col month-col">Month</div>
          <div className="col cat-col">KRA Category</div>
          <div className="col comment-col">Comment</div>
          <div className="col action-col">Action</div>
        </div>

        {rows.map((r) => {
          const isEditable = r.checked && r.action === 'edit';
          return (
            <div className="d-flex flex-column" key={r.id}>
              <div className="kra-row">
                <div className="col select-col">
                  <input
                    type="checkbox"
                    checked={r.checked}
                    onChange={() => handleCheckbox(r.id)}
                    aria-label={`select-${r.id}`}
                  />
                </div>

                <div className="col kra-col">
                  <div className="kra-text">{r.kra}</div>
                </div>
                <div className="vertical-divider"></div>
                <div className="col roles-col">
                  <div className="role">Actual</div>
                  <div className="divider" />
                  <div className="role">Appraisee</div>
                  <div className="divider" />
                  <div className="role">Appraiser</div>
                  <div className="divider" />
                  <div className="role">Validator</div>
                </div>

                <div className="col unit-col">{r.unit}</div>

                <div className="col actual-col">
                  <input className="readonly" value={r.originalActual} readOnly />
                  <input className="readonly" value={r.appraisee} readOnly />
                  <input
                    className={isEditable ? 'editable' : 'readonly'}
                    value={r.appraiserActual || r.appraisee || ''}
                    onChange={(e) => handleInput(r.id, 'appraiserActual', e.target.value)}
                    readOnly={!(isEditable && mode === MODE_VERIFY)}
                  />
                  <input
                    className="readonly"
                    value={r.validatorActual}
                    readOnly={!isEditable || mode !== MODE_VALIDATE}
                  />
                </div>

                <div className="col target-col">
                  <input className="readonly" value={r.originalTarget} readOnly />
                  <input className="readonly" value={r.appraiseeTarget} readOnly />
                  <input
                    className={isEditable ? 'editable' : 'readonly'}
                    value={r.appraiserTarget || r.appraiseeTarget || ''}
                    onChange={(e) => handleInput(r.id, 'appraiserTarget', e.target.value)}
                    readOnly={!(isEditable && mode === MODE_VERIFY)}
                  />
                  <input
                    className="readonly"
                    value={r.validatorTarget}
                    readOnly={!isEditable || mode !== MODE_VALIDATE}
                  />
                </div>

                <div className="col max-col">
                  <input className="readonly single" value={r.maxScore} readOnly />
                </div>

                <div className="col score-col">
                  <input className="readonly single" value={r.score} readOnly />
                  <input
                    className={isEditable ? 'editable single' : 'readonly single'}
                    value={r.appraiserScore || ''}
                    onChange={(e) => handleInput(r.id, 'appraiserScore', e.target.value)}
                    readOnly={!(isEditable && mode === MODE_VERIFY)}
                  />
                </div>

                <div className="col month-col">
                  <p>{getMonthName(r.month)}</p>
                </div>

                <div className="col cat-col" />

                <div className="col comment-col">
                  <button
                    className="comment-icon"
                    onClick={() => toggleComment(r.id)}
                    title="Toggle comments"
                  >
                    <i className="bi bi-chat-left-text-fill" />
                  </button>
                </div>

                <div className="col action-col">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${r.id}`}
                      value="accept"
                      checked={r.action === 'accept'}
                      onChange={() => handleAction(r.id, 'ACCEPT_AS_IS')}
                    />
                    <span>ACCEPT AS IT IS</span>
                  </label>

                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${r.id}`}
                      value="edit"
                      checked={r.action === 'edit'}
                      onChange={() => handleAction(r.id, 'ACCEPT_AND_EDIT')}
                    />
                    <span>ACCEPT AND EDIT</span>
                  </label>

                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${r.id}`}
                      value="reject"
                      checked={r.action === 'reject'}
                      onChange={() => handleAction(r.id, 'REJECT')}
                    />
                    <span>REJECT</span>
                  </label>
                </div>
              </div>

              {/* Comment block (open by default) */}
              {r.commentOpen && (
                <div className="comment-block">
                  <div className="comment-inner">
                    <div className="comment-right">
                      <label className="lbl text-start">Self Comment:</label>
                      <p className="text-start">{r.selfComment || ''}</p>
                    </div>

                    <div className="comment-right">
                      <label className="lbl text-start">
                        Appraiser Comment:<span className="required">*</span>
                      </label>
                      <textarea
                        className="text-area"
                        value={r.appraiserComment}
                        onChange={(e) => handleInput(r.id, 'appraiserComment', e.target.value)}
                        placeholder="write here"
                        readOnly={!isEditable}
                        maxLength={300}
                      />
                      <div className="comment-foot">
                        <div className="min-note">Minimum 20 character.</div>
                        <div className="counter">{(r.appraiserComment || '').length} / 300</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="submit-wrap">
        <button
          className={`submit-btn ${anyChecked ? 'active' : 'inactive'}`}
          onClick={handleSubmit}
          disabled={!anyChecked || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
