import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { toast } from 'react-toastify';
import { transformAnnualAppraisalData } from '../appraisalTransformers';
import { useAppraisalContext } from '../useAppraisalContext';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * Annual Appraisal Hook
 * 
 * Handles all annual-specific logic including:
 * - Data fetching via getEmployeeSelfAppraisal
 * - Flat KRA arrays (no month grouping)
 * - Submit-only functionality (no save draft)
 * - Role-based editability
 * - Development inputs extraction
 */
export const useAnnualAppraisal = () => {
  const context = useAppraisalContext();
  const {
    navigate,
    employee,
    employeeNumber,
    financialYear,
    normalizedFinancialYear,
    quarter,
    appraisalPeriod,
    dateRange,
    urlId,
    roleType,
    zoneName,
    isContextValid,
  } = context;

  // Role state management - Annual always starts as APPRAISEE
  const [currentRole, setCurrentRole] = useState('APPRAISEE');

  const { getUserProperty } = useAuth();


  const empNo = getUserProperty("empNo", "38965");


  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const isEditableBy = {
    APPRAISEE: currentRole === 'APPRAISEE',
    APPRAISER: currentRole === 'APPRAISER',
    REVIEWER: currentRole === 'REVIEWER',
  };

  // Form state for annual flow - separate states for per-field API integration
  const [formData, setFormData] = useState({
    measurableKraScores: {},
    sectionComments: {
      highlights: '',
      areasOfImprovement: '',
    },
    appraiseeComments: '',
    appraiserComments: '',
    reviewerComments: '',
  });

  // Non-measurable KRA scores and comments (separate for per-KRA API calls)
  const [nonMeasurableScores, setNonMeasurableScores] = useState({});
  // Shape: { [AP_KRA_ID]: { score: number, comment: string } }

  // Development input responses (separate for per-question API calls)
  const [developmentResponses, setDevelopmentResponses] = useState({});
  // Shape: { [questionId]: { response: string, response2?: string } }

  // Option-based responses (integrity, health, disciplinary)
  const [optionResponses, setOptionResponses] = useState({
    integrity: null, // 'option1' | 'option2' | 'option3'
    healthProblems: null, // 'yes' | 'no'
    healthDetails: '',
    disciplinaryActions: null, // 'yes' | 'no'
    disciplinaryDetails: '',
  });

  const [isDirty, setIsDirty] = useState(false);

  // Raw API data for submit payload - preserves original fields from GET response
  const [rawKraData, setRawKraData] = useState([]);
  const [rawQuestionsData, setRawQuestionsData] = useState([]);
  const [learningMetrics, setLearningMetrics] = useState({
    continuousLearningPresent: false,
    mandatoryCourses: 0,
    learningCourses: 0,
    speedCircular: 0,
    elearningScore: 0,
  });

  // Query key for annual data
  const queryKey = [
    'employeeSelfAppraisal',
    employeeNumber,
    normalizedFinancialYear,
    appraisalPeriod || 'Annual',
  ];

  // Debug logging for API parameters
  console.log('[useAnnualAppraisal] Context values:', {
    employeeNumber,
    urlId,
    zoneName,
    roleType,
    financialYear,
    normalizedFinancialYear,
    quarter,
    appraisalPeriod,
    isContextValid,
    employee,
  });

  // Log which values are undefined/missing
  const missingParams = [];
  if (!employeeNumber) missingParams.push('employeeNumber');
  if (!urlId) missingParams.push('urlId');
  if (!zoneName) missingParams.push('zoneName');
  if (!roleType) missingParams.push('roleType');
  if (!normalizedFinancialYear) missingParams.push('normalizedFinancialYear');
  
  if (missingParams.length > 0) {
    console.warn('[useAnnualAppraisal] ⚠️ Missing parameters:', missingParams.join(', '));
  }

  // Fetch annual appraisal data
  // Note: quarter is hardcoded to 'Q2' as a backend workaround for annual appraisals
  const isQueryEnabled = isContextValid && appraisalPeriod?.toLowerCase() === 'annual';
  
  console.log('[useAnnualAppraisal] useQuery enabled params:', {
    isContextValid,
    appraisalPeriod,
    appraisalPeriodLowercase: appraisalPeriod?.toLowerCase(),
    isAnnual: appraisalPeriod?.toLowerCase() === 'annual',
    isQueryEnabled,
  });

  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => {
      const apiParams = {
        empNo: employeeNumber,
        url: urlId,
        zoneName: zoneName,
        roleType: roleType || 'Administrative Officers',
        financialYear: normalizedFinancialYear,
        quarter: 'Q2', // Hardcoded for annual until backend fix
        pageType: 'repa',
        appraisalStatus: 'complete_self',
      };
      console.log('[useAnnualAppraisal] API call params:', apiParams);
      return appraisalAPI.getEmployeeSelfAppraisal(apiParams);
    },
    enabled: isQueryEnabled,
  });

  // Transform API response to component-compatible format
  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return transformAnnualAppraisalData(apiResponse);
  }, [apiResponse]);

  // Store raw API data for submit payload when API response changes
  useEffect(() => {
    if (!apiResponse) return;

    // Store raw KRA data (non-measurable discretionary)
    const rawKras = apiResponse.result_kra_list_discretionary_non_measurable_child || [];
    setRawKraData(rawKras);

    // Store raw questions data - flatten all categories
    const resultQuestions = apiResponse.result_questions?.development_inputs || {};
    const allQuestions = [
      ...(resultQuestions.overall_development || []),
      ...(resultQuestions.reporting_review_authority || []),
      ...(resultQuestions.integrity || []),
      ...(resultQuestions.health_problems || []),
      ...(resultQuestions.disciplinary_actions || []),
    ];
    setRawQuestionsData(allQuestions);

    // Store learning metrics from API response (if available, else defaults to 0)
    setLearningMetrics({
      continuousLearningPresent: apiResponse.continuous_learning_present ?? false,
      mandatoryCourses: apiResponse.mandatory_courses ?? 0,
      learningCourses: apiResponse.learning_courses ?? 0,
      speedCircular: apiResponse.speed_circular ?? 0,
      elearningScore: apiResponse.elearning_score ?? 0,
    });
  }, [apiResponse]);

  // Extract development inputs from API response - structured by category and role
  const developmentInputs = useMemo(() => {
    if (!apiResponse) return { overallDevelopment: [], reportingReviewAuthority: [], optionBased: [] };
    
    const resultQuestions = apiResponse.result_questions?.development_inputs || {};
    
    // Overall Development questions (for appraisee - IDs 1-9)
    const overallDevelopment = (resultQuestions.overall_development || []).map((q) => ({
      id: q.ID,
      question: q.QUESTION,
      category: q.CATEGORY,
      subCategory: q.SUB_CATEGORY,
      selfResponse: q.SELF_RESPONSE || '',
      selfResponse2: q.SELF_RESPONSE_2 || '',
      repaResponse: q.REPA_RESPONSE || '',
      revaResponse: q.REVA_RESPONSE || '',
      acResponse: q.AC_RESPONSE || '',
      responseId: q.RESPONSE_ID,
      editableBy: 'APPRAISEE',
    }));

    // Reporting/Review Authority questions (for appraiser/reviewer - IDs 12-18)
    const reportingReviewAuthority = (resultQuestions.reporting_review_authority || []).map((q) => ({
      id: q.ID,
      question: q.QUESTION,
      category: q.CATEGORY,
      subCategory: q.SUB_CATEGORY,
      selfResponse: q.SELF_RESPONSE || '',
      repaResponse: q.REPA_RESPONSE || '',
      revaResponse: q.REVA_RESPONSE || '',
      acResponse: q.AC_RESPONSE || '',
      responseId: q.RESPONSE_ID,
      editableBy: 'APPRAISER_REVIEWER',
    }));

    // Option-based inputs (integrity, health, disciplinary)
    const optionBased = [];
    
    // Integrity (ID 19) - 3 options
    const integrityQuestions = resultQuestions.integrity || [];
    integrityQuestions.forEach((q) => {
      optionBased.push({
        id: q.ID,
        key: 'integrity',
        question: q.QUESTION,
        category: q.CATEGORY,
        subCategory: q.SUB_CATEGORY,
        options: [
          { value: 'option1', label: q.OPTION1 },
          { value: 'option2', label: q.OPTION2 },
          { value: 'option3', label: q.OPTION3 },
        ].filter((o) => o.label),
        selfResponse: q.SELF_RESPONSE || '',
        repaResponse: q.REPA_RESPONSE || '',
        revaResponse: q.REVA_RESPONSE || '',
        editableBy: 'APPRAISER_REVIEWER',
      });
    });

    // Health Problems (ID 10) - Yes/No
    const healthQuestions = resultQuestions.health_problems || [];
    healthQuestions.forEach((q) => {
      optionBased.push({
        id: q.ID,
        key: 'healthProblems',
        question: q.QUESTION,
        category: q.CATEGORY,
        subCategory: q.SUB_CATEGORY,
        options: [
          { value: 'yes', label: q.OPTION1 || 'Yes' },
          { value: 'no', label: q.OPTION2 || 'No' },
        ],
        selfResponse: q.SELF_RESPONSE || '',
        repaResponse: q.REPA_RESPONSE || '',
        revaResponse: q.REVA_RESPONSE || '',
        editableBy: 'APPRAISEE',
      });
    });

    // Disciplinary Actions (ID 11) - Yes/No
    const disciplinaryQuestions = resultQuestions.disciplinary_actions || [];
    disciplinaryQuestions.forEach((q) => {
      optionBased.push({
        id: q.ID,
        key: 'disciplinaryActions',
        question: q.QUESTION,
        category: q.CATEGORY,
        subCategory: q.SUB_CATEGORY,
        options: [
          { value: 'yes', label: q.OPTION1 || 'Yes' },
          { value: 'no', label: q.OPTION2 || 'No' },
        ],
        selfResponse: q.SELF_RESPONSE || '',
        repaResponse: q.REPA_RESPONSE || '',
        revaResponse: q.REVA_RESPONSE || '',
        editableBy: 'APPRAISEE',
      });
    });

    return {
      overallDevelopment,
      reportingReviewAuthority,
      optionBased,
    };
  }, [apiResponse]);

  // Initialize form data from transformed data
  useEffect(() => {
    if (!transformedData) return;

    // Initialize measurable KRA scores
    const initialMeasurableScores = {};
    if (transformedData.measurableKras?.length) {
      transformedData.measurableKras.forEach((kra) => {
        initialMeasurableScores[kra.KraId || kra.KraName] = { ...kra };
      });
    }

    setFormData((prev) => ({
      ...prev,
      measurableKraScores: initialMeasurableScores,
    }));

    // Initialize non-measurable KRA scores from transformed data
    const initialNonMeasurableScores = {};
    if (transformedData.nonMeasurableKras) {
      Object.values(transformedData.nonMeasurableKras).forEach((kraList) => {
        kraList.forEach((kra) => {
          initialNonMeasurableScores[kra.KraId] = {
            score: kra.Actual || kra.Score || null,
            comment: kra.CommentSelf1 || '',
            appraiserScore: kra.RepaActuals || null,
            appraiserComment: kra.CommentRepa || '',
            reviewerScore: kra.RevaActuals || null,
            reviewerComment: kra.CommentReva || '',
          };
        });
      });
    }
    setNonMeasurableScores(initialNonMeasurableScores);

    // Initialize development responses
    const initialDevResponses = {};
    developmentInputs.overallDevelopment?.forEach((q) => {
      initialDevResponses[q.id] = {
        response: q.selfResponse || '',
        response2: q.selfResponse2 || '',
      };
    });
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      initialDevResponses[q.id] = {
        response: q.repaResponse || q.revaResponse || '',
      };
    });
    setDevelopmentResponses(initialDevResponses);

    // Initialize option responses
    setOptionResponses((prev) => {
      const initialOptionResponses = { ...prev };
      developmentInputs.optionBased?.forEach((q) => {
        if (q.key === 'integrity') {
          initialOptionResponses.integrity = q.repaResponse || q.revaResponse || null;
        } else if (q.key === 'healthProblems') {
          initialOptionResponses.healthProblems = q.selfResponse?.toLowerCase() || null;
        } else if (q.key === 'disciplinaryActions') {
          initialOptionResponses.disciplinaryActions = q.selfResponse?.toLowerCase() || null;
        }
      });
      return initialOptionResponses;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedData, developmentInputs]);

  // Show error toast on fetch error
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load annual appraisal data. Please try again.');
    }
  }, [isError]);

  // Form change handlers
  const handleKraChange = (kraId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      measurableKraScores: {
        ...prev.measurableKraScores,
        [kraId]: {
          ...prev.measurableKraScores[kraId],
          [field]: value,
        },
      },
    }));
    setIsDirty(true);
  };

  // Non-measurable KRA score change handler (per-KRA for future API integration)
  const handleNonMeasurableScoreChange = (kraId, score) => {
    setNonMeasurableScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        score,
      },
    }));
    setIsDirty(true);
  };

  // Non-measurable KRA comment change handler (per-KRA for future API integration)
  const handleNonMeasurableCommentChange = (kraId, comment, role = 'APPRAISEE') => {
    const commentKey = role === 'APPRAISEE' ? 'comment' :
      role === 'APPRAISER' ? 'appraiserComment' : 'reviewerComment';
    
    setNonMeasurableScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        [commentKey]: comment,
      },
    }));
    setIsDirty(true);
  };

  // Development input change handler (per-question for future API integration)
  const handleDevelopmentInputChange = (questionId, value, field = 'response') => {
    setDevelopmentResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  // Option-based response handler
  const handleOptionChange = (key, value) => {
    setOptionResponses((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleCommentChange = (role, value) => {
    const commentKey = `${role.toLowerCase()}Comments`;
    setFormData((prev) => ({
      ...prev,
      [commentKey]: value,
    }));
    setIsDirty(true);
  };

  /**
   * Build annual submit payload matching the API contract.
   * Spreads original KRA fields from GET response and updates with user input.
   * 
   * API Endpoint: POST /appraisal/employee_self_appraisal/submit
   */
  const buildAnnualSubmitPayload = () => {
    // Build kraData array - spread original KRA fields, update with user input
    const kraData = rawKraData.map((originalKra) => {
      const kraId = originalKra.AP_KRA_ID;
      const userInput = nonMeasurableScores[kraId] || {};
      
      return {
        // Spread all original fields from GET response
        ...originalKra,
        // Update with user input
        SCORE: userInput.score || originalKra.SCORE,
        ACTUAL: userInput.score || originalKra.ACTUAL,
        // FIRSTCOMMENT is the appraisee's self comment
        FIRSTCOMMENT: userInput.comment || originalKra.COMMENT_SELF_1 || null,
        COMMENT_SELF_1: userInput.comment || originalKra.COMMENT_SELF_1 || null,
        COMMENT_REPA: userInput.appraiserComment || originalKra.COMMENT_REPA || null,
        COMMENT_REVA: userInput.reviewerComment || originalKra.COMMENT_REVA || null,
      };
    });

    // Derive functions array from unique KRA_DESC values
    const functions = [...new Set(kraData.map((kra) => kra.KRA_DESC).filter(Boolean))];

    // Build questions array - spread original question fields, update with user responses
    const questions = rawQuestionsData.map((originalQuestion) => {
      const questionId = originalQuestion.ID;
      const userInput = developmentResponses[questionId] || {};
      
      return {
        // Spread all original fields from GET response
        QUESTION_ID: originalQuestion.ID,
        CATEGORY: originalQuestion.CATEGORY,
        SUB_CATEGORY: originalQuestion.SUB_CATEGORY,
        QUESTION: originalQuestion.QUESTION,
        OPTION1: originalQuestion.OPTION1 || null,
        OPTION2: originalQuestion.OPTION2 || null,
        OPTION3: originalQuestion.OPTION3 || null,
        RESPONSE_ID: originalQuestion.RESPONSE_ID || null,
        // Update with user input
        SELF_RESPONSE: userInput.response || originalQuestion.SELF_RESPONSE || null,
        SELF_RESPONSE_2: userInput.response2 || originalQuestion.SELF_RESPONSE_2 || null,
        SELF_RESPONSE_OPTIONS: userInput.response ||  originalQuestion.SELF_RESPONSE_OPTIONS || null,
        REPA_RESPONSE: originalQuestion.REPA_RESPONSE || null,
        REVA_RESPONSE: originalQuestion.REVA_RESPONSE || null,
        AC_RESPONSE: originalQuestion.AC_RESPONSE || null,
        OPTIONS_REPA: originalQuestion.OPTIONS_REPA || null,
        OPTIONS_REVA: originalQuestion.OPTIONS_REVA || null,
      };
    });

    return {
      // id: urlId from route state (this is the URL ID / assignment ID)
      id: urlId || null,
      empNo: employeeNumber,
      ecNumber: empNo,
      financialYear: parseInt(normalizedFinancialYear, 10),
      
      // Learning metrics - from GET API if available, else 0
      continuousLearningPresent: learningMetrics.continuousLearningPresent,
      mandatoryCourses: learningMetrics.mandatoryCourses,
      learningCourses: learningMetrics.learningCourses,
      speedCircular: learningMetrics.speedCircular,
      elearningScore: learningMetrics.elearningScore,
      
      // KRA data with user scores and comments
      kraData,
      
      // Derived from unique KRA_DESC values
      functions,
      
      // feedbackInput - keeping as empty array (not sure about this)
      feedbackInput: [],
      
      // Questions/Development inputs
      questions,
      
      // Performance comments
      performanceMeasurableComment: formData.appraiseeComments || '',
      performanceNonMeasurableComment: formData.appraiserComments || '',
      performanceSemiMeasurableComment: formData.reviewerComments || '',
      
      // Flags
      warningFlag: false,
      warningComment: '',
      varianceFlag: false,
    };
  };

  /**
   * Validate form before submission.
   * Returns { isValid: boolean, errors: string[] }
   */
  const validateAnnualForm = () => {
    const errors = [];

    // Check if all required non-measurable KRAs have scores
    rawKraData.forEach((kra) => {
      const kraId = kra.AP_KRA_ID;
      const userInput = nonMeasurableScores[kraId];
      if (!userInput?.score) {
        errors.push(`Please select a score for "${kra.KRA_DESC}"`);
      }
    });

    // Check required development input responses (overall_development category)
    developmentInputs.overallDevelopment?.forEach((q) => {
      const userInput = developmentResponses[q.id];
      if (!userInput?.response?.trim()) {
        errors.push(`Please provide a response for "${q.question.substring(0, 50)}..."`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
  

  // Submit mutation (no save for annual)
  const submitMutation = useMutation({
    //TODO: direct submitAnnualSelfAppraisal and submit reportee appraisal by condition
    mutationFn: (payload) => appraisalAPI.submitReporteeAppraisal(payload),
    onSuccess: (response) => {
      console.log('[useAnnualAppraisal] Submit success:', response);
      toast.success('Annual appraisal submitted successfully');
      setIsDirty(false);
      //navigate(-1);
    },
    onError: (error) => {
      console.error('[useAnnualAppraisal] Submit error:', error);
      const errorMessage = error.response?.data?.MSG || error.message || 'Failed to submit annual appraisal. Please try again.';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    // Validate form before submission
    const { isValid, errors } = validateAnnualForm();
    
    if (!isValid) {
      // Show first 3 errors max to avoid overwhelming the user
      const displayErrors = errors.slice(0, 3);
      displayErrors.forEach((err) => toast.error(err));
      if (errors.length > 3) {
        toast.warning(`And ${errors.length - 3} more validation errors...`);
      }
      return;
    }

    const payload = buildAnnualSubmitPayload();
    console.log('[useAnnualAppraisal] Submit payload:', payload);
    submitMutation.mutate(payload);
  };

  return {
    // Data
    data: transformedData,
    developmentInputs,
    isLoading,
    isError,

    // Context (annual-specific shape)
    context: {
      employee,
      financialYear,
      quarter,
      appraisalPeriod,
      dateRange,
      metadata: transformedData?.metadata || {},
    },

    // Role state
    roleState: {
      currentRole,
      isEditableBy,
      handleRoleChange,
    },

    // Form state (separate for per-field API integration)
    formState: {
      formData,
      setFormData,
      nonMeasurableScores,
      setNonMeasurableScores,
      developmentResponses,
      setDevelopmentResponses,
      optionResponses,
      setOptionResponses,
      isDirty,
      setIsDirty,
    },

    // Actions (no save for annual)
    actions: {
      handleSubmit,
      handleKraChange,
      handleNonMeasurableScoreChange,
      handleNonMeasurableCommentChange,
      handleDevelopmentInputChange,
      handleOptionChange,
      handleCommentChange,
      isSubmitting: submitMutation.isPending,
    },
  };
};
