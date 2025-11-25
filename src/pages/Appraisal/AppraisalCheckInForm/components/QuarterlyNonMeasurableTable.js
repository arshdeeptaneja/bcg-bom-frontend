import React from 'react';

const QuarterlyNonMeasurableTable = ({ kraListData, totalActualScore, totalMaxScore }) => {
  // Flatten the grouped data if it's grouped by section, or use as is if it's an array
  // The parent component passes `nonMeasurableSectionsForMonth` which is an object { SectionName: [kras] }
  // But the screenshot shows a flat list or maybe just one section.
  // I'll handle both object (grouped) and array.
  
  let allKras = [];
  if (Array.isArray(kraListData)) {
    allKras = kraListData;
  } else if (typeof kraListData === 'object') {
    Object.values(kraListData).forEach(group => {
      if (Array.isArray(group)) allKras = [...allKras, ...group];
    });
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-dark fw-bold mb-0">Non - Measurable</h5>
        <div className="text-muted fw-bold">
          Discretionary Non - Measurable Score <span className="text-dark">{totalActualScore?.toFixed(1) || '0.0'}/{totalMaxScore?.toFixed(1) || '0.0'}</span>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-primary text-white">
            <tr>
              <th className="py-3 ps-4 bg-primary text-white border-0" style={{ width: '30%' }}>Non-Measurable KRA <i className="bi bi-info-circle ms-1 small"></i></th>
              <th className="py-3 text-center bg-primary text-white border-0">Actual Score</th>
              <th className="py-3 text-center bg-primary text-white border-0">Total Score</th>
              <th className="py-3 text-center bg-primary text-white border-0">Max Score</th>
              <th className="py-3 text-center bg-primary text-white border-0">Final Score</th>
              <th className="py-3 text-center bg-primary text-white border-0">Comments</th>
              <th className="py-3 text-center bg-primary text-white border-0">KRA Category</th>
            </tr>
          </thead>
          <tbody>
            {allKras.length > 0 ? (
              allKras.map((kra) => (
                <tr key={kra.KraId || kra.KraName}>
                  <td className="ps-4 py-3">{kra.KraName}</td>
                  <td className="text-center py-3">{kra.KraActualScore}</td>
                  <td className="text-center py-3">{kra.KraTotalScore || '-'}</td>
                  <td className="text-center py-3">{kra.KraWeight}</td>
                  <td className="text-center py-3">{kra.KraFinalScore}</td>
                  <td className="text-center py-3">{kra.KraComments || '-'}</td>
                  <td className="text-center py-3">{kra.KraCategory || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="ps-4 py-3">
                  Not applicable.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuarterlyNonMeasurableTable;
