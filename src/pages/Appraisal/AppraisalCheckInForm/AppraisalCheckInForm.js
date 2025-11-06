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

/**
 * This is the main check-in form for the Appraisal Process.
 * It will eventually be loaded with different FormStates depending on different purpose, stage and role of the user.
 * @param {Object} props - The properties of the component.
 * @param {string} props.appraisalPeriod - The period of the appraisal (Quarterly or Yearly).
 * @param {string} props.quarter - The quarter of the appraisal (Q1, Q2, Q3, Q4).
 * @param {string} props.financialYear - The financial year of the appraisal.
 * @returns
 */
function AppraisalCheckInForm() {
  const location = useLocation();
  const { financialYear, appraisalPeriod, quarter, dateRange, employee } = location.state || {};

  const handleSave = () => {
    console.log('Save');
  };
  const handleSubmit = () => {
    console.log('Submit');
  };

  // FIXME: Remove this once we have the actual KRA list data from the SPs
  const kraListData = [
    {
      KraName: 'KRA 1',
      KraWeight: 10,
    },
    {
      KraName: 'KRA 2',
      KraWeight: 20,
    },
    {
      KraName: 'KRA 3',
      KraWeight: 30,
    },
  ];

  const measurableKraListData = [
    {
      KraName: 'KRA 1',
      KraActualScore: 10,
      KraTarget: 100,
      KraWeight: 10,
      KraFinalScore: 10,
    },
    {
      KraName: 'KRA 2',
      KraActualScore: 20,
      KraTarget: 200,
      KraWeight: 20,
      KraFinalScore: 20,
    },
  ];

  const nonMeasurableKraListData = {
    'Section 1': [
      {
        KraName: 'KRA 1',
        KraDescription:
          'lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
      },
      {
        KraName: 'KRA 2',
        KraDescription: 'KRA 2 Description',
      },
    ],
    'Section 2': [
      {
        KraName: 'KRA 3',
        KraDescription: 'KRA 3 Description',
      },
      {
        KraName: 'KRA 4',
        KraDescription: 'KRA 4 Description',
      },
    ],
  };
  // FIXME: Remove this once we have the actual score data from the SPs
  const actualScoreData = {
    January: 10,
    February: 20,
    March: 30,
  };
  const maxScoreData = {
    January: 100,
    February: 200,
    March: 300,
  };

  const developmentInputsQuestions = [
    {
      question: 'What is your name?',
      required: true,
    },
    {
      question: 'Do you have any development inputs?',
      required: true,
      options: ['Yes', 'No'],
    },
  ];

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }
  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div>No financial year, appraisal period, or quarter found</div>
      </div>
    );
  }
  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraisee Check-In</h1>
        </div>
        <h2 className="text-muted fw-bold mb-0 ms-3">
          {`${
            appraisalPeriod === 'Quarterly' ? `${quarter}, ` : '' // Show Quarter only for Quarterly appraisal periods, else directly show the FY
          } ${financialYear} ${appraisalPeriod} Check-In`}
        </h2>
      </div>

      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />

        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please raise an exception if actual or target values are incorrect.
          </span>
        </div>

        {/* Final Score Summary Table */}
        <div className="final-score-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Final Score Summary</h5>
          <FinalScoreSummaryTable kraListData={kraListData} />
        </div>

        {/* Monthly Score Summary Table */}
        <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Monthly Score Summary</h5>
          <CheckInSummaryTable
            actualScoreData={actualScoreData}
            maxScoreData={maxScoreData}
            className="mt-5"
          />
        </div>
        {/* Discretionary KRA Section */}
        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Discretionary KRA</h5>
          <div className="discretionary-kra-list">
            <MeasurableKra
              totalActualScore={5.0}
              totalMaxScore={10.0}
              kraListData={measurableKraListData}
            />
          </div>

          {/* Non-Measurable KRA Section */}
          <NonMeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={nonMeasurableKraListData}
          />
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          <div className="development-inputs-list">
            <DevelopmentInputs questions={developmentInputsQuestions} />
          </div>
        </div>
      </div>

      {/* Save and Submit Button */}
      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default AppraisalCheckInForm;
