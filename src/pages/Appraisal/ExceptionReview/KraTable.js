import React, { useEffect, useState } from "react";
import "./KraTable.css";
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
    maxScore: 3.0,
    score: 0.5,
    appraiserScore: 0.5,
    month: "April",
    category: "Measurable",
    selfComment: "",
    appraiserComment: "",
    commentOpen: true, // default open
    action: "accept", // 'accept' | 'edit' | 'reject'
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
    maxScore: 4.0,
    score: 0.0,
    appraiserScore: 0.4,
    month: "April",
    category: "Measurable",
    selfComment: "",
    appraiserComment: "",
    commentOpen: true,
    action: "accept",
  },
  {
    id: 3,
    checked: false,
    kra: "No. of SB accounts opened vs target",
    unit: "Number",
    actual: 8,
    appraisee: 12.0,
    appraiserActual: 12,
    target: 50.0,
    appraiserTarget: 50.0,
    maxScore: 2.0,
    score: 0.7,
    appraiserScore: 0.7,
    month: "May",
    category: "Measurable",
    selfComment: "",
    appraiserComment: "",
    commentOpen: true,
    action: "accept",
  },
];

export default function KraTable() {
  const [rows, setRows] = useState(initialDemoData);
  const [showModal, setShowModal] = useState(false);

  // load saved data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRows(JSON.parse(saved));
      } catch {
        setRows(initialDemoData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anyChecked = rows.some((r) => r.checked);

  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleCheckbox = (id) => {
    updateRow(id, { checked: !rows.find((r) => r.id === id).checked });
  };

  const handleAction = (id, action) => {
    // action controls editability; reject keeps values but prevents edit
    updateRow(id, { action });
  };

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
      <h4 className="kra-title-top">Measurable</h4>

      <div className="kra-table-wrap" role="table">
        <div className="kra-header-row table-header" >
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
          const isEditable = r.checked && r.action === "edit";
          return (
            <div className="d-flex flex-column">
            <div className="kra-row" key={r.id}>
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
              <div className="vertical-divider">
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

              <div className="col actual-col">
                <input className="readonly" value={r.actual} readOnly />
                <input className="readonly" value={r.appraisee} readOnly />
                <input
                  className={isEditable ? "editable" : "readonly"}
                  value={r.appraiserActual}
                  onChange={(e) =>
                    handleInput(r.id, "appraiserActual", e.target.value)
                  }
                  readOnly={!isEditable}
                />
                <input className="readonly" value={""} readOnly />
              </div>

              <div className="col target-col">
                <input className="readonly" value={r.target} readOnly />
                <input className="readonly" value={r.target} readOnly />
                <input
                  className={isEditable ? "editable" : "readonly"}
                  value={r.appraiserTarget}
                  onChange={(e) =>
                    handleInput(r.id, "appraiserTarget", e.target.value)
                  }
                  readOnly={!isEditable}
                />
                <input className="readonly" value={""} readOnly />
              </div>

              <div className="col max-col">
                <input className="readonly single" value={r.maxScore} readOnly />
              </div>

              <div className="col score-col">
                <input
                  className={isEditable ? "editable single" : "readonly single"}
                  value={r.appraiserScore}
                  onChange={(e) =>
                    handleInput(r.id, "appraiserScore", e.target.value)
                  }
                  readOnly={!isEditable}
                />
              </div>

              <div className="col month-col">
                <input className="readonly single" value={r.month} readOnly />
              </div>

              <div className="col cat-col">
                {/* <input className="readonly single" value={r.category} readOnly /> */}
              </div>

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

                 {/* Comment block (open by default) */}
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

      <div className="submit-wrap">
        <button
          className={`submit-btn ${anyChecked ? "active" : "inactive"}`}
          onClick={handleSubmit}
          disabled={!anyChecked}
        >
          Submit
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-body">
              Exception Reviewed by Appraiser successfully !
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
