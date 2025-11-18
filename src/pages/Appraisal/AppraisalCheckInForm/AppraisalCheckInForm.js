import React, { useEffect, useState, useMemo } from 'react';
import './AppraisalCheckInForm.css';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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
 * Data transformer for quarterly appraisal API response
 * Converts API response to component-compatible format
 */
const transformQuarterlyAppraisalData = (apiResponse) => {
  if (!apiResponse) return null;

  // Extract quarterly data (structure based on expected API response)
  const quarterlyData = apiResponse.quarterly_check_in_data || apiResponse;

  // Extract monthly scores if available
  const monthlyScoreSummary = {
    actualScoreData: quarterlyData.monthly_actual_scores || {},
    maxScoreData: quarterlyData.monthly_max_scores || {},
  };

  // Extract measurable KRAs
  const measurableKras = quarterlyData.measurable_kras || quarterlyData.measurableKras || [];

  // Extract non-measurable KRAs
  const nonMeasurableKras = quarterlyData.non_measurable_kras || quarterlyData.nonMeasurableKras || {};

  // Extract final score summary
  const finalScoreSummary = quarterlyData.final_score_summary || quarterlyData.finalScoreSummary || [];

  // Calculate totals
  const totalMeasurableActual = quarterlyData.total_measurable_actual || 0;
  const totalMeasurableMax = quarterlyData.total_measurable_max || 0;
  const totalNonMeasurableActual = quarterlyData.total_non_measurable_actual || 0;
  const totalNonMeasurableMax = quarterlyData.total_non_measurable_max || 0;

  // Extract development inputs/questions
  const developmentInputs = quarterlyData.development_inputs || quarterlyData.developmentInputs || [];

  // Extract comments from different roles
  const comments = {
    appraisee: quarterlyData.appraisee_comments || quarterlyData.appraiseeComments || '',
    appraiser: quarterlyData.appraiser_comments || quarterlyData.appraiserComments || '',
    reviewer: quarterlyData.reviewer_comments || quarterlyData.reviewerComments || '',
  };

  return {
    finalScoreSummary,
    monthlyScoreSummary,
    measurableKras,
    nonMeasurableKras,
    totalMeasurableActual,
    totalMeasurableMax,
    totalNonMeasurableActual,
    totalNonMeasurableMax,
    developmentInputs,
    comments,
    unitConverter: apiResponse.unit_converter || '',
    validationMessage: apiResponse.text || '',
    rawData: quarterlyData, // Keep raw data for payload building
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
  const navigate = useNavigate();

  // Extract data from location state (including quarterly-specific fields)
  const {
    employee,
    financialYear,
    quarter,
    appraisalPeriod,
    dateRange,
    // Quarterly-specific fields
    urlId,
    roleType,
    pageType,
    intent,
    appraisalStatus: initialAppraisalStatus,
  } = location.state || {};

  // Determine if this is a quarterly flow
  const isQuarterlyFlow = useMemo(() => {
    return appraisalPeriod?.toLowerCase() === 'quarterly';
  }, [appraisalPeriod]);

  // Derive actual role from intent and roleType (for quarterly) or default (for annual)
  const actualRole = useMemo(() => {
    if (!isQuarterlyFlow) return 'APPRAISEE'; // Annual: always appraisee
    if (intent === 'Review' || roleType === 'appraiser') return 'APPRAISER';
    return 'APPRAISEE';
  }, [isQuarterlyFlow, intent, roleType]);

  // Role state for testing (can be overridden for development purposes)
  const [currentRole, setCurrentRole] = useState(actualRole);

  // Update currentRole when actualRole changes
  useEffect(() => {
    setCurrentRole(actualRole);
  }, [actualRole]);

  // Handler for role change (for testing)
  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  // Determine if the form is editable by current role
  const isEditableBy = {
    APPRAISEE: currentRole === 'APPRAISEE',
    APPRAISER: currentRole === 'APPRAISER',
    REVIEWER: currentRole === 'REVIEWER',
  };

  // Form state for user inputs
  const [formData, setFormData] = useState({
    measurableKraScores: {},
    nonMeasurableKraComments: {},
    developmentInputAnswers: {},
    appraiseeComments: '',
    appraiserComments: '',
    reviewerComments: '',
  });

  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Extract year from financial year format (e.g., "FY 2024-25" -> "2025")
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Fetch appraisal data from API (conditional based on flow type)
  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey: isQuarterlyFlow
      ? ['quarterlyCheckInReport', employee?.empNo, financialYear, quarter, roleType, intent]
      : ['employeeSelfAppraisal', employee?.empNo, financialYear, quarter, appraisalPeriod],
    queryFn: () => {
      if (isQuarterlyFlow) {
        // Quarterly flow - call quarterly check-in report API
        return appraisalAPI.getQuarterlyCheckInReport({
          empNo: employee?.empNo || '',
          url: urlId || 'quarterly-check-in',
          roleType: roleType || 'emp',
          financialYear: extractYear(financialYear),
          quarter: quarter || '',
          pageType: pageType || 'elo',
          appraisalStatus: initialAppraisalStatus || '',
          intent: intent || 'Fill',
          roleId: employee?.primaryRole || 'default',
        });
      } else {
        // Annual flow - call employee self appraisal API
        return appraisalAPI.getEmployeeSelfAppraisal({
          empNo: employee?.empNo || '',
          url: 'check-in-form',
          zoneName: employee?.zone || 'default',
          roleId: employee?.primaryRole || 'default',
          roleType: '12',
          financialYear: extractYear(financialYear),
          quarter: '',
          pageType: '1',
          appraisalStatus: 'in-progress',
        });
      }
    },
    enabled: !!employee?.empNo && !!financialYear && !!appraisalPeriod,
  });

  // Transform API data based on flow type
  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return isQuarterlyFlow
      ? transformQuarterlyAppraisalData(apiResponse)
      : transformAnnualAppraisalData(apiResponse);
  }, [apiResponse, isQuarterlyFlow]);

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load appraisal data. Please try again.');
    }
  }, [isError]);

  // Build payload for quarterly save/submit operations
  const buildQuarterlyPayload = () => {
    return {
      empNo: employee?.empNo || '',
      financialYear: extractYear(financialYear),
      quarter: quarter || '',
      roleType: roleType || 'emp',
      pageType: pageType || 'elo',
      intent: intent || 'Fill',
      roleId: employee?.primaryRole || 'default',
      // Form data
      measurableKraScores: formData.measurableKraScores,
      nonMeasurableKraComments: formData.nonMeasurableKraComments,
      developmentInputAnswers: formData.developmentInputAnswers,
      // Role-specific comments
      ...(currentRole === 'APPRAISEE' && { appraiseeComments: formData.appraiseeComments }),
      ...(currentRole === 'APPRAISER' && { appraiserComments: formData.appraiserComments }),
      ...(currentRole === 'REVIEWER' && { reviewerComments: formData.reviewerComments }),
    };
  };

  // Save mutation for quarterly check-in
  const saveMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.saveQuarterlyCheckInReport(payload),
    onSuccess: () => {
      toast.success('Draft saved successfully');
      setIsDirty(false);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save draft. Please try again.');
    },
  });

  // Submit mutation for quarterly check-in
  const submitMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.submitQuarterlyCheckInReport(payload),
    onSuccess: () => {
      toast.success('Check-in submitted successfully');
      setIsDirty(false);
      navigate(-1); // Return to dashboard
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast.error('Failed to submit check-in. Please try again.');
    },
  });

  const handleSave = () => {
    if (isQuarterlyFlow) {
      const payload = buildQuarterlyPayload();
      saveMutation.mutate(payload);
    } else {
      // Annual save logic (if needed in future)
      console.log('Annual save not yet implemented');
      toast.info('Save functionality for annual appraisal is not yet available');
    }
  };

  const handleSubmit = () => {
    if (isQuarterlyFlow) {
      const payload = buildQuarterlyPayload();
      submitMutation.mutate(payload);
    } else {
      // Annual submit logic (if needed in future)
      console.log('Annual submit not yet implemented');
      toast.info('Submit functionality for annual appraisal is not yet available');
    }
  };

  // Use API data or fallback to empty/mock data
  const kraData = transformedData?.finalScoreSummary || [];
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
      </div>
      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />
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
        <div className="final-score-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Final Score Summary</h5>
          <FinalScoreSummaryTable kraListData={kraData} />
        </div>
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
          <DevelopmentInputs
            questions={developmentInputsQuestions}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
        </div>
      </div>
      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button
          className="btn btn-outline-primary"
          onClick={handleSave}
          disabled={saveMutation.isPending || submitMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saveMutation.isPending || submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

export default AppraisalCheckInForm;
