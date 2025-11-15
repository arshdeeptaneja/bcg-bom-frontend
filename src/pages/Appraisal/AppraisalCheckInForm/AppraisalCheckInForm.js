import './AppraisalCheckInForm.css';
import { BackButton } from '../../../components/common';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/Spinner';
import {
  CheckInSummaryTable,
  FinalScoreSummaryTable,
  CheckInDescriptionSection,
  MeasurableKra,
  NonMeasurableKra,
  DevelopmentInputs,
} from '../../../components/Appraisal';

/**
 * Data transformer for annual appraisal API response
 * Converts API response to component-compatible format
 */
const transformAnnualAppraisalData = (apiResponse) => {
  if (!apiResponse) return null;

  // Extract annual_score_data if it exists
  const scoreData = apiResponse.annual_score_summary?.annual_score_data || [];
  
  // Extract Business Dimension data for Final Score Summary
  const businessDimensionData = scoreData.filter(
    (item) => item.CATEGORY === 'Business Dimension' && item.MAX_SCORE != null
  );
  const finalScoreSummary = businessDimensionData.map((item) => ({
    KraName: item.CATEGORY,
    KraWeight: item.MAX_SCORE || 0,
  }));

  // Extract Discretionary Measurable KRAs
  const measurableData = scoreData.find(
    (item) => item.CATEGORY === 'Discretionary Measurable KRAs'
  );
  const measurableKras = measurableData
    ? [
        {
          KraName: measurableData.CATEGORY,
          KraActualScore: measurableData.SELF_SCORE || 0,
          KraTarget: measurableData.MAX_SCORE || 0,
          KraWeight: measurableData.MAX_SCORE || 0,
          KraFinalScore: measurableData.SELF_SCORE || 0,
        },
      ]
    : [];

  // Extract Discretionary Non-Measurable KRAs
  const nonMeasurableData = scoreData.find(
    (item) => item.CATEGORY === 'Discretionary Non-Measurable KRAs'
  );
  const nonMeasurableKras = nonMeasurableData
    ? {
        'Discretionary Non-Measurable': [
          {
            KraName: nonMeasurableData.CATEGORY,
            KraDescription: 'Please provide your inputs for non-measurable KRAs',
          },
        ],
      }
    : {};

  // Monthly score summary (placeholder - will be populated when monthly data is available)
  const monthlyScoreSummary = {
    actualScoreData: {},
    maxScoreData: {},
  };

  // Calculate totals for discretionary KRAs
  const totalMeasurableActual = measurableData?.SELF_SCORE || 0;
  const totalMeasurableMax = measurableData?.MAX_SCORE || 0;
  const totalNonMeasurableActual = nonMeasurableData?.SELF_SCORE || 0;
  const totalNonMeasurableMax = nonMeasurableData?.MAX_SCORE || 0;

  return {
    finalScoreSummary,
    monthlyScoreSummary,
    measurableKras,
    nonMeasurableKras,
    totalMeasurableActual,
    totalMeasurableMax,
    totalNonMeasurableActual,
    totalNonMeasurableMax,
    unitConverter: apiResponse.unit_converter || '',
    validationMessage: apiResponse.text || '',
  };
};

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

  // Extract year from financial year format (e.g., "FY 2024-25" -> "2025")
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Fetch appraisal data from API
  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey: ['employeeSelfAppraisal', employee?.empNo, financialYear, quarter, appraisalPeriod],
    queryFn: () =>
      appraisalAPI.getEmployeeSelfAppraisal({
        empNo: employee?.empNo || '',
        url: 'check-in-form', // Default URL identifier
        zoneName: employee?.zone || 'default',
        roleId: employee?.primaryRole || 'default',
        roleType: '12', // Default role type
        financialYear: extractYear(financialYear),
        quarter: appraisalPeriod === 'Annual' ? '' : quarter,
        pageType: '1',
        appraisalStatus: 'in-progress',
      }),
    enabled: !!employee?.empNo && !!financialYear && !!appraisalPeriod,
  });

  // Transform API data
  const transformedData = transformAnnualAppraisalData(apiResponse);

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load appraisal data. Please try again.');
    }
  }, [isError]);

  const handleSave = () => {
    console.log('Save');
  };
  const handleSubmit = () => {
    console.log('Submit');
  };

  // Use API data or fallback to empty/mock data
  const kraListData = transformedData?.finalScoreSummary || [];
  const measurableKraListData = transformedData?.measurableKras || [];
  const nonMeasurableKraListData = transformedData?.nonMeasurableKras || {};
  const actualScoreData = transformedData?.monthlyScoreSummary?.actualScoreData || {};
  const maxScoreData = transformedData?.monthlyScoreSummary?.maxScoreData || {};
  const totalMeasurableActual = transformedData?.totalMeasurableActual || 0;
  const totalMeasurableMax = transformedData?.totalMeasurableMax || 0;
  const totalNonMeasurableActual = transformedData?.totalNonMeasurableActual || 0;
  const totalNonMeasurableMax = transformedData?.totalNonMeasurableMax || 0;
  const validationMessage = transformedData?.validationMessage || '';

  // Development inputs questions (TODO: fetch from API when available)
  const developmentInputsQuestions = [
    // {
    //   question: 'What is your name?',
    //   required: true,
    // },
    // {
    //   question: 'Do you have any development inputs?',
    //   required: true,
    //   options: ['Yes', 'No'],
    // },
  ];

  if (!financialYear || !appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div>No financial year or appraisal period found</div>
      </div>
    );
  }

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraisee Check-In</h1>
          </div>
        </div>
        <LoadingSpinner />
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

        {/* Validation message banner */}
        {validationMessage && (
          <div className="alert alert-info mt-3" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            {validationMessage}
          </div>
        )}

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

        {/* Monthly Score Summary Table - only show if data exists */}
        {Object.keys(actualScoreData).length > 0 && (
          <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Monthly Score Summary</h5>
            <CheckInSummaryTable
              actualScoreData={actualScoreData}
              maxScoreData={maxScoreData}
              className="mt-5"
            />
          </div>
        )}
        {/* Discretionary KRA Section - only show if data exists */}
        {(measurableKraListData.length > 0 || Object.keys(nonMeasurableKraListData).length > 0) && (
          <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
            <h5 className="text-primary fw-bold mb-3">Discretionary KRA</h5>
            {measurableKraListData.length > 0 && (
              <div className="discretionary-kra-list">
                <MeasurableKra
                  totalActualScore={totalMeasurableActual}
                  totalMaxScore={totalMeasurableMax}
                  kraListData={measurableKraListData}
                />
              </div>
            )}

            {/* Non-Measurable KRA Section */}
            {Object.keys(nonMeasurableKraListData).length > 0 && (
              <NonMeasurableKra
                totalActualScore={totalNonMeasurableActual}
                totalMaxScore={totalNonMeasurableMax}
                kraListData={nonMeasurableKraListData}
              />
            )}
          </div>
        )}

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
