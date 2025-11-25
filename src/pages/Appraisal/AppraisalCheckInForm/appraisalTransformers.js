const MONTH_LABELS = [
  null,
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAME_TO_NUMBER = MONTH_LABELS.reduce((acc, label, index) => {
  if (!label) return acc;
  const lower = label.toLowerCase();
  acc[lower] = index;
  acc[lower.slice(0, 3)] = index;
  return acc;
}, {});

const getMonthLabel = (monthNumber) => MONTH_LABELS[monthNumber] || `Month ${monthNumber}`;

const parseMonthValue = (value, fallbackMonth = 4) => {
  if (typeof value === 'number' && value >= 1 && value <= 12) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallbackMonth;

    const numeric = parseInt(trimmed, 10);
    if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 12) {
      return numeric;
    }

    const lookup = MONTH_NAME_TO_NUMBER[trimmed.toLowerCase()];
    if (lookup) {
      return lookup;
    }
  }

  return fallbackMonth;
};

const ensureMonthBucket = (bucket, monthNumber) => {
  const safeMonth = monthNumber >= 1 && monthNumber <= 12 ? monthNumber : 4;
  if (!bucket[safeMonth]) {
    bucket[safeMonth] = {
      label: getMonthLabel(safeMonth),
      measurable: [],
      nonMeasurable: [],
    };
  }
  return bucket[safeMonth];
};

const resolveFallbackMonth = (resultsData, rawData) => {
  const candidateDate =
    resultsData.startDate ||
    resultsData.START_DATE ||
    rawData.startDate ||
    rawData.START_DATE ||
    '';

  if (candidateDate) {
    const parsedDate = new Date(candidateDate);
    const monthValue = parsedDate.getMonth?.() + 1;
    if (!Number.isNaN(monthValue)) {
      return monthValue;
    }
  }

  // Default fiscal year start (April)
  return 4;
};

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
 * Converts API response to component-compatible format with month-based grouping
 * 
 * Key Features:
 * - Groups KRAs by month for efficient tab switching (O(1) lookup)
 * - Handles parent-child KRA relationships
 * - Calculates monthly score summaries
 * - Manages editability based on ACTUAL_EDIT_STATUS
 * - Supports read-only mode based on APPRAISAL_STATUS
 */
export const transformQuarterlyAppraisalData = (apiResponse) => {
  if (!apiResponse) return null;

  // Handle nested results structure (results.KRA_LIST or results_KRA_LIST)
  const data = apiResponse;
  const resultsData = data.results || data;
  const kraListData = resultsData.KRA_LIST || resultsData.results_KRA_LIST || data.results_KRA_LIST || {};
  const fallbackMonthNumber = resolveFallbackMonth(resultsData, data);
  
  // Extract KRA lists with multiple fallback paths
  const measurableList = kraListData.measurable || [];
  const nonMeasurableList = kraListData.non_measurable || [];
  
  // 1. Map & Normalize Measurable KRAs with full metadata
  const measurableKras = measurableList.map(kra => {
    const monthNumber = parseMonthValue(kra.MONTH ?? kra.month ?? kra.month_no, fallbackMonthNumber);
    return {
      KraId: kra.KRA_CODE,
      KraName: kra.kra_desc,
      KraType: kra.kratype || 'measurable',
      KraTarget: parseFloat(kra.target) || 0,
      KraUnit: kra.unit,
      KraWeight: parseFloat(kra.maxscore) || 0,
      KraActualScore: parseFloat(kra.actual) || 0,
      KraFinalScore: parseFloat(kra.score) || 0,
      KraAppraiserScore: parseFloat(kra.repa_score) || 0,
      KraReviewerScore: parseFloat(kra.reva_score) || 0,
      KraComments: kra.comment_self || kra.KRA_COMMENT || '',
      AppraiserComment: kra.comment_repa || '',
      ReviewerComment: kra.comment_reva || '',
      Month: monthNumber,
      MonthLabel: getMonthLabel(monthNumber),
      IsEditable: kra.ACTUAL_EDIT_STATUS === 0 || kra.ACTUAL_EDIT_STATUS === '0', // Editable if status is 0
      ParentKra: kra.parent_kra || kra.PARENT_KRA || null, // For hierarchical display
      IsParent: kra.IS_PARENT === true || kra.IS_PARENT === 1,
      MaxScore: parseFloat(kra.max_score || kra.maxscore) || 0,
    };
  });

  // 2. Group by Month (The "Bucket" Strategy for O(1) lookup during tab switching)
  const krasByMonth = {};
  measurableKras.forEach((kra) => {
    const bucket = ensureMonthBucket(krasByMonth, kra.Month);
    bucket.measurable.push(kra);
  });

  // 3. Map Non-Measurable KRAs (Usually not month-bound)
  const nonMeasurableKras = {};
  if (nonMeasurableList.length > 0) {
    const normalizedNonMeasurable = nonMeasurableList.map((kra) => {
      const monthNumber = parseMonthValue(kra.MONTH ?? kra.month ?? kra.month_no, fallbackMonthNumber);
      const sectionName = kra.section_name || kra.SECTION_NAME || 'Non-Measurable';
      const base = {
        KraId: kra.KRA_CODE,
        KraName: kra.kra_desc,
        KraDescription: kra.kra_desc,
        KraType: kra.kratype || 'non-measurable',
        IsEditable: kra.ACTUAL_EDIT_STATUS === 0 || kra.ACTUAL_EDIT_STATUS === '0',
        comments: {
          appraisee: kra.comment_self || kra.KRA_COMMENT || '',
          appraiser: kra.comment_repa || '',
          reviewer: kra.comment_reva || '',
        },
        Month: monthNumber,
        MonthLabel: getMonthLabel(monthNumber),
        SectionName: sectionName,
      };
      return base;
    });

    normalizedNonMeasurable.forEach((kra) => {
      const sectionKey = kra.SectionName || 'Non-Measurable';
      if (!nonMeasurableKras[sectionKey]) {
        nonMeasurableKras[sectionKey] = [];
      }
      nonMeasurableKras[sectionKey].push(kra);
    });

    normalizedNonMeasurable.forEach((kra) => {
      const bucket = ensureMonthBucket(krasByMonth, kra.Month);
      bucket.nonMeasurable.push(kra);
    });
  }

  // 4. Calculate Monthly Score Summaries
  const monthlyScoreSummary = {
    actualScoreData: {},
    maxScoreData: {}
  };
  
  measurableKras.forEach(kra => {
    const month = kra.Month;
    if (month) {
      monthlyScoreSummary.actualScoreData[month] = 
        (monthlyScoreSummary.actualScoreData[month] || 0) + kra.KraFinalScore;
      monthlyScoreSummary.maxScoreData[month] = 
        (monthlyScoreSummary.maxScoreData[month] || 0) + kra.KraWeight;
    }
  });

  // 5. Final Score Summary (Unique KRAs with weights)
  const uniqueKras = new Map();
  measurableList.forEach(kra => {
    if (!uniqueKras.has(kra.kra_desc)) {
      uniqueKras.set(kra.kra_desc, {
        KraName: kra.kra_desc,
        KraWeight: parseFloat(kra.maxscore) || 0
      });
    }
  });
  const finalScoreSummary = Array.from(uniqueKras.values());

  // 6. Extract Development Inputs (Questions & Comments)
  const developmentInputs = [];
  if (data.question1 || resultsData.question1) {
    developmentInputs.push({
      id: 'question1',
      key: 'highlights',
      question: data.question1 || resultsData.question1,
      answer: data.performancePeriodComment || resultsData.performancePeriodComment || data.HIGHLIGHTS_COMMENTS || resultsData.HIGHLIGHTS_COMMENTS || ''
    });
  }
  if (data.question2 || resultsData.question2) {
    developmentInputs.push({
      id: 'question2',
      key: 'areasOfImprovement',
      question: data.question2 || resultsData.question2,
      answer: data.areasPerformanceComment || resultsData.areasPerformanceComment || data.BELOW_EXPECTATIONS_COMMENTS || resultsData.BELOW_EXPECTATIONS_COMMENTS || ''
    });
  }

  // 7. Determine Appraisal Status for Read-Only Mode
  const appraisalStatus = data.APPRAISAL_STATUS || resultsData.APPRAISAL_STATUS || 'Pending';
  const isReadOnly = appraisalStatus !== 'Pending' && appraisalStatus !== 'PENDING';

  // 8. Extract Submission Details
  const submissionDetails = {
    appraiseeSubmittedDate: data.appraisee_submitted_date || resultsData.appraisee_submitted_date,
    appraiserSubmittedDate: data.appraiser_submitted_date || resultsData.appraiser_submitted_date,
    reviewerSubmittedDate: data.reviewer_submitted_date || resultsData.reviewer_submitted_date,
  };

  // 9. Calculate Totals
  const totalMeasurableActual = parseFloat(
    data.performance_measurable_score_total || 
    resultsData.performance_measurable_score_total || 
    0
  );
  const totalMeasurableMax = parseFloat(
    data.performance_measurable_maxscore_total || 
    resultsData.performance_measurable_maxscore_total || 
    0
  );
  const totalNonMeasurableActual = parseFloat(
    data.performance_non_measurable_score_total || 
    resultsData.performance_non_measurable_score_total || 
    0
  );
  const totalNonMeasurableMax = parseFloat(
    data.performance_non_measurable_maxscore_total || 
    resultsData.performance_non_measurable_maxscore_total || 
    0
  );

  return {
    // Core data structures
    krasByMonth,          // <--- Key for efficient tab rendering (O(1) lookup)
    measurableKras,       // Flat list for global operations
    nonMeasurableKras,
    
    // Summaries
    finalScoreSummary,
    monthlyScoreSummary,
    
    // Totals
    totalMeasurableActual,
    totalMeasurableMax,
    totalNonMeasurableActual,
    totalNonMeasurableMax,
    
    // Additional data
    developmentInputs,
    submissionDetails,
    
    // UI state
    appraisalStatus,
    isReadOnly,
    
    // Metadata
    unitConverter: data.unit_converter || resultsData.unit_converter || '',
    validationMessage: data.text || resultsData.text || '',
    rawData: data,
  };
};

// Extract year from financial year format (e.g., "FY 2024-25" -> "2025")
export const extractYear = (fy) => {
  if (!fy) return new Date().getFullYear().toString();
  const match = fy.match(/FY (\d{4})/);
  return match ? match[1] : new Date().getFullYear().toString();
};
