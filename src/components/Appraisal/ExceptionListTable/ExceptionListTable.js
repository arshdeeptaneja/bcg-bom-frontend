import './ExceptionListTable.css';

/**
 *
 * @param {Object} props - The component props.
 * @param {Object} props.exceptionListData - The exception list data.
 * @param {string} props.exceptionListData.exceptionId - The exception id.
 * @param {string} props.exceptionListData.employee - The employee Object who has raised this exception
 * @param {string} props.exceptionListData.exceptionDescription - The exception description.
 * @param {string} props.exceptionListData.preExceptionScore - The pre-exception score.
 * @param {string} props.exceptionListData.postExceptionScore - The post-exception score.
 * @param {string} props.exceptionListData.exceptionStatus - The exception status.
 * @returns
 */
export default function ExceptionListTable({ exceptionListData }) {
  return (
    <div className="table-responsive ">
      <table className="table">
        <thead className="table-primary align-middle">
          <tr>
            <th className="text-start">Exception ID</th>
            <th className="text-center">Employee Number</th>
            <th className="text-center">Employee Name</th>
            <th className="text-center">Exception Description</th>
            <th className="text-center">Pre-Exception Score</th>
            <th className="text-center">Post-Exception Score</th>
            <th className="text-center">Exception Status</th>
            <th className="text-center">Exception Details</th>
          </tr>
        </thead>
        {exceptionListData.length == 0 && (
          <tbody>
            <tr>
              <td colSpan="8" className="text-center bg-danger bg-opacity-10 text-danger">
                No data found
              </td>
            </tr>
          </tbody>
        )}
        {exceptionListData.length > 0 && (
          <tbody>
            {exceptionListData.map((exception) => (
              <tr key={exception.exceptionId}>
                <td className="text-start">{exception.exceptionId}</td>
                <td className="text-center">{exception.employee.empNo}</td>
                <td className="text-center">{exception.employee.name}</td>
                <td className="text-center">{exception.exceptionDescription}</td>
                <td className="text-center">{exception.preExceptionScore}</td>
                <td className="text-center">{exception.postExceptionScore}</td>
                <td className="text-center">{exception.exceptionStatus}</td>
                <td className="text-center">
                  <div className="action-buttons d-flex flex-column gap-2">
                    <div className="btn btn-primary">View Appraisal</div>
                    <div className="btn btn-outline-primary">Review Exception</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
