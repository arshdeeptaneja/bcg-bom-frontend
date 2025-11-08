import React, { useState, useEffect } from 'react';
import './AppraisalCheckInForm.css';
import { BackButton } from '../../../components/common';
import { useLocation } from 'react-router-dom';
import {
  CheckInSummaryTable,
  FinalScoreSummaryTable,
  CheckInDescriptionSection,
  MeasurableKra,
  NonMeasurableKra,
  DevelopmentInputs,
} from '../../../components/Appraisal';

function AppraisalCheckInForm() {
  const location = useLocation();

  // ✅ FIXED: role added in destructuring
  // const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {};
const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {
  financialYear: "2024-2025",
  appraisalPeriod: "Mid-Year",
  quarter: "Q2",
  dateRange: "01 Jul 2024 - 30 Sep 2024",
  employee: { name: "John Doe", id: "EMP123" },
  role: "APPRAISEE",
};

  // Role State (Appraisee / Appraiser / Reviewer)
  const [currentRole, setCurrentRole] = useState(role || 'APPRAISEE');

  // ------------------------------------------------------------------------
  // Temporary Role Switcher (for testing)
  // ------------------------------------------------------------------------
  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };
  // ------------------------------------------------------------------------

  const [kraData, setKraData] = useState([]);
  const [comments, setComments] = useState({
    appraisee: '',
    appraiser: '',
    reviewer: '',
  });
  const [measurableKraListData, setMeasurableKraListData] = useState([]);
  const [nonMeasurableKraListData, setNonMeasurableKraListData] = useState({});
  const [developmentInputsData, setDevelopmentInputsData] = useState([]);

  useEffect(() => {
    setKraData([
      { KraName: 'KRA 1', KraWeight: 10 },
      { KraName: 'KRA 2', KraWeight: 20 },
      { KraName: 'KRA 3', KraWeight: 30 },
    ]);

    setMeasurableKraListData([
      {
        KraName: 'KRA 1',
        KraActualScore: 10,
        KraTarget: 100,
        KraWeight: 10,
        KraFinalScore: 10,
        comments: { appraisee: '', appraiser: '', reviewer: '' },
      },
      {
        KraName: 'KRA 2',
        KraActualScore: 20,
        KraTarget: 200,
        KraWeight: 20,
        KraFinalScore: 20,
        comments: { appraisee: '', appraiser: '', reviewer: '' },
      },
    ]);

    setNonMeasurableKraListData({
      'Section 1': [
        {
          KraName: 'KRA 1',
          KraDescription: 'lorem ipsum dolor sit amet consectetur adipisicing elit.',
          comments: { appraisee: '', appraiser: '', reviewer: '' },
        },
      ],
      'Section 2': [
        {
          KraName: 'KRA 2',
          KraDescription: 'lorem ipsum dolor sit amet consectetur adipisicing elit.',
          comments: { appraisee: '', appraiser: '', reviewer: '' },
        },
      ],
        'Section 3': [
        {
          KraName: 'KRA 3',
          KraDescription: 'lorem ipsum dolor sit amet consectetur adipisicing elit.',
          comments: { appraisee: '', appraiser: '', reviewer: '' },
        },
      ],
    });
  }, []);

  const isEditableBy = (fieldOwner) => {
    switch (currentRole) {
      case 'APPRAISEE':
        return fieldOwner === 'appraisee';
      case 'APPRAISER':
        return fieldOwner === 'appraiser';
      case 'REVIEWER':
        return fieldOwner === 'reviewer';
      default:
        return false;
    }
  };

  const handleSave = () => {
    console.log('Saving draft as', currentRole);
    alert(`Saved as ${currentRole}`);
  };

  const handleSubmit = () => {
    console.log('Submitting as', currentRole);
    alert(`Submitted by ${currentRole}`);
  };

  const actualScoreData = { January: 10, February: 20, March: 30 };
  const maxScoreData = { January: 100, February: 200, March: 300 };
  const developmentInputsQuestions = [
    { question: 'What is your name?', required: true },
    { question: 'Do you have any development inputs?', required: true, options: ['Yes', 'No'] },
  ];

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraisee Check-In</h1>
        </div>

        {/* ✅ Role Switcher (for testing only) */}
        <div className="d-flex flex-row align-items-center">
          <label htmlFor="roleSelect" className="me-2 text-muted fw-bold">
            Role:
          </label>
          <select
            id="roleSelect"
            value={currentRole}
            onChange={handleRoleChange}
            className="form-select form-select-sm"
            style={{ width: '180px' }}
          >
            <option value="APPRAISEE">Appraisee (Self)</option>
            <option value="APPRAISER">Appraiser (Level 1)</option>
            <option value="REVIEWER">Reviewer (Final)</option>
          </select>
        </div>
        {/* ✅ END Role Switcher */}

      </div>

      {/* Rest of your UI unchanged below */}
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
          <FinalScoreSummaryTable kraListData={kraData} />
        </div>

        <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Monthly Score Summary</h5>
          <CheckInSummaryTable actualScoreData={actualScoreData} maxScoreData={maxScoreData} />
        </div>

        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Discretionary KRA</h5>
          <MeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={measurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
          <NonMeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={nonMeasurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          <DevelopmentInputs
            questions={developmentInputsQuestions}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
        </div>
      </div>

      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btns btn-primarys" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default AppraisalCheckInForm;
