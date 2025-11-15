import React, { useState, useEffect } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation } from 'react-router-dom';
import './QuarterlyException.css';
import {
 
  CheckInDescriptionSection,

} from '../../../components/Appraisal';
import MeasurableKRA from './NonDiscretionaryKRA/MeasurableKRA/MeasurableKRA';
import NonMeasurableKRA from './NonDiscretionaryKRA/NonMeasurableKRA/NonMeasurableKRA';
import DeclarationSection from './Declaration';

function QuarterlyException() {
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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Exception</h1>
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

        <div class="table-container">
          <table class="table-accent">
            <thead>
              <tr>
                <th style={{width:"55%"}}>Month</th>
                <th style={{width:"25%"}}>Actual</th>
                <th style={{width:"25%"}}>Max</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>April</td>
                <td>13.9</td>
                <td>65.0</td>
              </tr>
              <tr>
                <td>May</td>
                <td>9.1</td>
                <td>65.0</td>
              </tr>
              <tr>
                <td>June</td>
                <td>17.7</td>
                <td>65.0</td>
              </tr>
              <tr>
                <td><b>Average</b></td>
                <td>13.6</td>
                <td>65.0</td>
              </tr>
            </tbody>
          </table>
        </div>


     

        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          {/* <h5 className="text-primary fw-bold mb-3">Non-Discretionary KRA</h5> */}
          {/* <MeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={measurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          /> */}
          <MeasurableKRA/>
          <NonMeasurableKRA/>
          {/* <NonMeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={nonMeasurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          /> */}
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Declaration</h5>
          <DeclarationSection />

        </div>
      </div>

      {/* <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btns btn-primarys" onClick={handleSubmit}>
          Submit
        </button>
      </div> */}
    </div>
  );
}

export default QuarterlyException;



