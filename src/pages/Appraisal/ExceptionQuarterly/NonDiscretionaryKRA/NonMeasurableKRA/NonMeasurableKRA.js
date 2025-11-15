import React, { useState, useEffect } from "react";
import "./NonMeasurableKRA.css";
import { saveAppraisalData, loadAppraisalData } from "../../localStorageHelpers";

const NonMeasurableKRA = () => {
  const [data, setData] = useState([]);

  // Load saved data on mount
  useEffect(() => {
    const stored = loadAppraisalData();
    if (stored.nonMeasurableKRA && stored.nonMeasurableKRA.length > 0) {
      setData(stored.nonMeasurableKRA);
    } else {
      // fallback default data (optional)
      setData([
        // {
        //   kra: "Customer Relationship Management",
        //   unit: "N/A",
        //   maxScore: "5.0",
        //   score: "0.0",
        //   repaScore: "0.0",
        //   comment: "",
        // },
      ]);
    }
  }, []);

  // Save whenever data changes
  useEffect(() => {
    if (data.length > 0) {
      saveAppraisalData({ nonMeasurableKRA: data });
    }
  }, [data]);

  const handleCommentChange = (index, value) => {
    const updated = [...data];
    updated[index].comment = value;
    setData(updated);
  };

  return (
    <div className="non-measurable-section container-fluid py-4">
      <h6 className="fw-semibold mb-3" style={{ color: "var(--accent-color)" }}>
        Non Measurable
      </h6>

      <div className="table-responsive">
        <table className="table non-measurable-table mb-0">
          <thead className="table-header">
            <tr>
              <th>Select KRA</th>
              <th>KRA</th>
              <th>Unit</th>
              <th>Max Score</th>
              <th>Score</th>
              <th>REPA Score</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-3 text-muted">
                  Not applicable.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>
                      <input type="checkbox" className="form-check-input" />
                    </td>
                    <td>{row.kra}</td>
                    <td>{row.unit}</td>
                    <td>{row.maxScore}</td>
                    <td>{row.score}</td>
                    <td>{row.repaScore}</td>
                    <td className="text-center">
                      <i
                        className="bi bi-chat-dots comment-icon"
                        onClick={() =>
                          handleCommentChange(index, row.comment ? "" : "Type your comment here")
                        }
                      ></i>
                    </td>
                  </tr>

                  {row.comment && (
                    <tr className="comment-row">
                      <td colSpan="7">
                        <div className="px-3 py-2">
                          <label className="fw-semibold mb-2" >
                            Appraisee Comment:
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Enter Your Comment"
                            value={row.comment}
                            onChange={(e) =>
                              handleCommentChange(index, e.target.value)
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
    </div>
  );
};

export default NonMeasurableKRA;
