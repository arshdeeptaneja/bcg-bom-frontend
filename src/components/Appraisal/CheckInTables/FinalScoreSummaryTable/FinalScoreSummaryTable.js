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
            <tr key={kra.KraName}  style={{padding: "10px 23px"}}>
              <td className="text-start" style={{padding: "10px 23px"}}>{kra.KraName}</td>
              <td className="text-center" style={{padding: "10px 23px"}}>{kra.KraWeight}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="fw-bold" style={{padding: "10px 23px"}}>
            <td className="text-start" style={{padding: "10px 23px"}}>Total Score</td>
            <td className="text-center" style={{padding: "10px 23px"}}>
              {kraListData.reduce((acc, kra) => acc + kra.KraWeight, 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
