/**
 * The QuaterlyMeasurableKraTable component renders a table displaying key performance indicators with
 * actual, target, max score, and actual score values.
 * @returns The QuaterlyMeasurableKraTable component is being returned. It renders a table displaying
 * key performance indicators (KPIs) data including KRA description, unit, actual value, target value,
 * max score, actual score, and KRA category. The data displayed in the table is either from the
 * provided 'data' prop or from a default set of KPIs if no data is
 */
import React from "react";
import "./QuaterMeasurableKra.css";

export default function QuaterlyMeasurableKraTable({ data = [], activeMonth }) {
  // Fallback to default data if no data is provided
  const defaultData = [
    {
      kra_desc: "% Growth in Terminal Total o/s advances",
      unit: "%",
      actual: -8.1,
      target: 0.9,
      maxscore: 4.0,
      actual_score: 0.0,
      KRA_CATEGORY: " "
    },
    {
      kra_desc: "% Growth in Terminal Agri o/s advances",
      unit: "%",
      actual: -0.9,
      target: 1.2,
      maxscore: 3.0,
      actual_score: 0.0,
      KRA_CATEGORY: " "
    },
    {
      kra_desc: "% Growth in Terminal MSME o/s advances",
      unit: "%",
      actual: -4.4,
      target: 0.3,
      maxscore: 3.0,
      actual_score: 0.0,
      KRA_CATEGORY: " "
    },
    {
      kra_desc: "% Growth in Average CASA Deposits",
      unit: "%",
      actual: -27.4,
      target: 0.5,
      maxscore: 8.5,
      actual_score: -3.0,
      KRA_CATEGORY: " "
    },
    {
      kra_desc: "% Growth in Terminal CASA deposits",
      unit: "%",
      actual: -46.0,
      target: 0.5,
      maxscore: 3.0,
      actual_score: 0.0,
      KRA_CATEGORY: " "
    },
    {
      kra_desc: "% Growth in Terminal Total Core deposits",
      unit: "%",
      actual: -16.1,
      target: 0.5,
      maxscore: 3.0,
      actual_score: 0.0,
      KRA_CATEGORY: " "
    },
    {
      kra_desc: "% Growth in Average Retail Term Deposits",
      unit: "%",
      actual: 3.3,
      target: 0.5,
      maxscore: 3.0,
      actual_score: 3.9,
      KRA_CATEGORY: " "
    }
  ];

  // Use API data if available, otherwise use default
  const displayData = data.length > 0 ? data : defaultData;

  // Map API fields to component fields
  const normalizeRow = (row) => ({
    kra: row.kra_desc || row.KRA_DESC || row.kra || row.KRA || "",
    unit: row.unit || row.UNIT || "%",
    actual: parseFloat(row.actual || row.ACTUAL || row.actual_og || row.ACTUAL_OG || 0),
    target: parseFloat(row.target || row.TARGET || row.target_og || row.TARGET_OG || row.repa_target || row.REPA_TARGET || 0),
    maxScore: parseFloat(row.maxscore || row.MAXSCORE || row.MAX_SCORE || 0),
    actualScore: parseFloat(row.actual_score || row.ACTUAL_SCORE || row.score || row.SCORE || 0),
    category: row.KRA_CATEGORY || row.kra_category || row.category || row.CATEGORY || " "
  });

  return (
    <div className="measurable-wrapper mt-4">
      <h4 className="fw-bold mb-3">Measurable</h4>

      {/* Table */}
      <div className="table-responsive">
        <table className="table measurable-table table-accent">
          <thead className="table-header">
            <tr>
              <th style={{ width: "35%" }}>KRA</th>
              <th>Unit</th>
              <th>
                Actual
                <i className="bi bi-info-circle ms-1"></i>
              </th>
              <th>
                Target
                <i className="bi bi-info-circle ms-1"></i>
              </th>
              <th>Max Score</th>
              <th>Actual Score</th>
              <th>KRA Category</th>
            </tr>
          </thead>

          <tbody>
            {displayData.map((row, idx) => {
              const normalizedRow = normalizeRow(row);
              return (
                <tr key={idx}>
                  <td className="Q-tds">{normalizedRow.kra}</td>
                  <td className="Q-tds">{normalizedRow.unit}</td>
                  <td className="Q-tds">{normalizedRow.actual}</td>
                  <td className="Q-tds">{normalizedRow.target}</td>
                  <td className="Q-tds">{normalizedRow.maxScore}</td>
                  <td className="Q-tds">{normalizedRow.actualScore}</td>
                  <td className="Q-tds">{normalizedRow.category}</td>
                </tr>
              );
            })}
          </tbody>
        </table>



      </div>
    </div>
  );
}