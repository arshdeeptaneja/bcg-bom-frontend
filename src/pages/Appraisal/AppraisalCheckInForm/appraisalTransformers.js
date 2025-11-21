/**
 * Data transformer for annual appraisal API response
 * Converts API response to component-compatible format
 */
export const transformAnnualAppraisalData = (apiResponse) => {
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
export const transformQuarterlyAppraisalData = (apiResponse) => {
  if (!apiResponse) return null;

  // The API response structure is flat
  const data = apiResponse;

  // Extract KRAs
  const measurableList = data.results_KRA_LIST?.measurable || [];
  const nonMeasurableList = data.results_KRA_LIST?.non_measurable || [];
  
  // Map Measurable KRAs
  const measurableKras = measurableList.map(kra => ({
    KraId: kra.KRA_CODE,
    KraName: kra.kra_desc,
    KraTarget: kra.target,
    KraUnit: kra.unit,
    KraWeight: kra.maxscore,
    KraActualScore: kra.actual,
    KraFinalScore: kra.score,
    KraAppraiserScore: kra.repa_score,
    KraReviewerScore: kra.reva_score,
    KraComments: kra.KRA_COMMENT,
    Month: kra.MONTH
  }));

  // Map Non-Measurable KRAs
  const nonMeasurableKras = {};
  if (nonMeasurableList.length > 0) {
    nonMeasurableKras['Non-Measurable'] = nonMeasurableList.map(kra => ({
      KraId: kra.KRA_CODE,
      KraName: kra.kra_desc,
      KraDescription: kra.kra_desc
    }));
  }

  // Final Score Summary (List of KRAs and Weights)
  // Group by KRA Name to avoid duplicates if multiple months exist for same KRA
  const uniqueKras = new Map();
  measurableList.forEach(kra => {
    if (!uniqueKras.has(kra.kra_desc)) {
      uniqueKras.set(kra.kra_desc, {
        KraName: kra.kra_desc,
        KraWeight: kra.maxscore // Assuming maxscore is weight
      });
    }
  });
  const finalScoreSummary = Array.from(uniqueKras.values());

  // Monthly Score Summary
  const actualScoreData = {};
  const maxScoreData = {};

  measurableList.forEach(kra => {
    const month = kra.MONTH;
    if (month) {
      // Summing up scores for the month
      actualScoreData[month] = (actualScoreData[month] || 0) + (parseFloat(kra.score) || 0);
      maxScoreData[month] = (maxScoreData[month] || 0) + (parseFloat(kra.maxscore) || 0);
    }
  });

  const monthlyScoreSummary = {
    actualScoreData,
    maxScoreData
  };

  // Development Inputs
  const developmentInputs = [];
  if (data.question1) {
    developmentInputs.push({
      question: data.question1,
      answer: data.HIGHLIGHTS_COMMENTS,
      id: 'question1'
    });
  }
  if (data.question2) {
    developmentInputs.push({
      question: data.question2,
      answer: data.BELOW_EXPECTATIONS_COMMENTS,
      id: 'question2'
    });
  }

  // Comments
  const comments = {
    appraisee: '',
    appraiser: '',
    reviewer: ''
  };

  // Totals
  const totalMeasurableActual = data.performance_measurable_score_total || 0;
  const totalMeasurableMax = data.performance_measurable_maxscore_total || 0;
  const totalNonMeasurableActual = data.performance_non_measurable_score_total || 0;
  const totalNonMeasurableMax = data.performance_non_measurable_maxscore_total || 0;

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
    unitConverter: '',
    validationMessage: '',
    rawData: data,
  };
};

// Extract year from financial year format (e.g., "FY 2024-25" -> "2025")
export const extractYear = (fy) => {
  if (!fy) return new Date().getFullYear().toString();
  const match = fy.match(/FY (\d{4})/);
  return match ? match[1] : new Date().getFullYear().toString();
};
