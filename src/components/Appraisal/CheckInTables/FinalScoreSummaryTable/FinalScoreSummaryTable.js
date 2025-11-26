/**
 * Tabe with 2 columns - KRA Name and Weightage
 * @param {Object} props - List of KRA data
 * @param {Object} props.kraListData - List of KRA data
 * @param {String} props.kraListData.KraName - KRA Name
 * @param {String} props.kraListData.KraWeight - KRA Weightage
 * @returns
 */
export default function FinalScoreSummaryTable({ kraListData }) {
  if (!kraListData || kraListData.length === 0) {
    return <div>Not Applicable</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table text-start final-score-summary-table" style={{ borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
          <tr>
            <th className="text-start" style={{ width: '70%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              KRAs
            </th>
            <th className="text-center" style={{ width: '30%', padding: '12px 16px', border: '1px solid var(--accent-color)', fontWeight: 500 }}>
              Weightage
            </th>
          </tr>
        </thead>
        <tbody>
          {kraListData.map((kra) => (
            <tr key={kra.KraName}>
              <td className="text-start" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.KraName}</td>
              <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>{kra.KraWeight}</td>
            </tr>
          ))}
        </tbody>
        <tfoot style={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}>
          <tr className="fw-bold">
            <td className="text-start" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>Total Score</td>
            <td className="text-center" style={{ padding: "12px 16px", border: "1px solid #ddd" }}>
              {kraListData.reduce((acc, kra) => acc + kra.KraWeight, 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
