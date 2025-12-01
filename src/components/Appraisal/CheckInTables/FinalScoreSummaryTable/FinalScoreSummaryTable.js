/**
 * Final Score Summary Table with 5 columns - KRA Category, KRAs, Weightage, Score, Final Score
 * @param {Object} props - Component props
 * @param {Array} props.kraListData - List of KRA data
 * @param {Set} props.selectedCategories - Set of selected KRA category IDs
 * @param {Function} props.onSelectionChange - Callback when category selection changes
 * @param {Map} props.finalScoreEdits - Map of KRA ID to edited final score
 * @param {Function} props.onFinalScoreChange - Callback when final score is edited
 * @param {boolean} props.isEditable - Whether the table is editable
 * @returns
 */
export default function FinalScoreSummaryTable({ 
  kraListData, 
  selectedCategories = new Set(),
  onSelectionChange,
  finalScoreEdits = new Map(),
  onFinalScoreChange,
  isEditable = false
}) {
  if (!kraListData || kraListData.length === 0) {
    return <div>Not Applicable</div>;
  }

  const isSelected = (kraName) => selectedCategories.has(kraName);
  const getFinalScore = (kra) => {
    if (finalScoreEdits.has(kra.KraName)) {
      return finalScoreEdits.get(kra.KraName);
    }
    return kra.FinalScore || '';
  };

  return (
    <div className="table-responsive">
      <table className="table text-start final-score-summary-table" style={{ borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
          <tr>
            <th className="text-center" style={{ width: '10%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              KRA Category
            </th>
            <th className="text-center" style={{ width: '35%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              KRAs
            </th>
            <th className="text-center" style={{ width: '15%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              Weightage
            </th>
            <th className="text-center" style={{ width: '15%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              Score
            </th>
            <th className="text-center" style={{ width: '25%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              Final Score
            </th>
          </tr>
        </thead>
        <tbody>
          {kraListData.map((kra) => (
            <tr key={kra.KraName} style={{ backgroundColor: isSelected(kra.KraName) ? '#e7f3ff' : 'transparent' }}>
              <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd", verticalAlign: 'middle' }}>
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isSelected(kra.KraName)}
                    onChange={() => onSelectionChange(kra.KraName)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </td>
              <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.KraName}</td>
              <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.KraWeight}</td>
              <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.Score}</td>
              <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>
                {isEditable && onFinalScoreChange ? (
                  <input
                    type="number"
                    className="form-control form-control-sm text-center mx-auto"
                    style={{ maxWidth: '100px' }}
                    value={getFinalScore(kra)}
                    onChange={(e) => onFinalScoreChange(kra.KraName, e.target.value)}
                    placeholder="Enter score"
                  />
                ) : (
                  getFinalScore(kra) || '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
