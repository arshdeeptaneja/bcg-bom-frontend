import React, { useEffect, useState } from "react";
import { loadAppraisalData, saveAppraisalData } from "../../localStorageHelpers";
import "./MeasurableKRA.css";

const MeasurableKRA = ({ initialData }) => {
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [openCommentIndex, setOpenCommentIndex] = useState(null);
  const [kraData, setKraData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [message, setMessage] = useState("");

  // ✅ Load from localStorage or API data safely
  useEffect(() => {
    const stored = loadAppraisalData();

    // Priority: 1. localStorage, 2. API initialData, 3. default
    if (
      stored.measurableKRA &&
      typeof stored.measurableKRA === "object" &&
      Object.keys(stored.measurableKRA).length > 0
    ) {
      setKraData(stored.measurableKRA);
      setEditedData(JSON.parse(JSON.stringify(stored.measurableKRA))); // copy for editing
    } else if (initialData && typeof initialData === "object" && Object.keys(initialData).length > 0) {
      setKraData(initialData);
      setEditedData(JSON.parse(JSON.stringify(initialData)));
      saveAppraisalData({ measurableKRA: initialData });
    } else {
      const defaultData = {
        April: [
          {
            kra: "% Growth in Terminal Total o/s advances",
            unit: "%",
            actual: "-8.1",
            target: "0.9",
            maxScore: "4.0",
            score: "0.0",
            category: "Advances",
            comment: "",
          },
          {
            kra: "% Growth in Terminal Agri o/s advances",
            unit: "%",
            actual: "-0.9",
            target: "1.2",
            maxScore: "3.0",
            score: "0.0",
            category: "Agri",
            comment: "",
          },
        ],
        May: [
          {
            kra: "% Growth in Terminal Total o/s advances",
            unit: "%",
            actual: "-5.5",
            target: "2.0",
            maxScore: "4.0",
            score: "1.0",
            category: "Advances",
            comment: "",
          },
          {
            kra: "% Growth in Terminal Agri o/s advances",
            unit: "%",
            actual: "1.0",
            target: "1.2",
            maxScore: "3.0",
            score: "2.5",
            category: "Agri",
            comment: "",
          },
        ],
        June: [
          {
            kra: "% Growth in Terminal Total o/s advances",
            unit: "%",
            actual: "2.5",
            target: "3.0",
            maxScore: "4.0",
            score: "3.0",
            category: "Advances",
            comment: "",
          },
          {
            kra: "% Growth in Terminal Agri o/s advances",
            unit: "%",
            actual: "3.2",
            target: "4.1",
            maxScore: "3.0",
            score: "2.9",
            category: "Agri",
            comment: "",
          },
        ],
      };
      setKraData(defaultData);
      setEditedData(JSON.parse(JSON.stringify(defaultData)));
      saveAppraisalData({ measurableKRA: defaultData });
    }
  }, []);

  // ✅ Handle user input (edit only locally until submit)
  const handleInputChange = (month, index, field, value) => {
    const updated = { ...editedData };
    updated[month][index][field] = value;
    setEditedData(updated);
  };

  // ✅ Handle comment open/close
  const handleCommentToggle = (index) => {
    setOpenCommentIndex(openCommentIndex === index ? null : index);
  };

  // ✅ Handle comment typing
  const handleCommentChange = (month, index, value) => {
    const updated = { ...editedData };
    updated[month][index].comment = value;
    setEditedData(updated);
  };

  // ✅ Submit all edited inputs to localStorage
  const handleSubmit = () => {
    saveAppraisalData({ measurableKRA: editedData });
    setKraData(editedData);
    setMessage("✅ Data saved successfully!");
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="kra-section page container-fluid py-4">
      <h5 className="fw-semibold mb-3" style={{ color: "var(--main-color)" }}>
        Non-discretionary KRA
      </h5>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-semibold" style={{ color: "var(--accent-color)" }}>
          Measurable
        </h6>
        <div className="kra-month-tabs d-flex gap-3">
          {["April", "May", "June"].map((month) => (
            <button
              key={month}
              className={`kra-month-btn ${selectedMonth === month ? "active" : ""}`}
              onClick={() => setSelectedMonth(month)}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="text-success fw-semibold mb-2">{message}</div>}

      <div className="table-responsive">
        <table className="table kra-main-table mb-0">
          <thead className="table-header">
            <tr>
              <th>Select KRA</th>
              <th>KRA</th>
              <th>Unit</th>
              <th>Actual</th>
              <th>Target</th>
              <th>Max Score</th>
              <th>Score</th>
              <th>KRA Category</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {editedData[selectedMonth]?.map((row, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>
                    <input type="checkbox" className="form-check-input" />
                  </td>
                  <td>{row.kra}</td>
                  <td>{row.unit}</td>

                  {/* Actual */}
                  <td>
                    <div className="kra-value-box text-center">
                      <div className="kra-display-value">{kraData[selectedMonth][index].actual}</div>
                      <input
                        type="number"
                        className="form-control text-center input-cell"
                        value={row.actual}
                        onChange={(e) =>
                          handleInputChange(selectedMonth, index, "actual", e.target.value)
                        }
                      />
                    </div>
                  </td>

                  {/* Target */}
                  <td>
                    <div className="kra-value-box text-center">
                      <div className="kra-display-value">{kraData[selectedMonth][index].target}</div>
                      <input
                        type="number"
                        className="form-control text-center input-cell"
                        value={row.target}
                        onChange={(e) =>
                          handleInputChange(selectedMonth, index, "target", e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td>{row.maxScore}</td>
                  <td>{row.score}</td>
                  <td>{row.category}</td>

                  <td className="text-center">
                    {/* <i
                      className="bi bi-chat-dots comment-icon"
                      onClick={() => handleCommentToggle(index)}
                    ></i> */}

                    <i class="bi bi-chat-left-text-fill text-primary"
                      onClick={() => handleCommentToggle(index)}

                    ></i>
                  </td>
                </tr>

                {openCommentIndex === index && (
                  <tr className="comment-row">
                    <td colSpan="9">
                      <div className="px-3 py-2">
                        <label className="fw-semibold mb-2 d-flex">Appraisee Comment:</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Enter Your Comment"
                          value={row.comment}
                          onChange={(e) =>
                            handleCommentChange(selectedMonth, index, e.target.value)
                          }
                        ></textarea>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit button */}
      {/* <div className="text-end mt-3">
        <button
          className="btn px-4"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "#fff",
            fontWeight: 500,
          }}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div> */}
    </div>
  );
};

export default MeasurableKRA;
