/**
 * This is the summary table for the check-in form.
 * @param {Object} props - The properties of the component.
 * @param {Object} props.actualScoreData - Actual score achieved by the employee for each month
 * @param {Object} props.maxScoreData - Maximum score possible for each month
 * @returns
 */

export default function CheckInSummaryTable({ actualScoreData, maxScoreData }) {
  // Calculate average score and average max score
  // FIXME: Remove this if we have a better way to calculate average score and average max score from the SPs
  // AverageActualScore
  const averageActualScore =
    Object.values(actualScoreData).reduce((acc, score) => acc + score, 0) /
    Object.values(actualScoreData).length;

  // AverageMaxScore
  const averageMaxScore =
    Object.values(maxScoreData).reduce((acc, score) => acc + score, 0) /
    Object.values(maxScoreData).length;
  return (
    <div className="check-in-summary-table  text-center">
      <table className="table">
        <thead className="table-primary">
          <tr>
            <th className="text-center fw-semibold">Month</th>
            <th className="text-center fw-semibold">Actual Score</th>
            <th className="text-center fw-semibold">Max Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(actualScoreData).map(([month, score]) => (
            <tr key={month}>
              <td>{month}</td>
              <td>{score}</td>
              <td>{maxScoreData[month]}</td>
            </tr>
          ))}

          {/* Average Score */}
          <tr>
            <td>Average Score</td>
            <td>{averageActualScore}</td>
            <td>{averageMaxScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
