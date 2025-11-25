import React from "react";
import "./QuaterMeasurableKra.css";

export default function QuaterAppraiserMeasurableKra({
  data = [],
  activeMonth,
  months = [],
  setActiveMonth
}) {

  // Fallback dummy data (only when API gives no KRA for a month)
  const defaultData = [
    {
      kra_desc: "% Growth in Terminal Total o/s advances",
      unit: "%",
      actual: -8.1,
      target: 0.9,
      maxscore: 4.0,
      actual_score: 0.0,
      KRA_CATEGORY: " "
    }
  ];

  // Use API data if available for month
  const displayData = data.length > 0 ? data : defaultData;

  // Normalize API fields
  const normalizeRow = (row) => ({
    kra: row.kra_desc || row.KRA_DESC || "",
    unit: row.unit || "%",
    actual: parseFloat(row.actual || row.actual_og || row.APPRAISEE_ACTUAL || 0),
    target: parseFloat(row.target || row.TARGET || row.target_og || row.repa_target || 0),
    maxScore: parseFloat(row.maxscore || row.MAXSCORE || row.MAX_SCORE || 0),
    actualScore: parseFloat(row.actual_score || row.score || 0),
    category: row.KRA_CATEGORY || " "
  });

  return (
    <div className="measurable-wrapper mt-4">

      {/* ------------------------------ */}
      {/* ✅ MONTH TABS FROM API */}
      {/* ------------------------------ */}
      <ul className="nav nav-tabs month-tabs mb-3">
        {months.map((m) => (
          <li className="nav-items" key={m}>
            <button
              className={`nav-link ${activeMonth === m ? "active" : ""}`}
              onClick={() => setActiveMonth(m)}
            >
              {m}
            </button>
          </li>
        ))}
      </ul>

      <h4 className="fw-bold mb-3">Measurable</h4>

      {/* ------------------------------ */}
      {/* ✅ MEASURABLE TABLE */}
      {/* ------------------------------ */}
      <div className="table-responsive">
        <table className="table table-bordered measurable-table">
          <thead className="table-header">
            <tr>
              <th style={{ width: "35%" }}>KRA</th>
              <th>Unit</th>
              <th>Actual</th>
              <th>Target</th>
              <th>Max Score</th>
              <th>Actual Score</th>
              <th>KRA Category</th>
            </tr>
          </thead>

          <tbody>
            {displayData.map((row, idx) => {
              const normalized = normalizeRow(row);
              return (
                <tr key={idx} className="Q-trs">
                  <td className="Q-tds">{normalized.kra}</td>
                  <td className="Q-tds">{normalized.unit}</td>
                  <td className="Q-tds">{normalized.actual}</td>
                  <td className="Q-tds">{normalized.target}</td>
                  <td className="Q-tds">{normalized.maxScore}</td>
                  <td className="Q-tds">{normalized.actualScore}</td>
                  <td className="Q-tds">{normalized.category}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ------------------------------ */}
        {/* NON-MEASURABLE TITLE */}
        {/* ------------------------------ */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h4 className="fw-bold mb-3">Non - Measurable</h4>

          <div style={{ fontSize: "1rem" }}>
            Discretionary Non - Measurable Score&nbsp;
            <span style={{ color: "var(--accent-color)" }}>0.0/0.0</span>
          </div>
        </div>

         {/* Scale Instructions */}
      <div className="mt-3 border p-3">
        <p className="" style={{ fontSize: "1rem" }}>
          Please fill score in actual as per the scale below:
        </p>

        <ul className="list-unstyled base-loop">
          <li className="mb-3">
            1. Strongly disagree: shows very poor performance
            across the given dimensions
          </li>

          <li className="mb-3">
            2. Disagree: fell short of expectations & shows weak
            performance in few or more of the given dimensions
          </li>

          <li className="mb-3">
            3. Neutral:expresses required level of proficiency
            on the dimension at the level
          </li>

          <li className="mb-3">
        4. Agree performs well above expectations across
            the given dimensions
          </li>

          <li className="mb-3">
            5. Strongly agree:over-delivers & shows high degree
            of proficiency in the given dimensions
          </li>
        </ul>
      </div>
      </div>
    </div>
  );
}
