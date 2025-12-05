import { useState, useMemo, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';

/**
 * Custom hook for managing Add Appeal functionality
 * Handles data fetching, state management, and business logic
 * Supports both location.state and URL query params for flexibility
 */
export const useAddAppeal = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Extract context from location state OR URL query params (query params take precedence for direct URL access)
  const context = useMemo(() => ({
    financialYear: searchParams.get('financialYear') || location.state?.financialYear || "2025",
    appraisalPeriod: searchParams.get('appraisalPeriod') || location.state?.appraisalPeriod || "Annual",
    quarter: searchParams.get('quarter') || location.state?.quarter,
    dateRange: location.state?.dateRange || "01 Apr 2025 - 31 Mar 2026",
    employee: location.state?.employee || {
      empNo: searchParams.get('empNo') || "36663",
      employeeName: searchParams.get('employeeName') || "Demo User",
      primaryRole: searchParams.get('primaryRole') || "Branch Manager",
      branch: searchParams.get('branch') || "Mumbai Main",
      appraiser: searchParams.get('appraiser') || "Jane Smith",
      roles: ["Role 1", "Role 2", "Role 3", "Role 4"]
    },
    role: searchParams.get('role') || location.state?.role || "APPRAISEE",
    roleId: searchParams.get('roleId') || location.state?.roleId,
    roleType: searchParams.get('roleType') || location.state?.roleType,
    task:searchParams.get('task')
  }), [location.state, searchParams]);

  console.log("DLADf:",context);
  
  // Form state management
  const [selectedKras, setSelectedKras] = useState(new Set());
  const [appealTexts, setAppealTexts] = useState(new Map());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for editable fields
  const [actualValueEdits, setActualValueEdits] = useState(new Map());
  const [finalScoreEdits, setFinalScoreEdits] = useState(new Map());
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Fetch appeal report data using actual API endpoint
  const { data: apiResponse, isLoading, isError, error } = useQuery({
    queryKey: ['appealReport', context.roleId, context.roleType],
    queryFn: () => { 

      if(context.task =="view"){
        return appraisalAPI.getAppealReportView({
          roleId: context.roleId,
          roleType: context.roleType,
          empNo: context.employee.empNo,
          financialYear: context.financialYear,
          appraisalPeriod: context.appraisalPeriod 
        });
      }
      
      return appraisalAPI.getAppealReport({
      roleId: context.roleId,
      roleType: context.roleType,
    })},
    enabled: !!(context.roleId && context.roleType),
  });

  // Transform API response to component data structure
  const data = useMemo(() => {
    if (!apiResponse) {
      return {
        finalScoreSummary: [],
        measurableKras: {},
        nonMeasurableKras: {},
        totalMeasurableActual: 0,
        totalMeasurableMax: 0,
        totalNonMeasurableActual: 0,
        totalNonMeasurableMax: 0,
        rawData: null
      };
    }

    // Extract raw data from API response
    const rawData = apiResponse;

    // Build final score summary from quarterly score panel
    const finalScoreSummary = (rawData.QUARTERLY_SCORE_TOP_PANEL || []).map(item => ({
      KraName: item.CYCLE,
      KraWeight: item.WEIGHTAGE,
      Score: item.SCORE,
      Performance: item.PERFORMANCE
    }));

    // Transform non-measurable KRAs (discretionary_non_measurable)
    const nonMeasurableKras = {};
    const nonMeasurableList = rawData.result_kra_list_discretionary_non_measurable_child || [];
    
    // Group by KRA_TYPE or use a default group
    nonMeasurableList.forEach(kra => {
      const groupName = "Discretionary Non-Measurable KRAs";
      if (!nonMeasurableKras[groupName]) {
        nonMeasurableKras[groupName] = [];
      }
      nonMeasurableKras[groupName].push({
        KraId: kra.AP_KRA_ID,
        KraCode: kra.KRA_CODE,
        KraName: kra.KRA_DESC,
        KraDescription: kra.KRA_METRIC,
        KraType: kra.KRA_TYPE,
        Target: kra.TARGET,
        Actual: kra.ACTUAL,
        Score: kra.SCORE,
        MaxScore: kra.MAX_SCORE,
        CommentSelf1: kra.COMMENT_SELF_1 || "",
        CommentSelf2: kra.COMMENT_SELF_2 || "",
        AppraiserActual: kra.APPRAISER_ACTUAL,
        ReviewerActual: kra.REVIEWER_ACTUAL,
        AcceptorActual: kra.ACCEPTOR_ACTUAL,
        RepaScore: kra.POST_APPEAL_SCORE,
        Tooltip: kra.IT_TOOLTIP || kra.IA_TOOLTIP || "",
        ParentKraCode: kra.PARENT_KRA_CODE,
        Mpb: kra.MPB,
        Bonus: kra.BONUS
      });
    });

    // Transform measurable KRAs (if available)
    const measurableKras = {};
    const measurableList = rawData.result_kra_list_discretionary_measurable_child || {};
    
    // Handle if it's an object with grouped data or an array
    if (Array.isArray(measurableList)) {
      measurableList.forEach(kra => {
        const groupName = "Discretionary Measurable KRAs";
        if (!measurableKras[groupName]) {
          measurableKras[groupName] = [];
        }
        measurableKras[groupName].push({
          KraId: kra.AP_KRA_ID,
          KraCode: kra.KRA_CODE,
          KraName: kra.KRA_DESC,
          KraDescription: kra.KRA_METRIC,
          KraType: kra.KRA_TYPE,
          Target: kra.TARGET,
          Actual: kra.ACTUAL,
          Score: kra.SCORE,
          MaxScore: kra.MAX_SCORE,
          CommentSelf1: kra.COMMENT_SELF_1 || "",
          CommentSelf2: kra.COMMENT_SELF_2 || "",
          AppraiserActual: kra.APPRAISER_ACTUAL,
          ReviewerActual: kra.REVIEWER_ACTUAL,
          AcceptorActual: kra.ACCEPTOR_ACTUAL,
          RepaScore: kra.POST_APPEAL_SCORE,
          Tooltip: kra.IT_TOOLTIP || kra.IA_TOOLTIP || "",
          ParentKraCode: kra.PARENT_KRA_CODE,
          Mpb: kra.MPB,
          Bonus: kra.BONUS
        });
      });
    }

    // Also include non-measurable KRAs from result_kra_list_non_measurable_child if present
    const nonMeasurableChildList = rawData.result_kra_list_non_measurable_child || {};
    if (Array.isArray(nonMeasurableChildList)) {
      nonMeasurableChildList.forEach(kra => {
        const groupName = "Non-Measurable KRAs";
        if (!nonMeasurableKras[groupName]) {
          nonMeasurableKras[groupName] = [];
        }
        nonMeasurableKras[groupName].push({
          KraId: kra.AP_KRA_ID,
          KraCode: kra.KRA_CODE,
          KraName: kra.KRA_DESC,
          KraDescription: kra.KRA_METRIC,
          KraType: kra.KRA_TYPE,
          Target: kra.TARGET,
          Actual: kra.ACTUAL,
          Score: kra.SCORE,
          MaxScore: kra.MAX_SCORE,
          CommentSelf1: kra.COMMENT_SELF_1 || "",
          CommentSelf2: kra.COMMENT_SELF_2 || "",
          AppraiserActual: kra.APPRAISER_ACTUAL,
          ReviewerActual: kra.REVIEWER_ACTUAL,
          AcceptorActual: kra.ACCEPTOR_ACTUAL,
          RepaScore: kra.POST_APPEAL_SCORE,
          Tooltip: kra.IT_TOOLTIP || kra.IA_TOOLTIP || "",
          ParentKraCode: kra.PARENT_KRA_CODE,
          Mpb: kra.MPB,
          Bonus: kra.BONUS
        });
      });
    }

    // Include measurable KRAs from result_kra_list_measurable_child if present
    const measurableChildList = rawData.result_kra_list_measurable_child || {};
    if (Array.isArray(measurableChildList)) {
      measurableChildList.forEach(kra => {
        const groupName = "Measurable KRAs";
        if (!measurableKras[groupName]) {
          measurableKras[groupName] = [];
        }
        measurableKras[groupName].push({
          KraId: kra.AP_KRA_ID,
          KraCode: kra.KRA_CODE,
          KraName: kra.KRA_DESC,
          KraDescription: kra.KRA_METRIC,
          KraType: kra.KRA_TYPE,
          Target: kra.TARGET,
          Actual: kra.ACTUAL,
          Score: kra.SCORE,
          MaxScore: kra.MAX_SCORE,
          CommentSelf1: kra.COMMENT_SELF_1 || "",
          CommentSelf2: kra.COMMENT_SELF_2 || "",
          AppraiserActual: kra.APPRAISER_ACTUAL,
          ReviewerActual: kra.REVIEWER_ACTUAL,
          AcceptorActual: kra.ACCEPTOR_ACTUAL,
          RepaScore: kra.POST_APPEAL_SCORE,
          Tooltip: kra.IT_TOOLTIP || kra.IA_TOOLTIP || "",
          ParentKraCode: kra.PARENT_KRA_CODE,
          Mpb: kra.MPB,
          Bonus: kra.BONUS
        });
      });
    }

    return {
      finalScoreSummary,
      measurableKras,
      nonMeasurableKras,
      totalMeasurableActual: rawData.measurable_score_total || 0,
      totalMeasurableMax: rawData.measurable_maxscore_total || 0,
      totalNonMeasurableActual: rawData.discretionary_score_total || rawData.non_measurable_score_total || 0,
      totalNonMeasurableMax: rawData.discretionary_non_measurable_maxscore_total || 0,
      // Additional metadata from API
      date: rawData.date,
      startDate: rawData.startdate,
      endDate: rawData.enddate,
      empName: rawData.emp_name,
      empNumber: rawData.empnumber,
      organisation: rawData.organisation,
      primaryRole: rawData.primary,
      status: rawData.status,
      reportingAuthorityNo: rawData.REPORTING_AUTHORITY_NO,
      reportingAuthorityName: rawData.REPORTING_AUTHORITY_NAME,
      reviewingAuthorityNo: rawData.REVIEWING_AUTHORITY_NO,
      reviewingAuthorityName: rawData.REVIEWING_AUTHORITY_NAME,
      acceptingAuthorityNo: rawData.ACCEPTING_AUTHORITY_NO,
      acceptingAuthorityName: rawData.ACCEPTING_AUTHORITY_NAME,
      appealCount: rawData.appeal_count || 0,
      overallTotal: rawData.overall_total,
      totalKraCount: rawData.total_kra_count,
      id: rawData.id,
      rawData
    };
  }, [apiResponse]);


  // KRA selection handler
  const handleKraSelection = useCallback((kraId) => {
    setSelectedKras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kraId)) {
        newSet.delete(kraId);
      } else {
        newSet.add(kraId);
      }
      return newSet;
    });
  }, []);

  // Appeal text change handler
  const handleAppealTextChange = useCallback((kraId, text) => {
    setAppealTexts(prev => {
      const newMap = new Map(prev);
      newMap.set(kraId, text);
      return newMap;
    });
  }, []);

  // Actual value change handler (for measurable and non-measurable KRAs)
  const handleActualChange = useCallback((kraId, value) => {
    setActualValueEdits(prev => {
      const newMap = new Map(prev);
      newMap.set(kraId, value);
      return newMap;
    });
  }, []);

  // Final score change handler (for Final Score Summary table)
  const handleFinalScoreChange = useCallback((categoryName, value) => {
    setFinalScoreEdits(prev => {
      const newMap = new Map(prev);
      newMap.set(categoryName, value);
      return newMap;
    });
  }, []);

  // Category selection handler (for Final Score Summary table)
  const handleCategorySelection = useCallback((categoryName) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  }, []);

  // File upload handler
  const handleFileUpload = useCallback((files) => {
    const fileArray = Array.from(files);
    const allowedTypes = ['.xls', '.xlf', '.xlsx', '.jpeg', '.jpg', '.png'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    // Validate file types
    const invalidFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return !allowedTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Calculate total size including existing files
    const existingSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const newSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    
    if (existingSize + newSize > maxSizeBytes) {
      throw new Error('Total file size exceeds 5MB limit');
    }

    setUploadedFiles(prev => [...prev, ...fileArray]);
  }, [uploadedFiles]);

  // File remove handler
  const handleFileRemove = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Validation
  const isValid = useMemo(() => {
    if (selectedKras.size === 0) return false;
    
    // Check if all selected KRAs have appeal text
    for (const kraId of selectedKras) {
      const text = appealTexts.get(kraId);
      if (!text || text.trim() === '') {
        return false;
      }
    }
    
    return true;
  }, [selectedKras, appealTexts]);

  // Helper function to find KRA details by ID
  const findKraById = useCallback((kraId) => {
    // Search in measurable KRAs
    for (const group in data.measurableKras) {
      const found = data.measurableKras[group].find(k => k.KraId === kraId);
      if (found) {
        return { kra: found, type: 'measurable' };
      }
    }

    // Search in non-measurable KRAs
    for (const group in data.nonMeasurableKras) {
      const found = data.nonMeasurableKras[group].find(k => k.KraId === kraId);
      if (found) {
        return { kra: found, type: 'non_measurable' };
      }
    }

    return null;
  }, [data]);

  // Submit handler - builds payload matching API expected format
  const handleSubmit = useCallback(async (declarationOption = 'agree') => {
    if (!isValid) {
      throw new Error('Please select at least one KRA and provide justification for all selected KRAs');
    }

    setIsSubmitting(true);

    try {
      // Build kraData array matching API expected format
      const kraData = Array.from(selectedKras).map(kraId => {
        const kraInfo = findKraById(kraId);
        const kra = kraInfo?.kra;
        const appealText = appealTexts.get(kraId) || '';

        return {
          target: {
            kra_type: kra?.KraType || 'discretionary_non_measurable',
            AP_KRA_ID: kraId,
            PARENT_KRA: kra?.ParentKraCode || null,
            firstcomment: appealText,
            old_target: kra?.Target || null,
            new_target: kra?.Target || null, // User may want to propose new target
            old_actual: kra?.Actual || null,
            new_actual: kra?.Actual || null, // User may want to propose new actual
            old_mpb: kra?.Mpb || null,
            new_mpb: kra?.Mpb || null,
            chk_status: 'on',
            old_score: kra?.Score || null,
            max_score: kra?.MaxScore || null,
            MONTH: null,
            repa_score: kra?.RepaScore || null
          }
        };
      });

      // Build payload matching API expected format
      const payload = {
        id: String(data.id || context.roleId),
        empNo: data.empNumber || context.employee?.empNo,
        reportingAuthorityNo: data.reportingAuthorityNo,
        kraData: kraData,
        declarationOption: declarationOption
      };

      // Get first attachment file (API expects single file)
      const attachment = uploadedFiles.length > 0 ? uploadedFiles[0] : null;

      // Submit to API
      const response = await appraisalAPI.submitAppealReport(payload, attachment);
      
      setIsSubmitting(false);
      
      // Response format: { TICKETID: number, type: "success" }
      return response;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [isValid, selectedKras, appealTexts, uploadedFiles, data, context, findKraById]);

  return {
    data,
    context,
    formState: {
      selectedKras,
      appealTexts,
      uploadedFiles,
      actualValueEdits,
      finalScoreEdits,
      selectedCategories
    },
    actions: {
      handleKraSelection,
      handleAppealTextChange,
      handleActualChange,
      handleFinalScoreChange,
      handleCategorySelection,
      handleFileUpload,
      handleFileRemove,
      handleSubmit,
      isSubmitting
    },
    isValid,
    isLoading,
    isError,
    error
  };
};
