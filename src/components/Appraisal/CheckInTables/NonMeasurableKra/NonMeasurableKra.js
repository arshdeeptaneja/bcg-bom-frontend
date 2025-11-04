import './NonMeasurableKra.css';
import { useState, useMemo } from 'react';

/**
 *
 * @param {Object} props - List of KRA data
 * @param {String} props.totalActualScore - Total Actual Score
 * @param {String} props.totalMaxScore - Total Max Score
 * @param {Object} props.kraListData - Map of KRA data by section, where the key is the section name and the value is an array of KRA data
 * @param {Object} props.kraListData.KraSection - List of KRA data for the section with name and description
 * @param {String} props.kraListData.KraSection.KraName - KRA Name
 * @param {String} props.kraListData.KraSection.KraDescription - KRA Description
 * @returns
 */
export default function NonMeasurableKra({ totalActualScore, totalMaxScore, kraListData }) {
  // Generate all KRA IDs and initialize all comments as open by default
  const allKraIds = useMemo(() => {
    const ids = {};
    Object.entries(kraListData).forEach(([sectionName, kraList]) => {
      kraList.forEach((kra) => {
        const kraId = `${sectionName}-${kra.KraName}`;
        ids[kraId] = true;
      });
    });
    return ids;
  }, [kraListData]);

  const [openKra, setOpenKra] = useState(allKraIds);
  const [commentsByKra, setCommentsByKra] = useState({});
  const [selectedScores, setSelectedScores] = useState({});

  const handleComments = (kraId) => {
    setOpenKra((prev) => ({
      ...prev,
      [kraId]: !prev[kraId],
    }));
  };

  const handleChange = (kraId, value) => {
    setCommentsByKra((prev) => ({ ...prev, [kraId]: value }));
  };

  const handleScoreSelect = (kraId, score) => {
    setSelectedScores((prev) => ({ ...prev, [kraId]: score }));
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Section Headline */}
      <div className="table-headline d-flex flex-row justify-content-between">
        <h5 className="fw-bold">Non-Measurable</h5>
        <div className="d-flex flex-row gap-2">
          <span className="text-muted">Discretionary Measurable Score:</span>
          <span className="fw-bold">
            {totalActualScore.toFixed(1)} / {totalMaxScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Table Header Bar */}
      <div className="table-header-bar p-3 d-flex flex-row justify-content-between fw-bold">
        <span className="text-start" style={{ width: '50%' }}>
          Non-Measurable KRA
        </span>
        <span className="text-center" style={{ width: '30%' }}>
          Select Score
        </span>
        <span className="text-center" style={{ width: '10%' }}>
          Final Score
        </span>
        <span className="text-end" style={{ width: '10%' }}>
          Comments
        </span>
      </div>

      {/* Sections and KRAs */}
      {Object.entries(kraListData).map(([sectionName, kraList]) => (
        <div key={sectionName} className="d-flex flex-column gap-2">
          {/* Section Header */}
          <div className="non-measurable-kra-section-headline px-3 py-2">
            <h6 className="fw-semibold mb-0">{sectionName}</h6>
          </div>

          {/* KRA Table */}
          <table className="table">
            <tbody>
              {kraList.map((kra, index) => {
                const kraId = `${sectionName}-${kra.KraName}`;
                const selectedScore = selectedScores[kraId] || 1; // Default to 1 if no score is selected
                const isOpen = openKra[kraId] ?? true;

                return (
                  <>
                    <tr key={`${kraId}-row`}>
                      <td style={{ width: '50%' }} className="text-start">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-1">
                            <span className="fw-bold">
                              {index + 1}. {kra.KraName}
                            </span>
                            <span className="text-danger">*</span>
                            <i className="bi bi-info-circle text-primary"></i>
                          </div>
                          <div className="text-primary small">{kra.KraDescription}</div>
                        </div>
                      </td>
                      <td style={{ width: '30%' }}>
                        <div className="d-flex gap-2 justify-content-center">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              className={`btn score-btn ${
                                selectedScore === score ? 'btn-primary' : 'btn-outline-primary'
                              }`}
                              onClick={() => handleScoreSelect(kraId, score)}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={{ width: '10%' }}>
                        <div className="final-score-box border border-primary rounded px-2 py-1 text-center">
                          {selectedScore || ''}
                        </div>
                      </td>
                      <td className="text-center" style={{ width: '10%' }}>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => handleComments(kraId)}
                          aria-label="Add comment"
                        >
                          <i className="bi bi-chat-left-text-fill text-primary align-middle"></i>
                        </button>
                      </td>
                    </tr>

                    {/* Comments Field shown when the comments button is clicked */}
                    {isOpen && (
                      <tr key={`${kraId}-comment`}>
                        <td colSpan={4}>
                          <div className="text-start px-3 py-2">
                            <label className="form-label fw-semibold">Appraisee Comment:</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Enter Your Comment"
                              value={commentsByKra[kraId] || ''}
                              onChange={(e) => handleChange(kraId, e.target.value)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
