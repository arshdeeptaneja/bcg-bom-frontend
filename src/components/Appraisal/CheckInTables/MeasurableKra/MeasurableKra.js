import './MeasurableKra.css';
import { useState } from 'react';
/**
 * Table with 6 columns - Measurable KRA Name, Actual Score, Target, Weightage, Final Score and Comments
 * @param {Object} props - List of KRA data
 * @param {Object} props.kraListData - List of KRA data
 * @param {String} props.kraListData.KraName - KRA Name
 * @param {String} props.kraListData.KraActualScore - KRA Actual Score
 * @param {String} props.kraListData.KraTarget - KRA Target
 * @param {String} props.kraListData.KraWeight - KRA Weightage
 * @param {String} props.kraListData.KraFinalScore - KRA Final Score
 * @param {String} props.kraListData.KraComments - KRA Comments
 * @returns
 */
export default function MeasurableKra({ totalActualScore, totalMaxScore, kraListData, onKraChange, isEditable }) {
  const [openKra, setOpenKra] = useState(null);

  const handleComments = (kraName) => {
    setOpenKra((prev) => (prev === kraName ? null : kraName));
  };

  const handleChange = (kraId, field, value) => {
    if (onKraChange) {
      onKraChange(kraId, field, value);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="table-headline d-flex flex-row justify-content-between">
        <h5 className="fw-bold">Measurable</h5>
        <div className="d-flex flex-row gap-2">
          <span className="text-muted">Discretionary Measurable Score:</span>
          <span className="fw-bold">
            {totalActualScore.toFixed(1)} / {totalMaxScore.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table text-center align-middle">
          <thead className="table-primary">
            <tr>
              <th className="text-center">Measurable KRA Name</th>
              <th className="text-center" style={{ width: '120px' }}>Actual Score</th>
              <th className="text-center" style={{ width: '120px' }}>Target</th>
              <th className="text-center">Weightage</th>
              <th className="text-center">Final Score</th>
              <th className="text-center">Comments</th>
            </tr>
          </thead>
          <tbody>
            {kraListData.map((kra) => (
              <>
                <tr key={`${kra.KraName}-row`}>
                  <td className='table-Tds text-start'>{kra.KraName}</td>
                  <td className='table-Tds'>
                    {isEditable ? (
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        value={kra.KraActualScore || ''}
                        onChange={(e) => handleChange(kra.KraId, 'KraActualScore', e.target.value)}
                      />
                    ) : (
                      kra.KraActualScore
                    )}
                  </td>
                  <td className='table-Tds'>
                    {isEditable ? (
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        value={kra.KraTarget || ''}
                        onChange={(e) => handleChange(kra.KraId, 'KraTarget', e.target.value)}
                      />
                    ) : (
                      kra.KraTarget
                    )}
                  </td>
                  <td className='table-Tds'>{kra.KraWeight}</td>
                  <td className='table-Tds'>{kra.KraFinalScore}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => handleComments(kra.KraName)}
                      aria-label="Add comment"
                    >
                      <i className={`bi bi-chat-left-text-fill ${kra.KraComments ? 'text-success' : 'text-primary'}`}></i>
                    </button>
                  </td>
                </tr>

                {/* Comments Field is shown when the comments button is clicked */}
                {openKra === kra.KraName && (
                  <tr key={`${kra.KraName}-comment`}>
                    <td colSpan={6}>
                      <div className="text-start p-2 bg-light">
                        <label className="form-label fw-semibold">Appraisee Comment:</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Enter Your Comment"
                          value={kra.KraComments || ''}
                          onChange={(e) => handleChange(kra.KraId, 'KraComments', e.target.value)}
                          disabled={!isEditable}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
