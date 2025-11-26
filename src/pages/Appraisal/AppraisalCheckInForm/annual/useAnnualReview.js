import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { toast } from 'react-toastify';
import { transformAnnualAppraisalData } from '../appraisalTransformers';

/**
 * Annual Review Hook (Reviewer/Acceptor)
 *
 * Handles reviewer/acceptor flow for annual appraisals including:
 * - Data fetching via getAcceptorAppraisal
 * - Reviewer scores and comments for each KRA
 * - Development input responses for Reviewing Authority
 * - Role switching between REVIEWER and ACCEPTOR
 * - Submit-only functionality (no save draft)
 * 
 * Supports both location.state and URL search params:
 * /appraisal/annual/reviewer?empNo=38965&financialYear=FY%202024-25&quarter=Q2&url=4&zoneName=Zone&roleType=Administrative%20Officers
 */
export const useAnnualReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract params from location.state first, fallback to URL search params
  const stateParams = location.state || {};
  const {
    empNo = searchParams.get('empNo') || '',
    financialYear = searchParams.get('financialYear') || '',
    quarter = searchParams.get('quarter') || 'Q2',
    url = searchParams.get('url') || '',
    urlId = searchParams.get('urlId') || '',
    zoneName = searchParams.get('zoneName') || '',
    roleType = searchParams.get('roleType') || 'Administrative Officers',
    employee: employeeFromState,
    appraisalPeriod = searchParams.get('appraisalPeriod') || 'Annual',
    dateRange: dateRangeFromState,
  } = stateParams;

  // Normalize financial year (e.g., "FY 2024-25" -> "2024")
  const normalizedFinancialYear = useMemo(() => {
    if (!financialYear) return null;
    const match = financialYear.match(/(\d{4})/);
    return match ? match[1] : financialYear;
  }, [financialYear]);

  // Context validation
  const isContextValid = Boolean(empNo && normalizedFinancialYear && (url || urlId));

  // Reviewer scores per KRA: { [AP_KRA_ID]: { score, comment } }
  const [reviewerScores, setReviewerScores] = useState({});

  // Development responses: { [questionId]: string }
  const [reviewerDevResponses, setReviewerDevResponses] = useState({});

  // Option-based responses: { integrity: null }
  const [reviewerOptionResponses, setReviewerOptionResponses] = useState({
    integrity: null,
  });

  const [isDirty, setIsDirty] = useState(false);

  // Raw API data for payload building
  const [rawKraData, setRawKraData] = useState([]);
  const [rawQuestionsData, setRawQuestionsData] = useState([]);
  const [learningMetrics, setLearningMetrics] = useState({
    continuousLearningPresent: false,
    mandatoryCourses: 0,
    learningCourses: 0,
    speedCircular: 0,
    elearningScore: 0,
  });

  // Query key for acceptor appraisal data
  const queryKey = [
    'acceptorAppraisal',
    empNo,
    normalizedFinancialYear,
    quarter,
    url || urlId,
  ];

  // Debug logging
  console.log('[useAnnualReview] Context values:', {
    empNo,
    financialYear,
    normalizedFinancialYear,
    quarter,
    url,
    urlId,
    zoneName,
    roleType,
    isContextValid,
  });

  // Fetch acceptor appraisal data
  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => {
      const apiParams = {
        empNo,
        url: url || urlId,
        roleType,
        roleId: null,
        zoneName,
        financialYear: normalizedFinancialYear,
        appraisalPeriod: 'Annual',
        quarter: quarter || 'Q2',
        appraisalStatus: null,
      };
      console.log('[useAnnualReview] API call params:', apiParams);
      return appraisalAPI.getAcceptorAppraisal(apiParams);
    },
    enabled: isContextValid,
  });

  // Transform API response using existing transformer
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

  // Extract development inputs
  const developmentInputs = useMemo(() => {
    if (!apiResponse) {
      return {
        overallDevelopment: [],
        reportingReviewAuthority: [],
        optionBased: []
      };
    }

    const resultQuestions = apiResponse.result_questions?.development_inputs || {};

    // Overall Development (Appraisee - Read-only)
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
      editableBy: 'APPRAISEE', // Read-only for reviewer
    }));

    // Reporting/Review Authority (Editable by REVIEWER/ACCEPTOR)
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
      editableBy: 'REVIEWER_ACCEPTOR',
    }));

    // Option-based inputs
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
        acResponse: q.AC_RESPONSE || '',
        editableBy: 'REVIEWER_ACCEPTOR',
      });
    });

    // Health Problems (ID 10) - Yes/No (Read-only)
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

    // Disciplinary Actions (ID 11) - Yes/No (Read-only)
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

    return { overallDevelopment, reportingReviewAuthority, optionBased };
  }, [apiResponse]);

  // Initialize reviewer scores from existing data
  useEffect(() => {
    if (!transformedData) return;

    // Initialize reviewer scores from existing data
    const initialReviewerScores = {};
    if (transformedData.nonMeasurableKras) {
      Object.values(transformedData.nonMeasurableKras).forEach((kraList) => {
        kraList.forEach((kra) => {
          initialReviewerScores[kra.KraId] = {
            score: kra.RevaActuals || kra.AcActuals || null,
            comment: kra.CommentReva || kra.CommentAc || '',
          };
        });
      });
    }
    setReviewerScores(initialReviewerScores);

    // Initialize reviewer development responses
    const initialDevResponses = {};
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      const existingResponse = q.revaResponse || q.acResponse || '';
      initialDevResponses[q.id] = existingResponse;
    });
    setReviewerDevResponses(initialDevResponses);

    // Initialize reviewer option responses
    developmentInputs.optionBased?.forEach((q) => {
      if (q.key === 'integrity' && q.editableBy === 'REVIEWER_ACCEPTOR') {
        const existingResponse = q.revaResponse || q.acResponse || null;
        setReviewerOptionResponses((prev) => ({
          ...prev,
          integrity: existingResponse,
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedData]);

  // Error handling
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load acceptor appraisal data. Please try again.');
    }
  }, [isError]);

  // Change handlers
  const handleReviewerScoreChange = (kraId, score) => {
    setReviewerScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        score,
      },
    }));
    setIsDirty(true);
  };

  const handleReviewerCommentChange = (kraId, comment) => {
    setReviewerScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        comment,
      },
    }));
    setIsDirty(true);
  };

  const handleReviewerDevInputChange = (questionId, value) => {
    setReviewerDevResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setIsDirty(true);
  };

  const handleReviewerOptionChange = (key, value) => {
    setReviewerOptionResponses((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  /**
   * Build submit payload for reviewer/acceptor
   */
  const buildSubmitPayload = () => {
    // Build kraData array with reviewer updates
    const kraData = rawKraData.map((originalKra) => {
      const kraId = originalKra.AP_KRA_ID;
      const reviewerInput = reviewerScores[kraId] || {};

      return {
        ...originalKra,
        REVA_ACTUALS: reviewerInput.score || originalKra.REVA_ACTUALS,
        COMMENT_REVA: reviewerInput.comment || originalKra.COMMENT_REVA || null,
        REVA_SCORE: reviewerInput.score || originalKra.REVA_SCORE,
        AC_ACTUALS: reviewerInput.score || originalKra.AC_ACTUALS,
        COMMENT_AC: reviewerInput.comment || originalKra.COMMENT_AC || null,
        AC_SCORE: reviewerInput.score || originalKra.AC_SCORE,
        // FIRSTCOMMENT field as per CURL payload
        FIRSTCOMMENT: reviewerInput.comment || originalKra.COMMENT_REVA || originalKra.COMMENT_AC || null,
      };
    });

    // Build questions array with reviewer responses
    const questions = rawQuestionsData.map((originalQuestion) => {
      const questionId = originalQuestion.ID;
      const reviewerResponse = reviewerDevResponses[questionId];

      // Determine integrityOption for integrity questions
      const isIntegrityQuestion = originalQuestion.CATEGORY === 'Development Inputs' &&
          originalQuestion.SUB_CATEGORY === 'Integrity';
      const integrityValue = isIntegrityQuestion ? reviewerOptionResponses.integrity : null;

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
        SELF_RESPONSE_OPTION: originalQuestion.SELF_RESPONSE || null,
        REPA_RESPONSE: originalQuestion.REPA_RESPONSE || null,
        REVA_RESPONSE: reviewerResponse || originalQuestion.REVA_RESPONSE || null,
        AC_RESPONSE: reviewerResponse || originalQuestion.AC_RESPONSE || null,
        OPTIONS_REPA: originalQuestion.OPTIONS_REPA || null,
        OPTIONS_REVA: integrityValue || originalQuestion.OPTIONS_REVA || null,
        integrityOption: integrityValue,
      };
    });

    // Derive functions array from unique KRA_DESC
    const functions = [...new Set(kraData.map((kra) => kra.KRA_DESC).filter(Boolean))];

    return {
      id: url || urlId || null,
      empNo,
      ecNumber: empNo,
      financialYear: parseInt(normalizedFinancialYear, 10),

      // Learning metrics
      continuousLearningPresent: learningMetrics.continuousLearningPresent,
      mandatoryCourses: learningMetrics.mandatoryCourses,
      learningCourses: learningMetrics.learningCourses,
      speedCircular: learningMetrics.speedCircular,
      elearningScore: learningMetrics.elearningScore,

      kraData,
      functions,
      questions,
      feedbackInput: [],

      // Performance comments (empty for now, can be added to UI later)
      performanceMeasurableComment: '',
      performanceNonMeasurableComment: '',
      performanceSemiMeasurableComment: '',

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

    // Check all KRAs have reviewer scores
    rawKraData.forEach((kra) => {
      const kraId = kra.AP_KRA_ID;
      if (!reviewerScores[kraId]?.score) {
        errors.push(`Please select a score for "${kra.KRA_DESC}"`);
      }
    });

    // Check all required development questions are filled
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      if (q.editableBy === 'REVIEWER_ACCEPTOR') {
        const response = reviewerDevResponses[q.id];
        if (!response?.trim()) {
          errors.push(`Please provide a response for "${q.question.substring(0, 50)}..."`);
        }
      }
    });

    // Check integrity option is selected (if applicable)
    developmentInputs.optionBased?.forEach((q) => {
      if (q.key === 'integrity' && q.editableBy === 'REVIEWER_ACCEPTOR') {
        if (!reviewerOptionResponses.integrity) {
          errors.push('Please select an integrity assessment');
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload) => {
      console.log('[useAnnualReview] Submitting acceptor review:', payload);
      return appraisalAPI.submitAcceptorAppraisal(payload);
    },
    onSuccess: (response) => {
      console.log('[useAnnualReview] Submit success:', response);
      toast.success(response?.MSG === 'success' ? 'Review submitted successfully' : (response?.MSG || 'Review submitted successfully'));
      setIsDirty(false);
      navigate(-1);
    },
    onError: (error) => {
      console.error('[useAnnualReview] Submit error:', error);
      const errorMessage =
        error.response?.data?.MSG || error.message || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    const { isValid, errors } = validateForm();

    if (!isValid) {
      // Show first 3 errors max to avoid overwhelming the user
      const displayErrors = errors.slice(0, 3);
      displayErrors.forEach((err) => toast.error(err));
      if (errors.length > 3) {
        toast.warning(`And ${errors.length - 3} more validation errors...`);
      }
      return;
    }

    const payload = buildSubmitPayload();
    console.log('[useAnnualReview] Submit payload:', payload);
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
        name: apiResponse?.emp_name || '',
        empNo: empNo,
        designation: apiResponse?.designation || '',
        branch: apiResponse?.branch || '',
      },
      financialYear,
      quarter,
      appraisalPeriod,
      dateRange: dateRangeFromState || `Q${quarter || '2'} - FY ${financialYear || 'N/A'}`,
      metadata: {
        reportingAuthorityName: apiResponse?.REPORTING_AUTHORITY_NAME || '',
        reviewingAuthorityName: apiResponse?.REVIEWING_AUTHORITY_NAME || '',
        acceptingAuthorityName: apiResponse?.ACCEPTING_AUTHORITY_NAME || '',
        ...(transformedData?.metadata || {}),
      },
    },

    // Form state
    formState: {
      reviewerScores,
      reviewerDevResponses,
      reviewerOptionResponses,
      isDirty,
    },

    // Actions
    actions: {
      handleSubmit,
      handleReviewerScoreChange,
      handleReviewerCommentChange,
      handleReviewerDevInputChange,
      handleReviewerOptionChange,
      isSubmitting: submitMutation.isPending,
    },
  };
};
