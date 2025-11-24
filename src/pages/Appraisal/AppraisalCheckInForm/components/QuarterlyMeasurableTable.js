import React from 'react';

const QuarterlyMeasurableTable = ({ kraListData, onKraChange, isEditable }) => {
  const handleChange = (kraId, field, value) => {
    if (onKraChange) {
      onKraChange(kraId, field, value);
    }
  };

  return (
    <div className="table-responsive mb-4">
      <div className="d-flex align-items-center mb-3">
        <h5 className="text-primary fw-bold mb-0">Measurable</h5>
      </div>
      <table className="table align-middle">
        <thead className="table-primary text-white">
          <tr>
            <th className="py-3 ps-4 bg-primary text-white border-0" style={{ width: '30%' }}>KRA</th>
            <th className="py-3 text-center bg-primary text-white border-0">Unit</th>
            <th className="py-3 text-center bg-primary text-white border-0">Actual <i className="bi bi-info-circle ms-1 small"></i></th>
            <th className="py-3 text-center bg-primary text-white border-0">Target <i className="bi bi-info-circle ms-1 small"></i></th>
            <th className="py-3 text-center bg-primary text-white border-0">Max Score</th>
            <th className="py-3 text-center bg-primary text-white border-0">Actual Score</th>
            <th className="py-3 text-center bg-primary text-white border-0">KRA Category</th>
          </tr>
        </thead>
        <tbody>
          {kraListData.map((kra) => (
            <tr key={kra.KraId || kra.KraName}>
              <td className="ps-4 py-3">{kra.KraName}</td>
              <td className="text-center py-3">{kra.Unit || '%'}</td>
              <td className="text-center py-3">
                {isEditable ? (
                  <input
                    type="number"
                    className="form-control form-control-sm text-center mx-auto"
                    style={{ maxWidth: '80px' }}
                    value={kra.KraActualScore || ''}
                    onChange={(e) => handleChange(kra.KraId, 'KraActualScore', e.target.value)}
                  />
                ) : (
                  kra.KraActualScore
                )}
              </td>
              <td className="text-center py-3">
                {isEditable ? (
                  <input
                    type="number"
                    className="form-control form-control-sm text-center mx-auto"
                    style={{ maxWidth: '80px' }}
                    value={kra.KraTarget || ''}
                    onChange={(e) => handleChange(kra.KraId, 'KraTarget', e.target.value)}
                  />
                ) : (
                  kra.KraTarget
                )}
              </td>
              <td className="text-center py-3">{kra.KraWeight}</td>
              <td className="text-center py-3">{kra.KraFinalScore || '0.0'}</td>
              <td className="text-center py-3">{kra.KraCategory || ''}</td>
            </tr>
          ))}
          {kraListData.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-3 text-muted">
                No measurable KRAs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuarterlyMeasurableTable;
