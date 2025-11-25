import React from 'react';

const MonthlySummaryTable = ({ actualScoreData, maxScoreData, quarterMonths }) => {
  // Calculate averages
  const months = quarterMonths || [];
  let totalActual = 0;
  let totalMax = 0;
  let count = 0;

  const rows = months.map((month) => {
    const actual = parseFloat(actualScoreData?.[month.value] || 0);
    const max = parseFloat(maxScoreData?.[month.value] || 0);
    
    if (actualScoreData?.[month.value] !== undefined) {
        totalActual += actual;
        totalMax += max;
        count++;
    }

    return {
      label: month.label,
      actual: actual.toFixed(1),
      max: max.toFixed(1),
    };
  });

  const averageActual = count > 0 ? (totalActual / count).toFixed(2) : '0.00';
  const averageMax = count > 0 ? (totalMax / count).toFixed(2) : '0.00';

  return (
    <div className="table-responsive mb-4">
      <table className="table table-hover border-top">
        <thead className="table-primary text-white">
          <tr>
            <th className="py-3 ps-4 bg-primary text-white border-0">Month</th>
            <th className="py-3 text-center bg-primary text-white border-0">Actual</th>
            <th className="py-3 text-center bg-primary text-white border-0">Max</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="ps-4 py-3">{row.label}</td>
              <td className="text-center py-3">{row.actual}</td>
              <td className="text-center py-3">{row.max}</td>
            </tr>
          ))}
          <tr className="fw-bold border-top border-dark">
            <td className="ps-4 py-3">Average</td>
            <td className="text-center py-3">{averageActual}</td>
            <td className="text-center py-3">{averageMax}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySummaryTable;
