import React, { useEffect, useState } from "react";

const STORAGE_KEY = "kra-table-v1";

const initialDemoData = [
  {
    id: 1,
    checked: false,
    kra: "Achievement in no. of PMJJBY accounts opened vs target",
    unit: "Number",
    actual: 6,
    appraisee: 10.0,
    appraiserActual: 10,
    target: 40.0,
    appraiserTarget: 40.0,
    validatorActual: 0,
    validatorTarget: 0,
    maxScore: 3.0,
    score: 0.5,
    validatorScore: 0.5,
    month: "April",
    category: "Measurable",
    selfComment: "",
    appraiserComment: "",
    commentOpen: true,
    action: "accept",
  },
  {
    id: 2,
    checked: false,
    kra: "% Growth in Terminal Total o/s advances",
    unit: "%",
    actual: -8.1,
    appraisee: 0.1,
    appraiserActual: 0.2,
    target: 0.9,
    appraiserTarget: 0.9,
    validatorActual: 0,
    validatorTarget: 0,
    maxScore: 4.0,
    score: 0.0,
    validatorScore: 0.0,
    month: "April",
    category: "Measurable",
    selfComment: "",
    appraiserComment: "",
    commentOpen: true,
    action: "accept",
  },
];

export default function ValidatorTable() {
  const [rows, setRows] = useState(initialDemoData);
  const [showModal, setShowModal] = useState(false);

  // load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRows(JSON.parse(saved));
      } catch {
        setRows(initialDemoData);
      }
    }
  }, []);

  const anyChecked = rows.some((r) => r.checked);

  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleCheckbox = (id) =>
    updateRow(id, { checked: !rows.find((r) => r.id === id).checked });

  const handleAction = (id, action) => updateRow(id, { action });

  const handleInput = (id, field, value) => updateRow(id, { [field]: value });

  const toggleComment = (id) =>
    updateRow(id, { commentOpen: !rows.find((r) => r.id === id).commentOpen });

  const handleSubmit = () => {
    if (!anyChecked) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="kra-root">

 <div>
    <h5 className="fw-semibold mb-1" style={{ color: "var(--accent-color)" }}>
      Non-discretionary KRA
    </h5>

    <div className="d-flex justify-content-between align-items-start mb-3">
      <h6 className="fw-semibold text-dark mb-0" style={{marginTop:"3rem"}}>Measurable</h6>
     {/* Right Side */}

  <div className="text-end">
    <div className="fw-semibold text-secondary mb-1">Non-discretionary Score</div>
    <div className="text-dark fw-semibold">
      <div>
        Old Score: <span className="fw-bold">0.5/7.0</span>
      </div>
      <div>
        New Score: <span className="fw-bold">1.2/7.0</span>
      </div>
    </div>
  </div>

    </div>

  </div>


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

        {rows.map((r) => {
          const isEditable = r.checked && r.action === "edit"; // validator edit only

          return (
            <div key={r.id} className="d-flex flex-column">
              <div className="kra-row">
                <div className="col select-col">
                  <input
                    type="checkbox"
                    checked={r.checked}
                    onChange={() => handleCheckbox(r.id)}
                  />
                </div>

                <div className="col kra-col">
                  <div className="kra-text">{r.kra}</div>
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

                <div className="col unit-col">{r.unit}</div>

                {/* Actual values */}
                <div className="col actual-col">
                  <input className="readonly" value={r.actual} readOnly />
                  <input className="readonly" value={r.appraisee} readOnly />
                  <input className="readonly" value={r.appraiserActual} readOnly />
                  <input
                    className={isEditable ? "editable" : "readonly"}
                    value={r.validatorActual}
                    onChange={(e) =>
                      handleInput(r.id, "validatorActual", e.target.value)
                    }
                    readOnly={!isEditable}
                  />
                </div>

                {/* Target values */}
                <div className="col target-col">
                  <input className="readonly" value={r.target} readOnly />
                  <input className="readonly" value={r.target} readOnly />
                  <input className="readonly" value={r.appraiserTarget} readOnly />
                  <input
                    className={isEditable ? "editable" : "readonly"}
                    value={r.validatorTarget}
                    onChange={(e) =>
                      handleInput(r.id, "validatorTarget", e.target.value)
                    }
                    readOnly={!isEditable}
                  />
                </div>

                {/* Max Score */}
                <div className="col max-col">
                  <input className="readonly single" value={r.maxScore} readOnly />
                </div>

                {/* Score */}
                <div className="col score-col">
                  <input
                    className={isEditable ? "editable single" : "readonly single"}
                    value={r.validatorScore}
                    onChange={(e) =>
                      handleInput(r.id, "validatorScore", e.target.value)
                    }
                    readOnly={!isEditable}
                  />
                </div>

                <div className="col month-col">
                  <input className="readonly single" value={r.month} readOnly />
                </div>

                <div className="col cat-col"></div>

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
                      checked={r.action === "accept"}
                      onChange={() => handleAction(r.id, "accept")}
                    />
                    <span>ACCEPT AS IT IS</span>
                  </label>

                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${r.id}`}
                      value="edit"
                      checked={r.action === "edit"}
                      onChange={() => handleAction(r.id, "edit")}
                    />
                    <span>ACCEPT AND EDIT</span>
                  </label>

                  <label className="radio-row">
                    <input
                      type="radio"
                      name={`action-${r.id}`}
                      value="reject"
                      checked={r.action === "reject"}
                      onChange={() => handleAction(r.id, "reject")}
                    />
                    <span>REJECT</span>
                  </label>
                </div>
              </div>

              {/* Comment Block */}
              {r.commentOpen && (
                <div className="comment-block">
                  <div className="comment-inner">
                    <div className="comment-left">
                      <label className="lbl">Self Comment:</label>
                      <div className="self-box">{r.selfComment || ""}</div>
                    </div>

                    <div className="comment-right">
                      <label className="lbl">
                        Appraiser Comment:<span className="required">*</span>
                      </label>
                      <textarea
                        className="text-area"
                        value={r.appraiserComment}
                        onChange={(e) =>
                          handleInput(r.id, "appraiserComment", e.target.value)
                        }
                        placeholder="write here"
                        readOnly={!isEditable}
                        maxLength={300}
                      />
                      <div className="comment-foot">
                        <div className="min-note">Minimum 20 character.</div>
                        <div className="counter">
                          {(r.appraiserComment || "").length} / 300
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="submit-wrap">
        <button
          className={`submit-btn ${anyChecked ? "active" : "inactive"}`}
          onClick={handleSubmit}
          disabled={!anyChecked}
        >
          Submit
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-body">
              Exception Reviewed by Validator successfully!
            </div>
            <div className="modal-actions">
              <button className="ok-btn" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
