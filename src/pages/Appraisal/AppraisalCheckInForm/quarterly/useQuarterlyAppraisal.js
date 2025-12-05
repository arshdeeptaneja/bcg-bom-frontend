import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { toast } from 'react-toastify';
import { transformQuarterlyAppraisalData } from '../appraisalTransformers';
import { useAppraisalContext } from '../useAppraisalContext';

/**
 * Quarterly Appraisal Hook
 *
 * Handles all quarterly-specific logic including:
 * - Data fetching via getQuarterlyCheckInReport
 * - Month-based KRA grouping (O(1) lookup for tab switching)
 * - Save draft functionality
 * - Submit functionality
 * - Role-based editability
 */
export const useQuarterlyAppraisal = () => {
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
    pageType,
    intent,
    initialAppraisalStatus,
    isContextValid,
    deriveRole,
  } = context;

  // Role state management
  const [currentRole, setCurrentRole] = useState(deriveRole);

  useEffect(() => {
    setCurrentRole(deriveRole);
  }, [deriveRole]);

  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const isEditableBy = {
    APPRAISEE: currentRole === 'APPRAISEE',
    APPRAISER: currentRole === 'APPRAISER',
    REVIEWER: currentRole === 'REVIEWER',
  };

  // Form state for quarterly flow
  const [formData, setFormData] = useState({
    measurableKraScores: {},
    nonMeasurableKraComments: {},
    sectionComments: {
      measurable: [],
      nonMeasurable: '',
      performanceNonMeasurable: '',
      semiMeasurable: '',
      highlights: '',
      areasOfImprovement: '',
    },
  });

  const [isDirty, setIsDirty] = useState(false);

  // Query key for quarterly data
  const queryKey = [
    'quarterlyCheckInReport',
    employeeNumber,
    normalizedFinancialYear,
    quarter || '',
    roleType || 'emp',
    intent || 'Fill',
    urlId || 'default-url',
  ];

  // Fetch quarterly appraisal data
  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      appraisalAPI.getQuarterlyCheckInReport({
        empNo: employeeNumber,
        roleType: roleType || 'emp',
        url: urlId || 'quarterly-check-in',
        financialYear: normalizedFinancialYear,
        quarter: quarter || '',
        pageType: pageType || 'self',
        appraisalStatus: employee?.appraisalStatus || 'pending',
        intent: intent || 'Fill',
        roleId: employee?.primaryRole || 'default',
      }),
    enabled: isContextValid && appraisalPeriod?.toLowerCase() === 'quarterly',
  });

  // Transform API response to component-compatible format
  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return transformQuarterlyAppraisalData(apiResponse);
  }, [apiResponse]);

  // Initialize form data from transformed data
  useEffect(() => {
    if (!transformedData?.measurableKras?.length) {
      return;
    }

    setFormData((prev) => {
      const initialScores = {};
      transformedData.measurableKras.forEach((kra) => {
        initialScores[kra.KraId] = { ...kra };
      });

      // Initialize section comments from rawData
      const rawData = transformedData.rawData || {};
      const initialSectionComments = {
        measurable: rawData.performanceMeasurableComment || [],
        nonMeasurable: rawData.nonMeasurableComment || '',
        performanceNonMeasurable: rawData.performanceNonMeasurableComment || '',
        semiMeasurable: rawData.performanceSemiMeasurableComment || '',
        highlights: rawData.performancePeriodComment || rawData.HIGHLIGHTS_COMMENTS || '',
        areasOfImprovement:
          rawData.areasPerformanceComment || rawData.BELOW_EXPECTATIONS_COMMENTS || '',
      };

      return {
        ...prev,
        measurableKraScores: initialScores,
        sectionComments: initialSectionComments,
      };
    });
  }, [transformedData]);

  // Show error toast on fetch error
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load quarterly appraisal data. Please try again.');
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

  const handleSectionCommentChange = (section, value) => {
    setFormData((prev) => ({
      ...prev,
      sectionComments: {
        ...prev.sectionComments,
        [section]: value,
      },
    }));
    setIsDirty(true);
  };

  // Build quarterly payload for save/submit
  const buildQuarterlyPayload = () => {
    const rawData = transformedData?.rawData || {};
    const originalKras = rawData.results_KRA_LIST?.measurable || [];

    if (!originalKras.length) {
      console.warn('Quarterly payload generated with no measurable KRAs to submit.');
    }

    const kraData = originalKras.map((kra) => {
      const updates = formData.measurableKraScores[kra.KRA_CODE] || {};

      // Map UI fields back to API fields
      // Preserve all original fields and only update what changed
      return {
        ...kra,
        actual: updates.KraActualScore !== undefined ? updates.KraActualScore : kra.actual,
        target: updates.KraTarget !== undefined ? updates.KraTarget : kra.target,
        KRA_COMMENT: updates.KraComments !== undefined ? updates.KraComments : kra.KRA_COMMENT,
        old_actual: kra.old_actual || kra.actual_og || '',
      };
    });

    return {
      financialYear: parseInt(normalizedFinancialYear, 10),
      quarter: quarter || 'Q1',
      empNumber: employeeNumber,
      urlId: urlId || 'quarterly-check-in',
      kraData: kraData,
      submittype: 'self', // TODO: Make dynamic based on role/intent if needed
      startDate: rawData.startDate || '2024-07-01 00:00:00.0',
      endDate: rawData.endDate || '2024-09-30 00:00:00.0',
      reportingAuthority: rawData.reportingAuthority || 'string',
      organizationName: rawData.organizationName || 'string',
      performanceMeasurableComment: Array.isArray(formData.sectionComments?.measurable)
        ? formData.sectionComments.measurable
        : [formData.sectionComments?.measurable || ''],
      nonMeasurableComment: formData.sectionComments?.nonMeasurable || '',
      performanceNonMeasurableComment: formData.sectionComments?.performanceNonMeasurable || '',
      performanceSemiMeasurableComment: formData.sectionComments?.semiMeasurable || '',
      performancePeriodComment: formData.sectionComments?.highlights || '',
      areasPerformanceComment: formData.sectionComments?.areasOfImprovement || '',
    };
  };

  // Save mutation
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

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.submitQuarterlyCheckInReport(payload),
    onSuccess: () => {
      toast.success('Check-in submitted successfully');
      setIsDirty(false);
      navigate(-1);
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast.error('Failed to submit check-in. Please try again.');
    },
  });

  const handleSave = () => {
    const payload = buildQuarterlyPayload();
    saveMutation.mutate(payload);
  };

  const handleSubmit = () => {
    const payload = buildQuarterlyPayload();
    submitMutation.mutate(payload);
  };

  return {
    // Data
    data: transformedData,
    isLoading,
    isError,

    // Context (quarterly-specific shape)
    context: {
      employee,
      financialYear,
      quarter,
      appraisalPeriod,
      dateRange,
    },

    // Role state
    roleState: {
      currentRole,
      isEditableBy,
      handleRoleChange,
    },

    // Form state
    formState: {
      formData,
      setFormData,
      isDirty,
      setIsDirty,
    },

    // Actions
    actions: {
      handleSave,
      handleSubmit,
      handleKraChange,
      handleSectionCommentChange,
      isSaving: saveMutation.isPending,
      isSubmitting: submitMutation.isPending,
    },
  };
};
