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
 * The above functions are data transformers that convert API responses for annual and quarterly
 * appraisals into component-compatible formats.
 * @param apiResponse - The `apiResponse` parameter in both `transformAnnualAppraisalData` and
 * `transformQuarterlyAppraisalData` functions represents the data received from the API endpoint for
 * annual and quarterly appraisals, respectively. This data is then transformed into a format that is
 * compatible with the components in the application
 * @returns For the `transformAnnualAppraisalData` function:
 * - The function returns an object containing various transformed data from the annual appraisal API
 * response, such as `finalScoreSummary`, `monthlyScoreSummary`, `measurableKras`, `nonMeasurableKras`,
 * `totalMeasurableActual`, `totalMeasurableMax`, `totalNonMeasurableActual`, `totalNonMeasurableMax`,
 * `
 */
/**
 * Data transformer for annual appraisal API response
 * Converts API response to component-compatible format
 * 
 * Handles:
 * - result_kra_list_discretionary_non_measurable_child (grouped by GROUP_NAME)
 * - result_kra_list_measurable_child (if present)
 * - annual_score_summary for final score display
 * - result_questions.development_inputs for question sections
 */
export const transformAnnualAppraisalData = (apiResponse) => {
  console.log('transformAnnualAppraisalData input:', apiResponse);
  if (!apiResponse) return null;

  // Extract annual_score_data for Final Score Summary
  const scoreData = apiResponse.annual_score_summary?.annual_score_data || [];
  
  // Transform Final Score Summary from annual_score_data
  const finalScoreSummary = scoreData
    .filter((item) => item.CATEGORY)
    .map((item) => ({
      Category: item.CATEGORY,
      KraName: item.CATEGORY, // Map for FinalScoreSummaryTable
      MaxScore: item.MAX_SCORE || 0,
      KraWeight: item.MAX_SCORE || 0, // Map for FinalScoreSummaryTable
      SelfScore: item.SELF_SCORE || 0,
      ReportingAuthorityScore: item.BY_REPORTING_AUTHORITY || 0,
      ReviewingAuthorityScore: item.BY_REVIEVING_AUTHORITY || 0,
      AcceptingAuthorityScore: item.BY_ACCEPTING_AUTHORITY || 0,
      PostAppealScore: item.POST_APPEAL_SCORE || 0,
      MdScore: item.MD_SCORE || 0,
      Id: item.ID,
    }));

  // Parse discretionary non-measurable KRAs and group by GROUP_NAME
  const nonMeasurableChildList = apiResponse.result_kra_list_discretionary_non_measurable_child || [];
  const nonMeasurableKras = {};
  
  nonMeasurableChildList.forEach((kra) => {
    const groupName = kra.GROUP_NAME || 'Other';
    
    if (!nonMeasurableKras[groupName]) {
      nonMeasurableKras[groupName] = [];
    }
    
    nonMeasurableKras[groupName].push({
      KraId: kra.AP_KRA_ID,
      KraCode: kra.KRA_CODE,
      ParentKraCode: kra.PARENT_KRA_CODE,
      KraName: kra.KRA_DESC,
      KraDescription: kra.KRA_METRIC,
      KraType: kra.KRA_TYPE || 'discretionary_non_measurable',
      MaxScore: kra.MAX_SCORE || 0,
      Target: kra.TARGET ? parseFloat(kra.TARGET) : null,
      Actual: kra.ACTUAL ? parseFloat(kra.ACTUAL) : null,
      Score: kra.SCORE ? parseFloat(kra.SCORE) : null,
      // Role-specific actuals (keep separate for per-role API integration)
      AppraiseeActual: kra.APPRAISEE_ACTUAL ? parseFloat(kra.APPRAISEE_ACTUAL) : null,
      AppraiserActual: kra.APPRAISER_ACTUAL ? parseFloat(kra.APPRAISER_ACTUAL) : null,
      ReviewerActual: kra.REVIEWER_ACTUAL ? parseFloat(kra.REVIEWER_ACTUAL) : null,
      AcceptorActual: kra.ACCEPTOR_ACTUAL ? parseFloat(kra.ACCEPTOR_ACTUAL) : null,
      // Reporting/Reviewing/Accepting authority scores
      RepaActuals: kra.REPA_ACTUALS ? parseFloat(kra.REPA_ACTUALS) : null,
      RepaTarget: kra.REPA_TARGET ? parseFloat(kra.REPA_TARGET) : null,
      RepaScore: kra.REPA_SCORE ? parseFloat(kra.REPA_SCORE) : null,
      RevaActuals: kra.REVA_ACTUALS ? parseFloat(kra.REVA_ACTUALS) : null,
      RevaTarget: kra.REVA_TARGET ? parseFloat(kra.REVA_TARGET) : null,
      RevaScore: kra.REVA_SCORE ? parseFloat(kra.REVA_SCORE) : null,
      AcActuals: kra.AC_ACTUALS ? parseFloat(kra.AC_ACTUALS) : null,
      AcTarget: kra.AC_TARGET ? parseFloat(kra.AC_TARGET) : null,
      AcScore: kra.AC_SCORE ? parseFloat(kra.AC_SCORE) : null,
      PostAppealActual: kra.POST_APPEAL_ACTUAL ? parseFloat(kra.POST_APPEAL_ACTUAL) : null,
      PostAppealScore: kra.POST_APPEAL_SCORE ? parseFloat(kra.POST_APPEAL_SCORE) : null,
      // Comments per role
      CommentSelf1: kra.COMMENT_SELF_1 || '',
      CommentSelf2: kra.COMMENT_SELF_2 || '',
      CommentRepa: kra.COMMENT_REPA || '',
      CommentReva: kra.COMMENT_REVA || '',
      CommentAc: kra.COMMENT_AC || '',
      // Flags
      IsEditable: kra.ACTUAL_EDIT_FLAG === 0,
      IsActive: kra.KRA_ACTIVE_FLAG === 1,
      ExceptionId: kra.EXCEPTION_ID,
      // Tooltips
      Tooltip: kra.TOOLTIP,
      ScoreTooltip: kra.SCORE_TOOLTIP,
      IaTooltip: kra.IA_TOOLTIP,
      ItTooltip: kra.IT_TOOLTIP,
      // Misc
      Bonus: kra.BONUS,
      Mpb: kra.MPB,
      IncrementalTarget: kra.INCREMENTAL_TARGET,
      IncrementalActual: kra.INCREMENTAL_ACTUAL,
    });
  });

  // Parse measurable KRAs (handle both object and array formats)
  const measurableChildData = apiResponse.result_kra_list_measurable_child || {};
  const measurableKras = [];
  
  // Handle if it's an object with month keys or an array
  if (Array.isArray(measurableChildData)) {
    measurableChildData.forEach((kra) => {
      measurableKras.push({
        KraId: kra.AP_KRA_ID || kra.KRA_CODE,
        KraCode: kra.KRA_CODE,
        KraName: kra.KRA_DESC || kra.kra_desc,
        KraDescription: kra.KRA_METRIC || '',
        KraType: kra.KRA_TYPE || 'measurable',
        MaxScore: parseFloat(kra.MAX_SCORE || kra.maxscore) || 0,
        Target: kra.TARGET ? parseFloat(kra.TARGET) : null,
        Actual: kra.ACTUAL ? parseFloat(kra.ACTUAL) : null,
        Score: kra.SCORE ? parseFloat(kra.SCORE) : null,
        KraActualScore: parseFloat(kra.ACTUAL || kra.actual) || 0,
        KraTarget: parseFloat(kra.TARGET || kra.target) || 0,
        KraWeight: parseFloat(kra.MAX_SCORE || kra.maxscore) || 0,
        KraFinalScore: parseFloat(kra.SCORE || kra.score) || 0,
        KraComments: kra.COMMENT_SELF_1 || kra.comment_self || '',
        IsEditable: kra.ACTUAL_EDIT_FLAG === 0,
      });
    });
  } else if (typeof measurableChildData === 'object' && Object.keys(measurableChildData).length > 0) {
    // If it's an object, iterate over values
    Object.values(measurableChildData).forEach((kraOrList) => {
      const kraList = Array.isArray(kraOrList) ? kraOrList : [kraOrList];
      kraList.forEach((kra) => {
        if (kra && kra.KRA_CODE) {
          measurableKras.push({
            KraId: kra.AP_KRA_ID || kra.KRA_CODE,
            KraCode: kra.KRA_CODE,
            KraName: kra.KRA_DESC || kra.kra_desc,
            KraDescription: kra.KRA_METRIC || '',
            MaxScore: parseFloat(kra.MAX_SCORE || kra.maxscore) || 0,
            KraActualScore: parseFloat(kra.ACTUAL || kra.actual) || 0,
            KraTarget: parseFloat(kra.TARGET || kra.target) || 0,
            KraWeight: parseFloat(kra.MAX_SCORE || kra.maxscore) || 0,
            KraFinalScore: parseFloat(kra.SCORE || kra.score) || 0,
            KraComments: kra.COMMENT_SELF_1 || kra.comment_self || '',
            IsEditable: kra.ACTUAL_EDIT_FLAG === 0,
          });
        }
      });
    });
  }

  // Calculate totals from annual_score_summary categories
  const discretionaryMeasurableRow = scoreData.find(
    (item) => item.CATEGORY === 'Discretionary Measurable KRAs'
  );
  const discretionaryNonMeasurableRow = scoreData.find(
    (item) => item.CATEGORY === 'Discretionary Non-Measurable KRAs'
  );

  const totalMeasurableActual = discretionaryMeasurableRow?.SELF_SCORE || 0;
  const totalMeasurableMax = discretionaryMeasurableRow?.MAX_SCORE || 0;
  const totalNonMeasurableActual = discretionaryNonMeasurableRow?.SELF_SCORE || 0;
  const totalNonMeasurableMax = discretionaryNonMeasurableRow?.MAX_SCORE || 
    apiResponse.discretionary_non_measurable_maxscore_total || 0;

  // Monthly score summary (not typically used for annual, but keep for compatibility)
  const monthlyScoreSummary = {
    actualScoreData: {},
    maxScoreData: {},
  };

  // Extract metadata
  const metadata = {
    empName: apiResponse.emp_name || '',
    empNumber: apiResponse.empnumber || '',
    organisation: apiResponse.organisation || '',
    status: apiResponse.status || '',
    date: apiResponse.date || '',
    startDate: apiResponse.startdate || '',
    endDate: apiResponse.enddate || '',
    scale: apiResponse.scale || '',
    jobFamily: apiResponse.job_family || '',
    cohort: apiResponse.cohort || '',
    unitConverter: apiResponse.unit_converter || '',
    // Role assignments
    primary: apiResponse.primary || '',
    secondary: apiResponse.secondary || '',
    tertiary: apiResponse.tertiary || '',
    // Authority info
    reportingAuthorityNo: apiResponse.REPORTING_AUTHORITY_NO || '',
    reportingAuthorityName: apiResponse.REPORTING_AUTHORITY_NAME || '',
    reviewingAuthorityNo: apiResponse.REVIEWING_AUTHORITY_NO || '',
    reviewingAuthorityName: apiResponse.REVIEWING_AUTHORITY_NAME || '',
    acceptingAuthorityNo: apiResponse.ACCEPTING_AUTHORITY_NO || '',
    acceptingAuthorityName: apiResponse.ACCEPTING_AUTHORITY_NAME || '',
    // Warnings
    repaWarningComment: apiResponse.REPA_WARNING_COMMENT || '',
    revaWarningComment: apiResponse.REVA_WARNING_COMMENT || '',
    warningFlagRepa: apiResponse.warningflag_repa || '',
    warningFlagReva: apiResponse.warningflag_reva || '',
  };

  // Determine read-only state based on status
  const isReadOnly = apiResponse.status === 'complete_self' || 
    apiResponse.status === 'complete_repa' || 
    apiResponse.status === 'complete_reva';

  console.log('transformAnnualAppraisalData output nonMeasurableKras:', nonMeasurableKras);

  return {
    finalScoreSummary,
    monthlyScoreSummary,
    measurableKras,
    nonMeasurableKras,
    totalMeasurableActual,
    totalMeasurableMax,
    totalNonMeasurableActual,
    totalNonMeasurableMax,
    metadata,
    isReadOnly,
    unitConverter: apiResponse.unit_converter || '',
    validationMessage: apiResponse.text || '',
    rawData: apiResponse,
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
