import React from 'react';

export default function ValidatorTable({ rows = [], onRowChange, onSubmit, isSubmitting }) {
  const anyChecked = rows.some((row) => row.checked);

  const updateRow = (id, patch) => {
    if (!onRowChange) return;
    onRowChange(id, patch);
  };

  const handleCheckbox = (id) => {
    const current = rows.find((row) => row.id === id);
    updateRow(id, { checked: !current?.checked });
  };

  const handleAction = (id, action) => updateRow(id, { action });

  const handleInput = (id, field, value) => updateRow(id, { [field]: value });

  const toggleComment = (id) => {
    const current = rows.find((row) => row.id === id);
    updateRow(id, { commentOpen: !current?.commentOpen });
  };

  const handleSubmit = () => {
    if (!anyChecked || !onSubmit) return;
    onSubmit();
  };

  if (!rows.length) {
    return <div className="empty-kra">No exception rows available for validation.</div>;
  }

  return (
    <div className="kra-root">
      <h4 className="kra-title-top">Validator Review</h4>

      <div className="kra-table-wrap" role="table">
        <div className="kra-header-row table-header">
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

        {rows.map((row) => {
          const valueEditable = row.checked && row.action === 'edit';
          const commentEditable = row.checked && row.action !== 'accept';

          return (
            <div key={row.id} className="d-flex flex-column">
              <div className="kra-row">
                <div className="col select-col">
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={() => handleCheckbox(row.id)}
                    aria-label={`select-${row.id}`}
                  />
                </div>

                <div className="col kra-col">
                  <div className="kra-text">{row.kra}</div>
                </div>

                <div className="col roles-col">
                  <div className="role">Actual</div>
                  <div className="divider" />
                  <div className="role">Appraisee</div>
                  <div className="divider" />
                  <div className="role">Appraiser</div>
                  <div className="divider" />
                  <div className="role">Validator</div>
                </div>

                <div className="col unit-col">{row.unit}</div>

                <div className="col actual-col">
                  <input className="readonly" value={row.actual} readOnly />
                  <input className="readonly" value={row.appraisee} readOnly />
                  <input className="readonly" value={row.appraiserActual} readOnly />
                  <input
                    className={valueEditable ? 'editable' : 'readonly'}
                    value={row.validatorActual}
                    onChange={(e) => handleInput(row.id, 'validatorActual', e.target.value)}
                    readOnly={!valueEditable}
                  />
                </div>

                <div className="col target-col">
                  <input className="readonly" value={row.target} readOnly />
                  <input className="readonly" value={row.target} readOnly />
                  <input className="readonly" value={row.appraiserTarget} readOnly />
                  <input
                    className={valueEditable ? 'editable' : 'readonly'}
                    value={row.validatorTarget}
                    onChange={(e) => handleInput(row.id, 'validatorTarget', e.target.value)}
                    readOnly={!valueEditable}
                  />
                </div>

                <div className="col max-col">
                  <input className="readonly single" value={row.maxScore} readOnly />
                </div>

                <div className="col score-col">
                  <input
                    className={valueEditable ? 'editable single' : 'readonly single'}
                    value={row.validatorScore}
                    onChange={(e) => handleInput(row.id, 'validatorScore', e.target.value)}
                    readOnly={!valueEditable}
                  />
                </div>

                <div className="col month-col">
                  <input className="readonly single" value={row.month} readOnly />
                </div>

                <div className="col cat-col" />

                <div className="col comment-col">
                  <button
                    className="comment-icon"
                    onClick={() => toggleComment(row.id)}
                    title="Toggle comments"
                  >
                    <i className="bi bi-chat-left-text-fill" />
                  </button>
                </div>

                <div className="col action-col">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${row.id}`}
                      value="accept"
                      checked={row.action === 'accept'}
                      onChange={() => handleAction(row.id, 'accept')}
                    />
                    <span>ACCEPT AS IT IS</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${row.id}`}
                      value="edit"
                      checked={row.action === 'edit'}
                      onChange={() => handleAction(row.id, 'edit')}
                    />
                    <span>ACCEPT AND EDIT</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${row.id}`}
                      value="reject"
                      checked={row.action === 'reject'}
                      onChange={() => handleAction(row.id, 'reject')}
                    />
                    <span>REJECT</span>
                  </label>
                </div>
              </div>

              {row.commentOpen && (
                <div className="comment-block">
                  <div className="comment-inner">
                    <div className="comment-left">
                      <label className="lbl">Self Comment:</label>
                      <div className="self-box">{row.selfComment || ''}</div>
                    </div>
                    <div className="comment-right">
                      <label className="lbl">
                        Validator Comment<span className="required">*</span>
                      </label>
                      <textarea
                        className="text-area"
                        value={row.validatorComment || ''}
                        onChange={(e) => handleInput(row.id, 'validatorComment', e.target.value)}
                        placeholder="write here"
                        readOnly={!commentEditable}
                        maxLength={300}
                      />
                      <div className="comment-foot">
                        <div className="min-note">Minimum 20 characters.</div>
                        <div className="counter">{(row.validatorComment || '').length} / 300</div>
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
