import { useState, useMemo, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';

/**
 * Custom hook for managing Appeal Review functionality
 * Handles data fetching, state management, and business logic
 * Supports both location.state and URL query params for flexibility
 */
export const useReviewAppeal = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract context from location state OR URL query params
  const context = useMemo(() => ({
    roleId: searchParams.get('roleId') || location.state?.roleId || '4',
    roleType: searchParams.get('roleType') || location.state?.roleType || 'Administrative Officer',
    empNo: searchParams.get('empNo') || location.state?.empNo || '38965',
    financialYear: searchParams.get('financialYear') || location.state?.financialYear || '2025',
    role: searchParams.get('role') || location.state?.role || 'APPRAISER', // APPRAISER or REVIEWER
  }), [location.state, searchParams]);

  // Form state management
  const [selectedKras, setSelectedKras] = useState(new Set());
  const [kraActions, setKraActions] = useState(new Map());
  const [kraScores, setKraScores] = useState(new Map());
  const [kraComments, setKraComments] = useState(new Map());
  const [overallComment, setOverallComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch appeal review data using actual API endpoint
  const { data: apiResponse, isLoading, isError, error } = useQuery({
    queryKey: ['appealReview', context.roleId, context.roleType, context.empNo, context.financialYear],
    queryFn: () => appraisalAPI.getAppealCommitteeReviewData({
      roleId: context.roleId,
      roleType: context.roleType,
      empNo: context.empNo,
      financialYear: context.financialYear
    }),
    enabled: !!(context.roleId && context.roleType && context.empNo && context.financialYear),
  });

  // Transform API response to component data structure
  const data = useMemo(() => {
    if (!apiResponse) {
      return {
        employee: {},
        dateRange: '',
        discretionaryScore: { oldScore: 0, newScore: 0 },
        finalScoreSummary: [],
        measurableKras: [],
        nonMeasurableKras: [],
        fileUrl: null,
        reportingAuthorityNo: '',
        reviewingAuthorityNo: '',
        acceptingAuthorityNo: '',
        rawData: null
      };
    }

    const rawData = apiResponse;

    // Transform final score summary from annual_score_data
    const finalScoreSummary = (rawData.final_summary_result?.annual_score_data || []).map(item => ({
      KraName: item.CATEGORY || '',
      MaxScore: item.MAX_SCORE || 0,
      SelfScore: item.SELF_SCORE || 0,
      ReportingAuthorityScore: item.BY_REPORTING_AUTHORITY || 0,
      ReviewingAuthorityScore: item.BY_REVIEVING_AUTHORITY || 0,
      AcceptingAuthorityScore: item.BY_ACCEPTING_AUTHORITY || 0,
      PostAppealScore: item.POST_APPEAL_SCORE || 0
    }));

    // Transform measurable KRAs - use APPEAL_ID as unique identifier
    const measurableKrasList = rawData.result_kra_list_discretionary_measurable_child || [];
    const measurableKras = Array.isArray(measurableKrasList) ? measurableKrasList.map((kra, index) => ({
      kraId: kra.AP_KRA_ID,
      appealId: kra.APPEAL_ID || `m-${index}`, // Use APPEAL_ID as unique key
      kraName: kra.KRA_DESC || '',
      kraType: kra.KRA_TYPE || 'discretionary_measurable',
      description: kra.KRA_METRIC || '',
      actual: kra.AC_ACTUALS || kra.ACTUAL,
      target: kra.AC_TARGET || kra.TARGET,
      maxScore: kra.MAX_SCORE || 0,
      oldScore: kra.SCORE_OLD_VALUE || 0,
      newScore: kra.SCORE_NEW_VALUE || 0,
      actualOldValue: kra.ACTUAL_OLD_VALUE,
      actualNewValue: kra.ACTUAL_NEW_VALUE,
      targetOldValue: kra.TARGET_OLD_VALUE,
      targetNewValue: kra.TARGET_NEW_VALUE,
      appraiseeComment: kra.COMMENTS || '',
      appraiseeScore: kra.SELF_SCORE,
      appraiserScore: kra.REPA_SCORE,
      reviewerScore: kra.REVA_SCORE,
      status: kra.STATUS || '',
      mpbOldValue: kra.MPB_OLD_VALUE,
      mpbNewValue: kra.MPB_NEW_VALUE
    })) : [];

    // Transform non-measurable KRAs - use APPEAL_ID as unique identifier
    const nonMeasurableKrasList = rawData.result_kra_list_discretionary_non_measurable_child || [];
    const nonMeasurableKras = Array.isArray(nonMeasurableKrasList) ? nonMeasurableKrasList.map((kra, index) => ({
      kraId: kra.AP_KRA_ID,
      appealId: kra.APPEAL_ID || `nm-${index}`, // Use APPEAL_ID as unique key
      kraName: kra.KRA_DESC || '',
      kraType: kra.KRA_TYPE || 'discretionary_non_measurable',
      description: kra.KRA_METRIC || '',
      actual: kra.AC_ACTUALS || kra.ACTUAL,
      target: kra.AC_TARGET || kra.TARGET,
      maxScore: kra.MAX_SCORE || 0,
      oldScore: kra.SCORE_OLD_VALUE || 0,
      newScore: kra.SCORE_NEW_VALUE || 0,
      actualOldValue: kra.ACTUAL_OLD_VALUE,
      actualNewValue: kra.ACTUAL_NEW_VALUE,
      targetOldValue: kra.TARGET_OLD_VALUE,
      targetNewValue: kra.TARGET_NEW_VALUE,
      appraiseeComment: kra.COMMENTS || '',
      appraiseeScore: kra.SELF_SCORE,
      appraiserScore: kra.REPA_SCORE,
      reviewerScore: kra.REVA_SCORE,
      status: kra.STATUS || '',
      mpbOldValue: kra.MPB_OLD_VALUE,
      mpbNewValue: kra.MPB_NEW_VALUE
    })) : [];

    // Calculate discretionary scores
    const discretionaryOldTotal = [...measurableKras, ...nonMeasurableKras].reduce((sum, kra) => sum + (parseFloat(kra.oldScore) || 0), 0);
    const discretionaryNewTotal = [...measurableKras, ...nonMeasurableKras].reduce((sum, kra) => sum + (parseFloat(kra.newScore) || 0), 0);
    const discretionaryMaxTotal = rawData.discretionary_maxscore_total ||
                                   rawData.discretionary_non_measurable_maxscore_total || 0;

    return {
      employee: {
        empNo: context.empNo,
        employeeName: rawData.emp_name || '',
        branch: rawData.organisation || '',
        primaryRole: rawData.primary || '',
        appraiser: rawData.REPORTING_AUTHORITY_NAME || '',
        appraiserNo: rawData.REPORTING_AUTHORITY_NO || '',
        reviewer: rawData.REVIEWING_AUTHORITY_NAME || '',
        reviewerNo: rawData.REVIEWING_AUTHORITY_NO || '',
        acceptor: rawData.ACCEPTING_AUTHORITY_NAME || '',
        acceptorNo: rawData.ACCEPTING_AUTHORITY_NO || ''
      },
      dateRange: rawData.startdate && rawData.enddate ? `${rawData.startdate} - ${rawData.enddate}` : '',
      discretionaryScore: {
        oldScore: discretionaryOldTotal.toFixed(1),
        newScore: discretionaryNewTotal.toFixed(1),
        maxScore: discretionaryMaxTotal
      },
      finalScoreSummary,
      measurableKras,
      nonMeasurableKras,
      fileUrl: rawData.file_url || null,
      reportingAuthorityNo: rawData.REPORTING_AUTHORITY_NO || '',
      reviewingAuthorityNo: rawData.REVIEWING_AUTHORITY_NO || '',
      acceptingAuthorityNo: rawData.ACCEPTING_AUTHORITY_NO || '',
      totalKraCount: rawData.total_kra_count || 0,
      appealStatus: rawData.appeal_status || '',
      rawData
    };
  }, [apiResponse, context.empNo]);

  // KRA selection handler
  const handleKraSelection = useCallback((kraId) => {
    setSelectedKras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kraId)) {
        newSet.delete(kraId);
        // Clear related state when deselected
        setKraActions(prev => {
          const newMap = new Map(prev);
          newMap.delete(kraId);
          return newMap;
        });
        setKraScores(prev => {
          const newMap = new Map(prev);
          newMap.delete(kraId);
          return newMap;
        });
        setKraComments(prev => {
          const newMap = new Map(prev);
          newMap.delete(kraId);
          return newMap;
        });
      } else {
        newSet.add(kraId);
      }
      return newSet;
    });
  }, []);

  // Action change handler
  const handleActionChange = useCallback((kraId, action) => {
    setKraActions(prev => {
      const newMap = new Map(prev);
      newMap.set(kraId, action);
      return newMap;
    });

    // Clear score when action is not ACCEPT_AND_EDIT
    if (action !== 'ACCEPT_AND_EDIT') {
      setKraScores(prev => {
        const newMap = new Map(prev);
        newMap.delete(kraId);
        return newMap;
      });
    }
  }, []);

  // Score change handler
  const handleScoreChange = useCallback((kraId, score) => {
    setKraScores(prev => {
      const newMap = new Map(prev);
      newMap.set(kraId, score);
      return newMap;
    });
  }, []);

  // Comment change handler
  const handleCommentChange = useCallback((kraId, comment) => {
    setKraComments(prev => {
      const newMap = new Map(prev);
      newMap.set(kraId, comment);
      return newMap;
    });
  }, []);

  // Overall comment handler
  const handleOverallCommentChange = useCallback((comment) => {
    setOverallComment(comment);
  }, []);

  // Helper function to find KRA by appealId (unique identifier)
  const findKraById = useCallback((appealId) => {
    const measurable = data.measurableKras.find(k => k.appealId === appealId);
    if (measurable) return { kra: measurable, type: 'measurable' };

    const nonMeasurable = data.nonMeasurableKras.find(k => k.appealId === appealId);
    if (nonMeasurable) return { kra: nonMeasurable, type: 'non-measurable' };

    return null;
  }, [data]);

  // Validation logic
  const isValid = useMemo(() => {
    if (selectedKras.size === 0) return false;
    if (overallComment.trim() === '') return false;

    // Validate each selected KRA has an action
    for (const kraId of selectedKras) {
      const action = kraActions.get(kraId);
      if (!action) return false;

      // If ACCEPT_AND_EDIT, must have a valid score
      if (action === 'ACCEPT_AND_EDIT') {
        const score = kraScores.get(kraId);
        if (!score || isNaN(parseFloat(score))) return false;

        // Score must be within max score
        const kraInfo = findKraById(kraId);
        if (kraInfo && parseFloat(score) > kraInfo.kra.maxScore) return false;
      }

      // If REJECT, must have a comment
      if (action === 'REJECT') {
        const comment = kraComments.get(kraId);
        if (!comment || comment.trim() === '') return false;
      }
    }

    return true;
  }, [selectedKras, kraActions, kraScores, kraComments, overallComment, findKraById]);

  // Determine overall status based on actions
  const determineOverallStatus = useCallback(() => {
    const actions = Array.from(selectedKras).map(id => kraActions.get(id));
    const allAccepted = actions.every(a => a === 'ACCEPT_AS_IS' || a === 'ACCEPT_AND_EDIT');
    const allRejected = actions.every(a => a === 'REJECT');

    if (allAccepted) return 'APPROVED';
    if (allRejected) return 'REJECTED';
    return 'PARTIALLY_APPROVED';
  }, [selectedKras, kraActions]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      throw new Error('Please complete all required fields');
    }

    setIsSubmitting(true);

    try {
      // Build payload
      const payload = {
        roleId: context.roleId,
        roleType: context.roleType,
        empNo: context.empNo,
        financialYear: context.financialYear,
        reviewerRole: context.role,
        kraDecisions: Array.from(selectedKras).map(kraId => {
          const kraInfo = findKraById(kraId);
          const kra = kraInfo?.kra;
          const action = kraActions.get(kraId);
          const score = kraScores.get(kraId);
          const comment = kraComments.get(kraId);

          return {
            kraId: kraId,
            action: action,
            newScore: action === 'ACCEPT_AND_EDIT' ? parseFloat(score) : null,
            comment: comment || '',
            oldScore: kra?.oldScore,
            appealedScore: kra?.newScore,
            kraType: kra?.kraType
          };
        }),
        overallComment: overallComment,
        status: determineOverallStatus()
      };

      // Call API
      const response = await appraisalAPI.approveAppealReview(payload);

      setIsSubmitting(false);
      return response;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [
    isValid,
    selectedKras,
    kraActions,
    kraScores,
    kraComments,
    overallComment,
    context,
    findKraById,
    determineOverallStatus
  ]);

  return {
    data,
    context,
    formState: {
      selectedKras,
      kraActions,
      kraScores,
      kraComments,
      overallComment
    },
    actions: {
      handleKraSelection,
      handleActionChange,
      handleScoreChange,
      handleCommentChange,
      handleOverallCommentChange,
      handleSubmit,
      isSubmitting
    },
    isValid,
    isLoading,
    isError,
    error
  };
};
