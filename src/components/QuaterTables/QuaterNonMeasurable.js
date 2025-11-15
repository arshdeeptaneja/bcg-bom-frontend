import { useState, useMemo } from 'react';

export default function QuaterNonMeasurable({
  totalActualScore = 0,
  totalMaxScore = 0,
  kraListData = {},
  role = "",
  isEditableBy = () => false,
}) {

  const hasKras =
    kraListData &&
    typeof kraListData === "object" &&
    Object.keys(kraListData).length > 0;

  return (
    <div className="d-flex flex-column gap-4">

      {/* Section Headline */}
      <div className="table-headline d-flex flex-row justify-content-between">
        <h5 className="fw-bold">Non - Measurable</h5>

        <div className="d-flex flex-row gap-2">
          <span className="text-muted">Discretionary Non - Measurable Score:</span>
          <span className="fw-bold">
            {totalActualScore.toFixed(1)} / {totalMaxScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* HEADER ROW */}
      <div
        className="p-3 fw-bold text-white"
        style={{
          backgroundColor: "var(--accent-color)",
          display: "grid",
          gridTemplateColumns: "40% 15% 15% 15% 15%",
          borderRadius: "4px",
        }}
      >
        <div>Non-Measurable KRA</div>
        <div className="text-center">Actual Score</div>
        <div className="text-center">Total Score</div>
        <div className="text-center">Max Score</div>
        <div className="text-center">KRA Category</div>
      </div>

      {/* WHEN NO KRAs — Exactly Like Screenshot */}
      {!hasKras && (
        <div
          className="py-4 px-3 text-muted"
          style={{
            border: "1px solid #e1e1e1",
            borderTop: "none",
            background: "#fff",
          }}
        >
          Not applicable.
        </div>
      )}

      {/* Existing KRA Rendering (only if data exists) */}
      {hasKras &&
        Object.entries(kraListData).map(([section, list]) => (
          <div key={section} className="d-flex flex-column">
            <table className="table mb-0">
              <tbody>
                {list.map((kra, idx) => (
                  <tr key={idx}>
                    <td style={{ width: "40%" }}>
                      <div className="fw-semibold text-dark">{kra.KraName}</div>
                      <div className="text-primary small">
                        {kra.KraDescription}
                      </div>
                    </td>

                    <td className="text-center">{kra.actual || "-"}</td>
                    <td className="text-center">{kra.total || "-"}</td>
                    <td className="text-center">{kra.max || "-"}</td>
                    <td className="text-center">{kra.category || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

    </div>
  );
}
