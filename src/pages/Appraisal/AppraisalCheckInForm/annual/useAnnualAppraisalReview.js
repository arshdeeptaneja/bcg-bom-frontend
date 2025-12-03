import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { toast } from 'react-toastify';
import { transformAnnualAppraisalData } from '../appraisalTransformers';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * Annual Appraisal Review Hook (Appraiser/Reviewer)
 *
 * Handles appraiser/reviewer flow for annual appraisals including:
 * - Data fetching via getReporteeAppraisal
 * - Appraiser scores and comments for each KRA
 * - Development input responses for Reporting Authority (IDs 12-18)
 * - Submit-only functionality (no save draft)
 *
 * Supports both location.state and URL search params:
 * /appraisal/annual/appraiser-review?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Zone&roleType=Administrative%20Officers
 */
export const useAnnualAppraisalReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getUserProperty } = useAuth();
  const ecNumber = getUserProperty('empNo');
  const empNoFromAuth = getUserProperty('empNo', '');
  const empNo = empNoFromAuth || employee?.empNo || employee?.id || employee?.EMP_ID;
  const zoneName = getUserProperty('ZNNAME', '');

  // Extract params from location.state first, fallback to URL search params
  const {
    financialYear,
    appraisalPeriod,
    quarter,
    dateRange,
    employee,
    intent,
    page_type,
    roleType,
    urlId,
  } = location.state;
  const url = urlId;
  const dateRangeFromState = dateRange;
  const employeeFromState = employee;

  // Normalize financial year (e.g., "FY 2024-25" -> "2024")
  const normalizedFinancialYear = useMemo(() => {
    if (!financialYear) return null;
    const match = financialYear.match(/(\d{4})/);
    return match ? match[1] : financialYear;
  }, [financialYear]);

  // Context validation
  const isContextValid = Boolean(empNo && normalizedFinancialYear && url);
  console.log('isContextValid: ', isContextValid);

  // Appraiser scores and comments state
  // Shape: { [AP_KRA_ID]: { score: number, comment: string } }
  const [appraiserScores, setAppraiserScores] = useState({});

  // Development input responses for Reporting Authority questions (IDs 12-18)
  // Shape: { [questionId]: string }
  const [appraiserDevResponses, setAppraiserDevResponses] = useState({});

  // Option-based responses (integrity)
  const [appraiserOptionResponses, setAppraiserOptionResponses] = useState({
    integrity: null, // 'option1' | 'option2' | 'option3'
  });

  // Self development responses (for editing appraisee's overall development)
  // Shape: { [questionId]: { response: string, response2: string } }
  const [selfDevResponses, setSelfDevResponses] = useState({});

  // Self option responses (for editing appraisee's yes/no questions)
  // Shape: { healthProblems: 'yes'|'no', disciplinaryActions: 'yes'|'no' }
  const [selfOptionResponses, setSelfOptionResponses] = useState({});

  // Section-level comments for performance areas (collated per section)
  const [sectionComments, setSectionComments] = useState({
    measurable: '',
    nonMeasurable: '',
    semiMeasurable: '',
  });

  const [isDirty, setIsDirty] = useState(false);

  // Raw API data for submit payload
  const [rawKraData, setRawKraData] = useState([]);
  const [rawQuestionsData, setRawQuestionsData] = useState([]);
  const [learningMetrics, setLearningMetrics] = useState({
    continuousLearningPresent: false,
    mandatoryCourses: 0,
    learningCourses: 0,
    speedCircular: 0,
    elearningScore: 0,
  });

  // Query key for reportee appraisal data
  const queryKey = ['reporteeAppraisal', empNo, normalizedFinancialYear, quarter, url];

  // Debug logging
  console.log('[useAnnualAppraisalReview] Context values:', {
    empNo,
    financialYear,
    normalizedFinancialYear,
    quarter,
    url,
    zoneName,
    roleType,
    isContextValid,
  });

  // Fetch reportee appraisal data
  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => {
      const apiParams = {
        empNo,
        financialYear: normalizedFinancialYear,
        quarter: quarter || 'Q2', // Default to Q2 for annual
        url,
        zoneName,
        roleType: roleType || 'Administrative Officers',
      };
      console.log('[useAnnualAppraisalReview] API call params:', apiParams);
      return appraisalAPI.getReporteeAppraisal(apiParams);
    },
    enabled: isContextValid,
  });

  // Transform API response
  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return transformAnnualAppraisalData(apiResponse);
  }, [apiResponse]);

  // Store raw API data when response changes
  useEffect(() => {
    if (!apiResponse) return;

    // Store raw KRA data
    const rawKras = apiResponse.result_kra_list_discretionary_non_measurable_child || [];
    setRawKraData(rawKras);

    // Store raw questions data
    const resultQuestions = apiResponse.result_questions?.development_inputs || {};
    const allQuestions = [
      ...(resultQuestions.overall_development || []),
      ...(resultQuestions.reporting_review_authority || []),
      ...(resultQuestions.integrity || []),
      ...(resultQuestions.health_problems || []),
      ...(resultQuestions.disciplinary_actions || []),
    ];
    setRawQuestionsData(allQuestions);

    // Store learning metrics
    setLearningMetrics({
      continuousLearningPresent: apiResponse.continuous_learning_present ?? false,
      mandatoryCourses: apiResponse.mandatory_courses ?? 0,
      learningCourses: apiResponse.learning_courses ?? 0,
      speedCircular: apiResponse.speed_circular ?? 0,
      elearningScore: apiResponse.elearning_score ?? 0,
    });
  }, [apiResponse]);

  // Extract development inputs - structured for appraiser/reviewer
  const developmentInputs = useMemo(() => {
    if (!apiResponse)
      return { overallDevelopment: [], reportingReviewAuthority: [], optionBased: [] };

    const resultQuestions = apiResponse.result_questions?.development_inputs || {};

    // Overall Development questions (appraisee responses - read-only)
    const overallDevelopment = (resultQuestions.overall_development || []).map((q) => ({
      id: q.ID,
      question: q.QUESTION,
      category: q.CATEGORY,
      subCategory: q.SUB_CATEGORY,
      selfResponse: q.SELF_RESPONSE || '',
      selfResponse2: q.SELF_RESPONSE_2 || '',
      repaResponse: q.REPA_RESPONSE || '',
      revaResponse: q.REVA_RESPONSE || '',
      responseId: q.RESPONSE_ID,
      editableBy: 'APPRAISEE', // Read-only for appraiser
    }));

    // Reporting/Review Authority questions (IDs 12-18 - editable by appraiser)
    const reportingReviewAuthority = (resultQuestions.reporting_review_authority || []).map(
      (q) => ({
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
      })
    );

    // Option-based inputs (integrity)
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

    // Health and Disciplinary (read-only for appraiser - show appraisee responses)
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
        editableBy: 'APPRAISEE', // Read-only
      });
    });

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
        editableBy: 'APPRAISEE', // Read-only
      });
    });

    return {
      overallDevelopment,
      reportingReviewAuthority,
      optionBased,
    };
  }, [apiResponse]);

  // Initialize appraiser scores from existing data
  useEffect(() => {
    if (!transformedData) return;

    // Initialize appraiser scores from existing REPA data
    const initialAppraiserScores = {};
    if (transformedData.nonMeasurableKras) {
      Object.values(transformedData.nonMeasurableKras).forEach((kraList) => {
        kraList.forEach((kra) => {
          initialAppraiserScores[kra.KraId] = {
            score: kra.RepaActuals || null,
            comment: kra.CommentRepa || '',
          };
        });
      });
    }
    setAppraiserScores(initialAppraiserScores);

    // Initialize appraiser development responses (IDs 12-18)
    const initialDevResponses = {};
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      initialDevResponses[q.id] = q.repaResponse || '';
    });
    setAppraiserDevResponses(initialDevResponses);

    // Initialize appraiser option responses
    developmentInputs.optionBased?.forEach((q) => {
      if (q.key === 'integrity' && q.editableBy === 'APPRAISER_REVIEWER') {
        setAppraiserOptionResponses((prev) => ({
          ...prev,
          integrity: q.repaResponse || null,
        }));
      }
    });

    // Initialize self development responses (overall development)
    const initialSelfDevResponses = {};
    developmentInputs.overallDevelopment?.forEach((q) => {
      initialSelfDevResponses[q.id] = {
        response: q.selfResponse || '',
        response2: q.selfResponse2 || '',
      };
    });
    setSelfDevResponses(initialSelfDevResponses);

    // Initialize self option responses (health, disciplinary)
    const initialSelfOptionResponses = {};
    developmentInputs.optionBased?.forEach((q) => {
      if (q.key === 'healthProblems' || q.key === 'disciplinaryActions') {
        initialSelfOptionResponses[q.key] = q.selfResponse?.toLowerCase() || null;
      }
    });
    setSelfOptionResponses(initialSelfOptionResponses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedData, developmentInputs]);

  // Error handling
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load reportee appraisal data. Please try again.');
    }
  }, [isError]);

  // Appraiser score change handler
  const handleAppraiserScoreChange = (kraId, score) => {
    setAppraiserScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        score,
      },
    }));
    setIsDirty(true);
  };

  // Appraiser comment change handler
  const handleAppraiserCommentChange = (kraId, comment) => {
    setAppraiserScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        comment,
      },
    }));
    setIsDirty(true);
  };

  // Development input change handler (for appraiser questions 12-18)
  const handleAppraiserDevInputChange = (questionId, value) => {
    setAppraiserDevResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setIsDirty(true);
  };

  // Option response change handler
  const handleAppraiserOptionChange = (key, value) => {
    setAppraiserOptionResponses((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  // Section comment change handler
  const handleSectionCommentChange = (section, value) => {
    setSectionComments((prev) => ({
      ...prev,
      [section]: value,
    }));
    setIsDirty(true);
  };

  // Self development input change handler (for editing appraisee's overall development)
  const handleSelfDevInputChange = (questionId, field, value) => {
    setSelfDevResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  // Self option response change handler (for editing appraisee's yes/no questions)
  const handleSelfOptionChange = (key, value) => {
    setSelfOptionResponses((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  /**
   * Build submit payload for appraiser review
   */
  const buildSubmitPayload = () => {
    // Build kraData array with appraiser scores
    const kraData = rawKraData.map((originalKra) => {
      const kraId = originalKra.AP_KRA_ID;
      const appraiserInput = appraiserScores[kraId] || {};

      return {
        ...originalKra,
        REPA_ACTUALS: appraiserInput.score || originalKra.REPA_ACTUALS,
        COMMENT_REPA: appraiserInput.comment || originalKra.COMMENT_REPA || null,
        FIRSTCOMMENT: appraiserInput.comment || originalKra.FIRSTCOMMENT || null,
      };
    });

    // Build questions array with appraiser responses (IDs 12-18)
    const questions = rawQuestionsData.map((originalQuestion) => {
      const questionId = originalQuestion.ID;
      const appraiserInput = appraiserDevResponses[questionId];

      return {
        QUESTION_ID: originalQuestion.ID,
        CATEGORY: originalQuestion.CATEGORY,
        SUB_CATEGORY: originalQuestion.SUB_CATEGORY,
        QUESTION: originalQuestion.QUESTION,
        OPTION1: originalQuestion.OPTION1 || null,
        OPTION2: originalQuestion.OPTION2 || null,
        OPTION3: originalQuestion.OPTION3 || null,
        RESPONSE_ID: originalQuestion.RESPONSE_ID || null,
        SELF_RESPONSE: originalQuestion.SELF_RESPONSE || null,
        SELF_RESPONSE_2: originalQuestion.SELF_RESPONSE_2 || null,
        REPA_RESPONSE:
          appraiserInput !== undefined ? appraiserInput : originalQuestion.REPA_RESPONSE || null,
        REVA_RESPONSE: originalQuestion.REVA_RESPONSE || null,
        AC_RESPONSE: originalQuestion.AC_RESPONSE || null,
        OPTIONS_REPA: originalQuestion.OPTIONS_REPA || null,
        OPTIONS_REVA: originalQuestion.OPTIONS_REVA || null,
      };
    });

    return {
      id: url || null,
      empNo,
      ecNumber: ecNumber,
      financialYear: parseInt(normalizedFinancialYear, 10),

      continuousLearningPresent: learningMetrics.continuousLearningPresent,
      mandatoryCourses: learningMetrics.mandatoryCourses,
      learningCourses: learningMetrics.learningCourses,
      speedCircular: learningMetrics.speedCircular,
      elearningScore: learningMetrics.elearningScore,

      kraData,
      functions: [...new Set(kraData.map((kra) => kra.KRA_DESC).filter(Boolean))],
      feedbackInput: [],
      questions,

      // Performance section comments (collated per section)
      performanceMeasurableComment: sectionComments.measurable || '',
      performanceNonMeasurableComment: sectionComments.nonMeasurable || '',
      performanceSemiMeasurableComment: sectionComments.semiMeasurable || '',

      warningFlag: false,
      warningComment: '',
      varianceFlag: false,
    };
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = [];

    // Check if all KRAs have appraiser scores and comments
    rawKraData.forEach((kra) => {
      const kraId = kra.AP_KRA_ID;
      const appraiserInput = appraiserScores[kraId];
      if (!appraiserInput?.score) {
        errors.push(`Please select an appraiser score for "${kra.KRA_DESC}"`);
      }
      if (!appraiserInput?.comment?.trim()) {
        errors.push(`Please provide an appraiser comment for "${kra.KRA_DESC}"`);
      }
    });

    // Check if all Reporting Authority questions (12-18) are filled
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      const response = appraiserDevResponses[q.id];
      if (!response?.trim()) {
        errors.push(`Please provide a response for "${q.question.substring(0, 50)}..."`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.submitReporteeAppraisal(payload),
    onSuccess: (response) => {
      console.log('[useAnnualAppraisalReview] Submit success:', response);
      // Handle both response formats: { message: '...' } or { MSG: '...' }
      const successMessage = response.message || response.MSG || 'Appraisal submitted successfully';
      toast.success(successMessage);
      setIsDirty(false);
      // navigate(-1);
    },
    onError: (error) => {
      console.error('[useAnnualAppraisalReview] Submit error:', error);
      const errorMessage =
        error.response?.data?.MSG ||
        error.message ||
        'Failed to submit appraisal. Please try again.';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    // Prevent default form submission behavior (page reload)
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const { isValid, errors } = validateForm();

    if (!isValid) {
      const displayErrors = errors.slice(0, 3);
      displayErrors.forEach((err) => toast.error(err));
      if (errors.length > 3) {
        toast.warning(`And ${errors.length - 3} more validation errors...`);
      }
      return;
    }

    const payload = buildSubmitPayload();
    console.log('[useAnnualAppraisalReview] Submit payload:', payload);
    submitMutation.mutate(payload);
  };

  return {
    // Data
    data: transformedData,
    developmentInputs,
    isLoading,
    isError,

    // Context
    context: {
      employee: employeeFromState || {
        name: apiResponse?.employee_name || '',
        empNo: empNo,
        designation: apiResponse?.designation || '',
        branch: apiResponse?.branch || '',
      },
      financialYear,
      quarter,
      appraisalPeriod,
      // Ensure dateRange is a string, not an object
      dateRange:
        typeof dateRangeFromState === 'string'
          ? dateRangeFromState
          : dateRangeFromState?.startDate && dateRangeFromState?.endDate
          ? `${dateRangeFromState.startDate} - ${dateRangeFromState.endDate}`
          : '',
      metadata: transformedData?.metadata || {},
    },

    // Form state
    formState: {
      appraiserScores,
      appraiserDevResponses,
      appraiserOptionResponses,
      selfDevResponses,
      selfOptionResponses,
      sectionComments,
      isDirty,
    },

    // Actions
    actions: {
      handleSubmit,
      handleAppraiserScoreChange,
      handleAppraiserCommentChange,
      handleAppraiserDevInputChange,
      handleAppraiserOptionChange,
      handleSelfDevInputChange,
      handleSelfOptionChange,
      handleSectionCommentChange,
      isSubmitting: submitMutation.isPending,
    },
  };
};
