import React, { useEffect, useState } from "react";
import { loadAppraisalData, saveAppraisalData } from "../../localStorageHelpers";
import "./MeasurableKRA.css";

const MeasurableKRA = ({ initialData }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [openCommentIndex, setOpenCommentIndex] = useState(null);
  const [kraData, setKraData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [message, setMessage] = useState("");

  // ✅ Load from localStorage or API data with proper priority
  useEffect(() => {
    // PRIORITY 1: Check localStorage first
    const stored = loadAppraisalData();

    if (stored?.measurableKRA && Object.keys(stored.measurableKRA).length > 0) {
      console.log("Loading from localStorage:", stored.measurableKRA);
      setKraData(stored.measurableKRA);
      setEditedData(JSON.parse(JSON.stringify(stored.measurableKRA)));
      
      // Set first month as selected if not set
      if (!selectedMonth) {
        setSelectedMonth(Object.keys(stored.measurableKRA)[0]);
      }
      return;
    }

    // PRIORITY 2: Load from API initialData
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Loading from API initialData:", initialData);
      setKraData(initialData);
      setEditedData(JSON.parse(JSON.stringify(initialData)));
      
      // Set first month as selected if not set
      if (!selectedMonth) {
        setSelectedMonth(Object.keys(initialData)[0]);
      }
      
      // Save to localStorage for future use
      saveAppraisalData({ measurableKRA: initialData });
      return;
    }

    // PRIORITY 3: Empty state - no data available
    console.log("No data available - showing empty state");
    setKraData({});
    setEditedData({});
  }, [initialData]);

  // Set selected month when data loads
  useEffect(() => {
    if (!selectedMonth && Object.keys(kraData).length > 0) {
      setSelectedMonth(Object.keys(kraData)[0]);
    }
  }, [kraData, selectedMonth]);

  // ✅ Handle user input (edit only locally until submit)
  const handleInputChange = (month, index, field, value) => {
    const updated = { ...editedData };
    if (!updated[month]) {
      console.error(`Month ${month} not found in editedData`);
      return;
    }
    if (!updated[month][index]) {
      console.error(`Index ${index} not found in month ${month}`);
      return;
    }
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
    if (!updated[month] || !updated[month][index]) {
      console.error(`Cannot update comment: month ${month} or index ${index} not found`);
      return;
    }
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

  // Get available months dynamically
  const availableMonths = Object.keys(editedData);

  // If no data, show empty state
  if (availableMonths.length === 0) {
    return (
      <div className="kra-section page container-fluid py-4">
        <h5 className="fw-semibold mb-3" style={{ color: "var(--main-color)" }}>
          Non-discretionary KRA
        </h5>
        <h6 className="fw-semibold" style={{ color: "var(--accent-color)" }}>
          Measurable
        </h6>
        <div className="text-center py-5">
          <p className="text-muted">No measurable KRA data available</p>
        </div>
      </div>
    );
  }

  // Get current month data
  const currentMonthData = editedData[selectedMonth] || [];

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
          {availableMonths.map((month) => (
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
            {currentMonthData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No data available for {selectedMonth}
                </td>
              </tr>
            ) : (
              currentMonthData.map((row, index) => (
                <React.Fragment key={`${selectedMonth}-${index}-${row.kraCode || index}`}>
                  <tr>
                    <td>
                      <input type="checkbox" className="form-check-input" />
                    </td>

                    <td>{row.kra || 'N/A'}</td>
                    <td>{row.unit || 'N/A'}</td>

                    {/* ACTUAL */}
                    <td>
                      <div className="kra-value-box text-center">
                        <div className="kra-display-value">
                          {kraData[selectedMonth]?.[index]?.actual || row.actual || '0'}
                        </div>

                        <input
                          type="number"
                          className="form-control text-center input-cell"
                          value={row.actual || ''}
                          onChange={(e) =>
                            handleInputChange(selectedMonth, index, "actual", e.target.value)
                          }
                        />
                      </div>
                    </td>

                    {/* TARGET */}
                    <td>
                      <div className="kra-value-box text-center">
                        <div className="kra-display-value">
                          {kraData[selectedMonth]?.[index]?.target || row.target || '0'}
                        </div>

                        <input
                          type="number"
                          className="form-control text-center input-cell"
                          value={row.target || ''}
                          onChange={(e) =>
                            handleInputChange(selectedMonth, index, "target", e.target.value)
                          }
                        />
                      </div>
                    </td>

                    <td>{row.maxScore || '0'}</td>
                    <td>{row.score || '0'}</td>
                    <td>{row.category || 'measurable'}</td>

                    <td className="text-center">
                      <i
                        className="bi bi-chat-left-text-fill text-primary"
                        style={{ cursor: 'pointer' }}
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
                            value={row.comment || ''}
                            onChange={(e) =>
                              handleCommentChange(selectedMonth, index, e.target.value)
                            }
                          ></textarea>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Optional: Uncomment if you want a submit button in this component */}
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
          Save Changes
        </button>
      </div> */}
    </div>
  );
};

export default MeasurableKRA;