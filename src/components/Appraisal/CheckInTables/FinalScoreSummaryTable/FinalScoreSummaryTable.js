// /**
//  * Final Score Summary Table with 5 columns - KRA Category, KRAs, Weightage, Score, Final Score
//  * @param {Object} props - Component props
//  * @param {Array} props.kraListData - List of KRA data
//  * @param {Set} props.selectedCategories - Set of selected KRA category IDs
//  * @param {Function} props.onSelectionChange - Callback when category selection changes
//  * @param {Map} props.finalScoreEdits - Map of KRA ID to edited final score
//  * @param {Function} props.onFinalScoreChange - Callback when final score is edited
//  * @param {boolean} props.isEditable - Whether the table is editable
//  * @returns
//  */
// export default function FinalScoreSummaryTable({ 
//   kraListData, 
//   selectedCategories = new Set(),
//   onSelectionChange,
//   finalScoreEdits = new Map(),
//   onFinalScoreChange,
//   isEditable = false
// }) {
//   if (!kraListData || kraListData.length === 0) {
//     return <div>Not Applicable</div>;
//   }

//   const isSelected = (kraName) => selectedCategories.has(kraName);
//   const getFinalScore = (kra) => {
//     if (finalScoreEdits.has(kra.KraName)) {
//       return finalScoreEdits.get(kra.KraName);
//     }
//     return kra.FinalScore || '';
//   };

//   console.log("KRA List Data in Final Score Summary Table: ",kraListData);

//   return (
//     <div className="table-responsive">
//       <table className="table text-start final-score-summary-table" style={{ borderCollapse: 'collapse', border: '1px solid #ddd' }}>
//         <thead style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
//           <tr>
//             <th className="text-center" style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
//               KRA Category
//             </th>
//             <th className="text-center" style={{ width: '35%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
//               KRAs
//             </th>
//             <th className="text-center" style={{ width: '15%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
//               Weightage
//             </th>
//             <th className="text-center" style={{ width: '15%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
//               Score
//             </th>
//             <th className="text-center" style={{ width: '25%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
//               Final Score
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {kraListData
//             .filter(kra => kra.Category === "Business Dimension")  
//           .map((kra) => (
//             <tr key={kra.KraName} style={{ backgroundColor: isSelected(kra.KraName) ? '#e7f3ff' : 'transparent' }}>
//               <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd", verticalAlign: 'middle' }}>
//                 {onSelectionChange && (
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     checked={isSelected(kra.KraName)}
//                     onChange={() => onSelectionChange(kra.KraName)}
//                     style={{ cursor: 'pointer' }}
//                   />
//                 )}
//               </td>
//               <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.KraName}</td>
//               <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.KraWeight}</td>
//               <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.SelfScore}</td>
//               <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}> {kra.PostAppealScore}
//                 {/* {isEditable && onFinalScoreChange ? (
//                   <input
//                     type="number"
//                     className="form-control form-control-sm text-center mx-auto"
//                     style={{ maxWidth: '100px' }}
//                     value={getFinalScore(kra)}
//                     onChange={(e) => onFinalScoreChange(kra.KraName, e.target.value)}
//                     placeholder="Enter score"
//                   />
//                 ) : (
//                   getFinalScore(kra) || '-'
//                 )} */}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



/**
 * Final Score Summary Table (Dynamic by View Type)
 * @param {Array} kraListData
 * @param {string} viewType = "self" | "repa" | "reva" | "addAppeal" | "appealReview"
 * @param {Function} onFinalScoreChange (only when viewType === 'addAppeal')
 */
import React, { useState } from "react";

/**
 * FinalScoreSummaryTable
 * - In addAppeal view: FinalScore is editable only when row checkbox (Action) is checked
 */
export default function FinalScoreSummaryTable({
  kraListData = [],
  viewType = "self",
  finalScoreEdits = new Map(),
  onFinalScoreChange,
  isEditable = false
}) {
  // hooks always at top
  const [editableRows, setEditableRows] = useState({}); // { [kraName]: true }

  if (!kraListData || kraListData.length === 0) return <div>Not Applicable</div>;

  // Column configuration
  const viewConfig = {
    self: [
      { key: "KraName", label: "KRAs" },
      { key: "KraWeight", label: "Weightage" },
    ],
    repa: [
      { key: "KraName", label: "KRAs" },
      { key: "KraWeight", label: "Weightage" },
      { key: "ReportingAuthorityScore", label: "Reporting Score" },
    ],
    reva: [
      { key: "KraName", label: "KRAs" },
      { key: "KraWeight", label: "Weightage" },
      { key: "ReportingAuthorityScore", label: "Reporting Score" },
      { key: "ReviewingAuthorityScore", label: "Reviewing Authority" },
    ],
    addAppeal: [
      { key: "Action", label: "" },
      { key: "KraName", label: "KRAs" },
      { key: "KraWeight", label: "Weightage" },
      { key: "Score", label: "Score" },
      { key: "FinalScore", label: "Final Score" },
    ],
    appealReview: [
      { key: "Category", label: "Category" },
      { key: "Roles", label: "Roles" },
      { key: "Actual", label: "Actual" },
      { key: "KraWeight", label: "Weightage" },
      { key: "Score", label: "Score" },
    ],
  };

  const columns = viewConfig[viewType] || viewConfig.self;

  const getFinalScore = (kra) =>
    finalScoreEdits && finalScoreEdits.has(kra.KraName)
      ? finalScoreEdits.get(kra.KraName)
      : kra.FinalScore ?? "";

  // For self view show only Business Dimension
  const filteredData =
    (viewType === "self" )
      ? kraListData.filter((kra) => kra.Category === "Business Dimension")
      : kraListData;

  const toggleEditable = (kraName) => {
    setEditableRows((prev) => ({ ...prev, [kraName]: !prev[kraName] }));
  };

  return (
    <div className="table-responsive">
      <table className="table text-start final-score-summary-table" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-center"
                style={{ padding: "10px 12px", borderBottom: "1px solid #ddd" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredData.map((kra) => {
            const kraKey = kra.KraName ?? kra.Id ?? JSON.stringify(kra);
            const isRowEditable = !!editableRows[kraKey];

            return (
              <tr key={kraKey}>
                {columns.map((col) => {
                  // FinalScore cell in addAppeal - editable only when checkbox checked
                  if (viewType === "addAppeal" && col.key === "FinalScore") {
                    return (
                      <td key={col.key} className="text-center" style={{ padding: "8px 12px",display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          style={{
                            maxWidth: "100px",
                            background: isRowEditable ? "white" : "#f3f3f3",
                            cursor: isRowEditable ? "text" : "not-allowed",
                          }}
                          disabled={!isRowEditable}
                          value={getFinalScore(kra)}
                          onChange={(e) => onFinalScoreChange?.(kra.KraName, e.target.value)}
                          aria-label={`Final score for ${kra.KraName}`}
                        />
                      </td>
                    );
                  }

                  // Action column in addAppeal - checkbox to enable edit
                  if (viewType === "addAppeal" && col.key === "Action") {
                    return (
                      <td key={col.key} className="text-center" style={{ padding: "8px 12px" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isRowEditable}
                            onChange={() => toggleEditable(kraKey)}
                            aria-label={`Enable edit for ${kra.KraName}`}
                            disabled={isEditable}
                          />
                          {/* <span style={{ fontSize: 13 }}>Edit</span> */}
                        </label>
                      </td>
                    );
                  }

                  // Score cell in other views — default render (and for addAppeal Score column)
                  return (
                    <td key={col.key} className="text-center" style={{ padding: "8px 12px" }}>
                      {kra[col.key] ?? "-"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



// export default function FinalScoreSummaryTable({
//   kraListData,
//   viewType = "self",
//   finalScoreEdits = new Map(),
//   onFinalScoreChange,
// }) {
//   if (!kraListData || kraListData.length === 0) return <div>Not Applicable</div>;

//   console.log("KRA List Data in Final Score Summary Table: ", kraListData);
//   // Column configuration based on view type
//   const viewConfig = {
//     self: [
//       { key: "KraName", label: "KRAs" },
//       { key: "KraWeight", label: "Weightage" },
//     ],
//     repa: [
//       { key: "KraName", label: "KRAs" },
//       { key: "KraWeight", label: "Weightage" },
//       { key: "ReportingAuthorityScore", label: "Reporting Score" },
//     ],
//     reva: [
//       { key: "KraName", label: "KRAs" },
//       { key: "KraWeight", label: "Weightage" },
//       { key: "ReportingAuthorityScore", label: "Reporting Score" },
//       { key: "ReviewingAuthorityScore", label: "Reporting Authority" },
//     ],
//     addAppeal: [
//       { key: "KraName", label: "KRAs" },
//       { key: "KraWeight", label: "Weightage" },
//       { key: "Score", label: "Score" },
//       { key: "Performance", label: "Final Score (Editable)" },
//     ],
//     appealReview: [
//       { key: "Category", label: "Category" },
//       { key: "Roles", label: "Roles" },
//       { key: "Actual", label: "Actual" },
//       { key: "KraWeight", label: "Weightage" },
//       { key: "Score", label: "Score" },
//       { key: "Action", label: "Action" },
//     ],
//   };

//   const columns = viewConfig[viewType];

//   const getFinalScore = (kra) =>
//     finalScoreEdits.has(kra.KraName)
//       ? finalScoreEdits.get(kra.KraName)
//       : kra.FinalScore || "";

//     const filteredData =
//     (viewType === "self" )
//       ? kraListData.filter((kra) => kra.Category === "Business Dimension")
//       : kraListData;

//   return (
//     <div className="table-responsive">
//       <table className="table text-start final-score-summary-table">
//         <thead>
//           <tr>
//             {columns.map((col) => (
//               <th key={col.key} className="text-center">
//                 {col.label}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {filteredData.map((kra) => (
//             <tr key={kra.KraName}>
//               {columns
              
//               .map((col) => {
//                 // 👇 Editable final score input for addAppeal
//                 if (col.key === "FinalScore" && viewType === "addAppeal") {
//                   return (
//                     <td key={col.key} className="text-center">
//                       <input
//                         type="number"
//                         className="form-control form-control-sm text-center"
//                         style={{ maxWidth: "80px" }}
//                         value={getFinalScore(kra)}
//                         onChange={(e) =>
//                           onFinalScoreChange?.(kra.KraName, e.target.value)
//                         }
//                       />
//                     </td>
//                   );
//                 }

//                 // 👇 Appeal Review Mode → special screenshot UI
//                 if (viewType === "appealReview") {
//                   if (col.key === "Action") {
//                     return (
//                       <td key={col.key} className="text-center">
//                         <div className="d-flex gap-3 justify-content-center">
//                           <span>ACCEPT AS IS</span>
//                           <span>ACCEPT AND EDIT</span>
//                           <span>REJECT</span>
//                         </div>
//                       </td>
//                     );
//                   }
//                 }

//                 return (
//                   <td key={col.key} className="text-center">
//                     {kra[col.key] ?? "-"}
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
