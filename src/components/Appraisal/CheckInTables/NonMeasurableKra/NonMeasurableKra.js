import './NonMeasurableKra.css';
import { useState, useMemo } from 'react';

export default function NonMeasurableKra({
  totalActualScore,
  totalMaxScore,
  kraListData,
  role,
  isEditableBy,
}) {
  // Prepare all KRA IDs
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
  const [commentsByKra, setCommentsByKra] = useState({}); // stores local textarea comments
  const [selectedScores, setSelectedScores] = useState({});

  const handleComments = (kraId) => {
    setOpenKra((prev) => ({ ...prev, [kraId]: !prev[kraId] }));
  };

  const handleChange = (kraId, value) => {
    setCommentsByKra((prev) => ({
      ...prev,
      [kraId]: {
        ...(prev[kraId] || {}),
        [role.toLowerCase()]: value,
      },
    }));
  };

  const handleScoreSelect = (kraId, score) => {
    setSelectedScores((prev) => ({ ...prev, [kraId]: score }));
  };

  const handleSubmit = (kraId) => {
    const kraComments = commentsByKra[kraId];
    console.log('Submitted Comments for', kraId, kraComments);
    alert(`Comments for ${kraId} saved by ${role}`);
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

      {/* Header Bar */}
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

      {/* KRA Sections */}
      {Object.entries(kraListData).map(([sectionName, kraList]) => (
        <div key={sectionName} className="d-flex flex-column gap-2">
          {/* <div className="non-measurable-kra-section-headline px-3 py-2">
            <h6 className="fw-semibold mb-0">{sectionName}</h6>
          </div> */}

          <table className="table mb-0">
            <tbody>
              {kraList.map((kra, index) => {
                const kraId = `${sectionName}-${kra.KraName}`;
                const selectedScore = selectedScores[kraId] || 1;
                const isOpen = openKra[kraId] ?? true;

                const kraComments = commentsByKra[kraId] || {};
                const appraiseeComment =
                  kraComments.appraisee || kra.comments?.appraisee || '';
                const appraiserComment =
                  kraComments.appraiser || kra.comments?.appraiser || '';
                const reviewerComment =
                  kraComments.reviewer || kra.comments?.reviewer || '';

                const isEditable = isEditableBy(role.toLowerCase());

                return (
                  <>
                    <tr key={`${kraId}-row`}>
                      <td style={{ width: '50%' }}>
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-1">
                            <span className="fw-bold">
                              {index + 1}. {kra.KraName}
                            </span>
                            <span className="text-danger">*</span>
                            <i className="bi bi-info-circle text-primary"></i>
                          </div>
                          <div className="text-primary small d-flex align-items-start">{kra.KraDescription}</div>
                        </div>
                      </td>

                      <td style={{ width: '30%' }}>
                        <div className="d-flex gap-2 justify-content-center">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              className={`score-btn ${
                                selectedScore === score
                                  ? 'btn-primarys'
                                  : 'btn-outline-primarys'
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
                          {selectedScore}
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

                    {/* Comment Section */}
                    {isOpen && (
                      <tr key={`${kraId}-comment`}>
                        <td colSpan={4}>
                          <div className="px-4 py-3 bg-light rounded d-flex flex-column align-items-start">
                            <div className="mb-2">
                              <label className="fw-semibold text-muted me-2">
                                Appraisee Comment:
                              </label>
                              <span>{appraiseeComment || 'None'}</span>
                            </div>

                            <div className="mb-2">
                              <label className="fw-semibold text-muted me-2">
                                Appraiser Comment:
                              </label>
                              <span>{appraiserComment || 'None'}</span>
                            </div>

                            <div className="mb-3">
                              <label className="fw-semibold text-muted me-2">
                                Reviewer Comment:
                              </label>
                              <span>{reviewerComment || 'None'}</span>
                            </div>

                            {isEditable && (
                              <>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  placeholder="Enter Your Comment"
                                  value={kraComments[role.toLowerCase()] || ''}
                                  onChange={(e) =>
                                    handleChange(kraId, e.target.value)
                                  }
                                />
                                {/* <div className="text-end mt-2">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleSubmit(kraId)}
                                  >
                                    Submit
                                  </button>
                                </div> */}
                              </>
                            )}
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
