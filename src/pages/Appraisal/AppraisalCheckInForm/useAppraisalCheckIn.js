import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import {
  transformAnnualAppraisalData,
  transformQuarterlyAppraisalData,
  extractYear,
} from './appraisalTransformers';

export const useAppraisalCheckIn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const queryParams = Object.fromEntries(searchParams.entries());

  // Extract data from location state or fallback to query params
  const stateOrQuery = location.state || {};

  console.log('State or Query Params:', stateOrQuery, queryParams);
  
  const empNo = stateOrQuery.employee?.empNo || queryParams.empNo;
  const financialYear = stateOrQuery.financialYear || queryParams.financialYear;
  const quarter = stateOrQuery.quarter || queryParams.quarter;
  const appraisalPeriod = stateOrQuery.appraisalPeriod || queryParams.appraisalPeriod;
  const dateRange = stateOrQuery.dateRange || queryParams.dateRange;
  const urlId = stateOrQuery.urlId || queryParams.urlId;
  const roleType = stateOrQuery.roleType || queryParams.roleType;
  const pageType = stateOrQuery.pageType || queryParams.pageType;
  const intent = stateOrQuery.intent || queryParams.intent;
  const initialAppraisalStatus = stateOrQuery.appraisalStatus || queryParams.appraisalStatus;

  // Construct employee object if missing but empNo exists
  const employee = stateOrQuery.employee || (empNo ? { empNo, primaryRole: 'default' } : null);
  const employeeNumber = employee?.empNo || '';
  const normalizedFinancialYear = useMemo(() => extractYear(financialYear), [financialYear]);

  // Determine if this is a quarterly flow
  const isQuarterlyFlow = useMemo(() => {
    return appraisalPeriod?.toLowerCase() === 'quarterly';
  }, [appraisalPeriod]);

  // Derive actual role
  const actualRole = useMemo(() => {
    if (!isQuarterlyFlow) return 'APPRAISEE';
    if (intent === 'Review' || roleType === 'appraiser') return 'APPRAISER';
    return 'APPRAISEE';
  }, [isQuarterlyFlow, intent, roleType]);

  const [currentRole, setCurrentRole] = useState(actualRole);

  useEffect(() => {
    setCurrentRole(actualRole);
  }, [actualRole]);

  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const isEditableBy = {
    APPRAISEE: currentRole === 'APPRAISEE',
    APPRAISER: currentRole === 'APPRAISER',
    REVIEWER: currentRole === 'REVIEWER',
  };

  const [formData, setFormData] = useState({
    measurableKraScores: {},
    nonMeasurableKraComments: {},
    developmentInputAnswers: {},
    sectionComments: {
      measurable: [],
      nonMeasurable: '',
      performanceNonMeasurable: '',
      semiMeasurable: '',
      period: '',
      areas: ''
    },
    appraiseeComments: '',
    appraiserComments: '',
    reviewerComments: '',
  });

  const [isDirty, setIsDirty] = useState(false);

  // Fetch appraisal data
  const queryKey = isQuarterlyFlow
    ? [
        'quarterlyCheckInReport',
        employeeNumber,
        normalizedFinancialYear,
        quarter || '',
        roleType || 'emp',
        intent || 'Fill',
        urlId || 'default-url',
      ]
    : [
        'employeeSelfAppraisal',
        employeeNumber,
        normalizedFinancialYear,
        appraisalPeriod || 'Quarterly',
      ];

  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => {
      if (isQuarterlyFlow) {
        return appraisalAPI.getQuarterlyCheckInReport({
          empNo: employeeNumber,
          roleType: roleType || 'emp',
          url: urlId || 'quarterly-check-in',
          financialYear: normalizedFinancialYear,
          quarter: quarter || '',
          pageType: pageType || 'self',
          appraisalStatus: initialAppraisalStatus || 'pending',
          intent: intent || 'Fill',
          roleId: employee?.primaryRole || 'default',
        });
      } else {
        return appraisalAPI.getEmployeeSelfAppraisal({
          empNo: employeeNumber,
          url: 'check-in-form',
          zoneName: employee?.zone || 'default',
          roleId: employee?.primaryRole || 'default',
          roleType: '12',
          financialYear: normalizedFinancialYear,
          quarter: '',
          pageType: '1',
          appraisalStatus: 'in-progress',
        });
      }
    },
    enabled: !!employeeNumber && !!financialYear && !!appraisalPeriod,
  });

  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return isQuarterlyFlow
      ? transformQuarterlyAppraisalData(apiResponse)
      : transformAnnualAppraisalData(apiResponse);
  }, [apiResponse, isQuarterlyFlow]);

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
      
      // Initialize section comments if available in rawData
      const rawData = transformedData.rawData || {};
      const initialSectionComments = {
        measurable: rawData.performanceMeasurableComment || [],
        nonMeasurable: rawData.nonMeasurableComment || '',
        performanceNonMeasurable: rawData.performanceNonMeasurableComment || '',
        semiMeasurable: rawData.performanceSemiMeasurableComment || '',
        period: rawData.performancePeriodComment || '',
        areas: rawData.areasPerformanceComment || '',
        highlights: rawData.performancePeriodComment || rawData.HIGHLIGHTS_COMMENTS || '',
        areasOfImprovement: rawData.areasPerformanceComment || rawData.BELOW_EXPECTATIONS_COMMENTS || '',
      };

      return {
        ...prev,
        measurableKraScores: initialScores,
        sectionComments: initialSectionComments,
      };
    });
  }, [transformedData]);

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load appraisal data. Please try again.');
    }
  }, [isError]);

  const handleKraChange = (kraId, field, value) => {
    setFormData(prev => ({
      ...prev,
      measurableKraScores: {
        ...prev.measurableKraScores,
        [kraId]: {
          ...prev.measurableKraScores[kraId],
          [field]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const handleSectionCommentChange = (section, value) => {
    setFormData(prev => ({
      ...prev,
      sectionComments: {
        ...prev.sectionComments,
        [section]: value
      }
    }));
    setIsDirty(true);
  };

  const buildQuarterlyPayload = () => {
    const rawData = transformedData?.rawData || {};
    const originalKras = rawData.results_KRA_LIST?.measurable || [];

    if (!originalKras.length) {
      console.warn('Quarterly payload generated with no measurable KRAs to submit.');
    }
    
    const kraData = originalKras.map(kra => {
      const updates = formData.measurableKraScores[kra.KRA_CODE] || {};
      
      // Map UI fields back to API fields
      // Note: We preserve all original fields and only update what changed
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
        : [formData.sectionComments?.measurable || ''], // Ensure array
      nonMeasurableComment: formData.sectionComments?.nonMeasurable || '',
      performanceNonMeasurableComment: formData.sectionComments?.performanceNonMeasurable || '',
      performanceSemiMeasurableComment: formData.sectionComments?.semiMeasurable || '',
      performancePeriodComment: formData.sectionComments?.highlights || '',
      areasPerformanceComment: formData.sectionComments?.areasOfImprovement || '',
    };
  };

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
    if (isQuarterlyFlow) {
      const payload = buildQuarterlyPayload();
      saveMutation.mutate(payload);
    } else {
      console.log('Annual save not yet implemented');
      toast.info('Save functionality for annual appraisal is not yet available');
    }
  };

  const handleSubmit = () => {
    if (isQuarterlyFlow) {
      const payload = buildQuarterlyPayload();
      submitMutation.mutate(payload);
    } else {
      console.log('Annual submit not yet implemented');
      toast.info('Submit functionality for annual appraisal is not yet available');
    }
  };

  return {
    data: transformedData,
    isLoading,
    isError,
    isQuarterlyFlow,
    context: {
      employee,
      financialYear,
      quarter,
      appraisalPeriod,
      dateRange,
    },
    roleState: {
      currentRole,
      isEditableBy,
      handleRoleChange,
    },
    formState: {
      formData,
      setFormData,
      isDirty,
      setIsDirty,
    },
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
