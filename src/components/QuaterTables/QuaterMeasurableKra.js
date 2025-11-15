import React, { useState } from "react";
import "./QuaterMeasurableKra.css";

export default function QuaterlyMeasurableKraTable() {
  const [activeMonth, setActiveMonth] = useState("April");

  const months = ["April", "May", "June"];

  const data = [
    {
      kra: "% Growth in Terminal Total o/s advances",
      unit: "%",
      actual: -8.1,
      target: 0.9,
      maxScore: 4.0,
      actualScore: 0.0,
      category: " "
    },
    {
      kra: "% Growth in Terminal Agri o/s advances",
      unit: "%",
      actual: -0.9,
      target: 1.2,
      maxScore: 3.0,
      actualScore: 0.0,
      category: " "
    },
    {
      kra: "% Growth in Terminal MSME o/s advances",
      unit: "%",
      actual: -4.4,
      target: 0.3,
      maxScore: 3.0,
      actualScore: 0.0,
      category: " "
    },
    {
      kra: "% Growth in Average CASA Deposits",
      unit: "%",
      actual: -27.4,
      target: 0.5,
      maxScore: 8.5,
      actualScore: -3.0,
      category: " "
    },
    {
      kra: "% Growth in Terminal CASA deposits",
      unit: "%",
      actual: -46.0,
      target: 0.5,
      maxScore: 3.0,
      actualScore: 0.0,
      category: " "
    },
    {
      kra: "% Growth in Terminal Total Core deposits",
      unit: "%",
      actual: -16.1,
      target: 0.5,
      maxScore: 3.0,
      actualScore: 0.0,
      category: " "
    },
    {
      kra: "% Growth in Average Retail Term Deposits",
      unit: "%",
      actual: 3.3,
      target: 0.5,
      maxScore: 3.0,
      actualScore: 3.9,
      category: " "
    }
  ];

  return (
    <div className="measurable-wrapper mt-4">

    
      <h4 className="fw-bold mb-3">Measurable</h4>

   

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered measurable-table">
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
            {data.map((row, idx) => (
              <tr key={idx}>
                <td className="Q-tds">{row.kra}</td>
                <td className="Q-tds">{row.unit}</td>
                <td className="Q-tds">{row.actual}</td>
                <td className="Q-tds">{row.target}</td>
                <td className="Q-tds">{row.maxScore}</td>
                <td className="Q-tds">{row.actualScore}</td>
                <td className="Q-tds">{row.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
