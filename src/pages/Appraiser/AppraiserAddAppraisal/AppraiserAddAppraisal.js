import React, { useState, useEffect } from 'react';
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
import DevelopmentInput from './DevelopmentInput/DevelopementInput';
import RemarkSection from './Remark/Remark';
import RemarkTable from './Remark/Remark';


const demoRows = [
  { question: "Training required, if any", response: "Review of Performance KRAs" },
  { question: "Integrity remarks", response: "Officer integrity satisfactory" },
  { question: "General behavior remarks", response: "Good behavior & cooperation" },
  { question: "Communication skills", response: "Strong communication" },
  { question: "Team handling capability", response: "Handles team well" },
  { question: "Leadership feedback", response: "Shows leadership potential" },
  { question: "Work commitment remarks", response: "Highly committed" },
  { question: "Improvement areas", response: "Needs minor improvement in time mgmt" },
];
function AppraiserAddAppraisal() {
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
  const [selected, setSelected] = useState("Integrity of the officer is doubtful");

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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser :Add Appraisal</h1>
        </div>

       

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

   

        <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          <DevelopmentInput/>
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
        <RemarkTable rows={demoRows} />

         </div>
      </div>

         {/* Integrity Section */}
      <section >
        <h4 className="integrity-title mb-3">Integrity</h4>

        <p className="fw-semibold mb-1">
          1. Training required, if any <span className="text-danger">*</span>
        </p>

        <div className="d-flex flex-column gap-2 ms-2">

          <label className="d-flex align-items-center gap-2">
            <input
              type="radio"
              name="integrity"
              className="form-check-input"
              checked={selected === "Beyond Doubt"}
              onChange={() => setSelected("Beyond Doubt")}
            />
            Beyond Doubt
          </label>

          <label className="d-flex align-items-center gap-2">
            <input
              type="radio"
              name="integrity"
              className="form-check-input"
              checked={selected === "Not Sufficient Information"}
              onChange={() => setSelected("Not Sufficient Information")}
            />
            Not Sufficient Information to form a definite
          </label>

          <label className="d-flex align-items-center gap-2">
            <input
              type="radio"
              name="integrity"
              className="form-check-input"
              checked={selected === "Integrity of the officer is doubtful"}
              onChange={() => setSelected("Integrity of the officer is doubtful")}
            />
            Integrity of the officer is doubtful
          </label>
        </div>

        {/* Value Display */}
        <p className="mt-3 fw-semibold">
          Appraiser Option Value: <span className="fw-normal">{selected === "Beyond Doubt" ? "Beyond Doubt" : "Beyond Doubt"}</span>
        </p>
      </section>

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

export default AppraiserAddAppraisal;
