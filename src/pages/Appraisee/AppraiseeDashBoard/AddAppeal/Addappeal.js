import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { BackButton } from '../../../../components/common';
import { CheckInDescriptionSection } from '../../../../components/Appraisal';
import { appraisalAPI } from '../../../../services/api';

function AddAppeal() {
  const location = useLocation();
  const navigate = useNavigate();

  const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {
    financialYear: "2025",
    appraisalPeriod: "Quarterly",
    quarter: "Q1",
    dateRange: "01 Apr 2025 - 30 Jun 2025",
    employee: { name: "John Doe", id: "EMP123", empNo: "36663", reportingAuthorityNo: "36664" },
    role: "APPRAISEE",
  };
  const [comments, setComments] = useState({});
  const [selected, setSelected] = useState({});
  const [scores, setScores] = useState({});
  const [file, setFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [appealId, setAppealId] = useState('');
  const [declarationOption, setDeclarationOption] = useState('');

  // Fetch KRA data from API
  const { data: apiResponse, isLoading, isError, error } = useQuery({
    queryKey: ['reporteeAppraisalDashboard', employee?.empNo, financialYear, quarter],
    queryFn: () => appraisalAPI.getReporteeAppraisalDashboard({
      empNo: employee?.empNo || '36663',
      financialYear: financialYear || '2025',
      quarter: quarter || 'Q1',
    }),
    enabled: !!(employee?.empNo || financialYear || quarter),
  });

  // Transform API response to component structure
  const { measurable, nonMeasurable } = useMemo(() => {
    if (!apiResponse) {
      // Default mock data if API not available
      return {
        measurable: [
          { id: 1, title: "Compliance", actual: 3, target: 5, max: 4 },
          { id: 2, title: "Mandatory e-learnings", actual: 4, target: 5, max: 6 },
        ],
        nonMeasurable: [
          {
            id: 3,
            title: "Digital Mindset & Adaptability",
            desc: "Knows customer-facing and internal digital tools, follows data management protocols and uses digital solutions creatively for efficiency",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 4,
            title: "Communication & Presence",
            desc: "Thinks and articulates clearly & effective in oral and written communication with peers, superiors and in large groups",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 5,
            title: "Integrity & Trust",
            desc: "Honors commitments and embodies reliability & fostering a culture of trustworthiness and ethical behavior",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 6,
            title: "Individual Ownership & Accountability",
            desc: "Achieves personal and team goals, upholds bank standards, commits to task completion & shows persistence and ownership of tasks/outcomes",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 7,
            title: "Discipline & Punctuality",
            desc: "Understands and follows compliance, assesses task risks to balance benefits from success & manages branch-level accounting",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 8,
            title: "Leadership Skills",
            desc: "Proactively takes initiatives, shares new ideas, works with integrity and sets performance standards for peers",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 9,
            title: "Collaboration & Team Contribution",
            desc: "Cooperates to achieve goals, encourages team spirit for task completion & manages relationships with internal clients",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
          {
            id: 10,
            title: "Decision Making",
            desc: "Able to make prudent decisions in tough business situations without constant guidance",
            addScore: 3,
            totalScore: 5,
            finalScore: 3,
          },
        ],
      };
    }

    // Transform API response - adjust based on actual API response structure
    const transformedMeasurable = (apiResponse.measurableKras || []).map((kra, index) => ({
      id: kra.kraBehaviorId || kra.id || index + 1,
      title: kra.kraName || kra.title || '',
      actual: kra.actualValue || kra.actual || 0,
      target: kra.targetValue || kra.target || 0,
      max: kra.maxScore || kra.max || 0,
      currentScore: kra.score || kra.currentScore || 0,
    }));

    const transformedNonMeasurable = (apiResponse.nonMeasurableKras || []).map((kra, index) => ({
      id: kra.kraBehaviorId || kra.id || index + 100,
      title: kra.kraName || kra.title || '',
      desc: kra.description || kra.desc || '',
      addScore: kra.addScore || kra.score || 3,
      totalScore: kra.totalScore || kra.maxScore || 5,
      finalScore: kra.finalScore || kra.score || 3,
    }));

    return {
      measurable: transformedMeasurable.length > 0 ? transformedMeasurable : [
        { id: 1, title: "Compliance", actual: 3, target: 5, max: 4 },
        { id: 2, title: "Mandatory e-learnings", actual: 4, target: 5, max: 6 },
      ],
      nonMeasurable: transformedNonMeasurable.length > 0 ? transformedNonMeasurable : [
        {
          id: 3,
          title: "Digital Mindset & Adaptability",
          desc: "Knows customer-facing and internal digital tools, follows data protocols",
          addScore: 3,
          totalScore: 5,
          finalScore: 3,
        },
      ],
    };
  }, [apiResponse]);

  // Submit appeal mutation
  const submitMutation = useMutation({
    mutationFn: ({ payload, attachment }) => appraisalAPI.submitAppealReport(payload, attachment),
    onSuccess: (response) => {
      const responseAppealId = response?.appealId || response?.id || `APPEAL-${Date.now()}`;
      setAppealId(responseAppealId);
      setShowPopup(true);
      toast.success('Appeal submitted successfully!');
    },
    onError: (error) => {
      console.error('Submit appeal error:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit appeal. Please try again.');
    },
  });

  const buildPayload = () => {
    const selectedKraIds = Object.keys(selected).filter(id => selected[id]);

    const kraData = selectedKraIds.map(id => {
      const kraId = parseInt(id);
      const measurableKra = measurable.find(k => k.id === kraId);
      const nonMeasurableKra = nonMeasurable.find(k => k.id === kraId);

      return {
        kraBehaviorId: String(kraId),
        updatedScore: scores[kraId] !== undefined ? String(scores[kraId]) : '',
        comments: comments[kraId] || '',
        kraType: measurableKra ? 'MEASURABLE' : 'NON_MEASURABLE',
      };
    });

    return {
      id: '', // Will be generated by backend
      empNo: employee?.empNo || employee?.id || '36663',
      reportingAuthorityNo: employee?.reportingAuthorityNo || '36664',
      kraData: kraData,
      declarationOption: declarationOption || 'AGREE',
    };
  };

  const handleSubmit = () => {
    if (!file) {
      toast.warning('File upload is mandatory');
      return;
    }

    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (selectedCount === 0) {
      toast.warning('Please select at least one KRA to appeal');
      return;
    }

    const payload = buildPayload();
    submitMutation.mutate({ payload, attachment: file });
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="alert alert-danger m-3">
          Error loading appraisal data: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appeal</h1>
        </div>
      </div>

      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />

        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please raise an exception if actual or target values are incorrect.
          </span>
        </div>

        <div className="final-score-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Final Score Summary</h5>
          <div className="mt-3 border rounded">
            <div
              className="w-100 d-flex text-white fw-bold px-3 py-2"
              style={{ background: "var(--accent-color)" }}
            >
              <div style={{ width: "20%" }}>KRA Category</div>
              <div style={{ width: "40%" }}>KRAs</div>
              <div style={{ width: "10%" }}>Weightage</div>
              <div style={{ width: "10%" }}>Score</div>
              <div style={{ width: "20%" }}>Final Score</div>
            </div>

            <div className="d-flex px-3 py-3 border-bottom align-items-center">
              <div style={{ width: "20%" }}>
                <input type="checkbox" disabled className="form-check-input" />
              </div>
              <div style={{ width: "40%" }}>Business Dimension</div>
              <div style={{ width: "10%" }}>70.0</div>
              <div style={{ width: "10%" }}>27.2</div>
              <div style={{ width: "20%" }}>
                <input className="form-control" />
              </div>
            </div>
          </div>
        </div>

        {/* MEASURABLE TABLE */}
        <h4 className="fw-bold mt-4" style={{ color: "var(--accent-color)" }}>Discretionary KRA</h4>
        <h5 className="fw-bold mt-3">Measurable</h5>

        <div className="border rounded mt-2">
          <table className="table mb-0">
            <thead className="table-header">
              <tr>
                <th style={{ width: '20%' }}>Select KRA</th>
                <th style={{ width: '40%' }}>KRA</th>
                <th style={{ width: '10%' }}>Actual</th>
                <th style={{ width: '10%' }}>Target</th>
                <th style={{ width: '10%' }}>Max Score</th>
                <th style={{ width: '10%' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {measurable.map((row) => (
                <tr key={row.id} className="align-middle">
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected[row.id] || false}
                      onChange={() =>
                        setSelected({ ...selected, [row.id]: !selected[row.id] })
                      }
                    />
                  </td>
                  <td>{row.title}</td>
                  <td>{row.actual}</td>
                  <td>{row.target}</td>
                  <td>{row.max}</td>
                  <td style={{ width: '10%' }}>
                    <div className="text-muted small mb-1">{!selected[row.id] ? row.currentScore || row.max : ''}</div>
                    <input
                      value={row.max}
                      disabled={!selected[row.id]}
                      className={selected[row.id] ? 'form-control text-center' : 'form-control text-center underlined-input'}
                      placeholder={selected[row.id] ? '' : '—'}
                      // value={scores[row.id] || ''}
                      onChange={(e) => setScores({ ...scores, [row.id]: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NON-MEASURABLE */}
        <h5 className="fw-bold mt-4">Non - Measurable</h5>

        {/* INSTRUCTION BOX */}
        <div className="border rounded p-3 mb-3" style={{ background: "#F8F9FA" }}>
          <h6 className="fw-bold mb-2">Please fill score in actual as per the scale below :</h6>
          <p className="mb-1 small">1. Strongly disagree: shows very poor performance across the given dimensions</p>
          <p className="mb-1 small">2. Disagree: fell short of expectations & shows weak performance in few or more of the given dimensions</p>
          <p className="mb-1 small">3. Neutral: expresses required level of proficiency on the dimension at the level</p>
          <p className="mb-1 small">4. Agree: performs well above expectations across the given dimensions</p>
          <p className="mb-1 small">5. Strongly agree: over-delivers & shows high degree of proficiency in the given dimensions</p>
        </div>

        <div className="border rounded mt-2 pb-3">
          <table className="table mb-0">
            <thead style={{ background: 'var(--accent-color)' }} className="table-header text-white">
              <tr>
                <th style={{ width: '20%' }}>Select KRA</th>
                <th style={{ width: '40%' }}>KRA</th>
                <th style={{ width: '10%' }}>Add Score</th>
                <th style={{ width: '10%' }}>Total Score</th>
                <th style={{ width: '10%' }}>Final Score</th>
                <th style={{ width: '10%' }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {nonMeasurable.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="align-top">
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input mt-2"
                        checked={selected[row.id] || false}
                        onChange={() => setSelected({ ...selected, [row.id]: !selected[row.id] })}
                      />
                    </td>
                    <td>
                      <div className="fw-bold" style={{textAlign:"left" , marginBottom:"0.4rem" , fontSize:"1rem"}}>{row.title}</div>
                      <div className="text-muted small" style={{ lineHeight: '1.2', fontStyle: 'italic', textAlign: 'left' }}>{row.desc}</div>
                    </td>
                    <td>
                      <div className="text-muted small mb-1">{!selected[row.id] ? row.addScore : ''}</div>
                      <input
                        disabled={!selected[row.id]}
                        className={selected[row.id] ? 'form-control text-center' : 'form-control text-center underlined-input'}
                        value={scores[row.id] || (selected[row.id] ? '' : row.addScore)}
                        onChange={(e) => setScores({ ...scores, [row.id]: e.target.value })}
                      />
                    </td>
                    <td>{row.totalScore}</td>
                    <td>{row.finalScore}</td>
                    <td>
                      <i
                        className="bi bi-chat-left-text-fill"
                        style={{ cursor: 'pointer', color: 'var(--accent-color)' }}
                        onClick={() => setComments({ ...comments, [row.id]: comments[row.id] || '' })}
                      />
                    </td>
                  </tr>

                  {comments[row.id] !== undefined && (
                    <tr>
                      <td colSpan={6} className="px-3">
                        <textarea
                          className="form-control mt-2"
                          rows={3}
                          placeholder="Enter Your Comment"
                          value={comments[row.id]}
                          onChange={(e) => setComments({ ...comments, [row.id]: e.target.value })}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* FILE UPLOAD */}
        <div className="mt-4">
          <label className="fw-bold" style={{ color: "var(--accent-color)" }}>Select a File *</label>
          <input
            type="file"
            className="form-control mt-2"
            style={{padding:".375rem .75rem"}}
            accept=".zip,.pdf,.jpeg,.jpg,.png"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div className="small text-muted mt-1">
            Allowable Formats for Upload: .zip, .pdf, .jpeg, .jpg, .png<br />
            Allowable Upload Size: 5 MB
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="text-end mt-4">
          <button
            className="btn px-4 text-white"
            style={{ background: "var(--accent-color)" }}
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit →'
            )}
          </button>
        </div>

        {/* POPUP SUCCESS MODAL */}
        {showPopup && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050 }}
          >
            <div
              className="bg-white p-5 rounded text-center"
              style={{ width: "420px" }}
            >
              <h5 className="fw-bold" style={{ color:"var(--accent-color)" }}>
                Your Appeal has been registered successfully!
              </h5>
              <h4 className="fw-bold mt-2" style={{ color: "var(--accent-color)" }}>
                Appeal #{appealId}
              </h4>
              <p className="text-muted small mt-3">
                For any further doubt and queries kindly contact your respective HR.
              </p>
              <button
                className="btn mt-2 text-white"
                style={{ background: "#0389d0", width: "120px" }}
                onClick={handlePopupClose}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddAppeal;
