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
      <table className="table text-start">
        <thead className="table-primary">
          <tr>
            <th className="text-start" style={{ width: '70%' }}>
              KRAs
            </th>
            <th className="text-center" style={{ width: '30%' }}>
              Weightage
            </th>
          </tr>
        </thead>
        <tbody>
          {kraListData.map((kra) => (
            <tr key={kra.KraName}>
              <td className="text-start">{kra.KraName}</td>
              <td className="text-center">{kra.KraWeight}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="fw-bold">
            <td className="text-start">Total Score</td>
            <td className="text-center">
              {kraListData.reduce((acc, kra) => acc + kra.KraWeight, 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
