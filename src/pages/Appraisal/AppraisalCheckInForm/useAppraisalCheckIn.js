import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  transformAnnualAppraisalData,
  transformQuarterlyAppraisalData,
  extractYear,
} from './appraisalTransformers';

export const useAppraisalCheckIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey: urlId || 'quarterly-check-in',
          roleType: user?.ROLE_NAME ||isQuarterlyFlow
      ? ['quarterlyCheckInReport', employee?.empNo, financialYear, quarter, roleType, intent]
      : ['employeeSelfAppraisal', employee?.empNo, financialYear, quarter, appraisalPeriod],
    queryFn: () => {
      if (isQuarterlyFlow) {
        return appraisalAPI.getQuarterlyCheckInReport({
          empNo: employee?.empNo || '',
          roleType:  roleType || 'emp',
          url:'U-34545',
          financialYear: extractYear(financialYear),
          quarter: quarter || '',
          pageType: pageType || 'self',
          appraisalStatus: initialAppraisalStatus || 'pending',
          intent: intent || 'Fill',
          roleId: employee?.primaryRole || 'default',
        });
      } else {
        return appraisalAPI.getEmployeeSelfAppraisal({
          empNo: employee?.empNo || '',
          url: 'check-in-form',
          zoneName: employee?.zone || 'default',
          roleId: employee?.primaryRole || 'default',
          roleType: '12',
          financialYear: extractYear(financialYear),
          quarter: '',
          pageType: '1',
          appraisalStatus: 'in-progress',
        });
      }
    },
    enabled: !!employee?.empNo && !!financialYear && !!appraisalPeriod,
  });

  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return isQuarterlyFlow
      ? transformQuarterlyAppraisalData(apiResponse)
      : transformAnnualAppraisalData(apiResponse);
  }, [apiResponse, isQuarterlyFlow]);

  // Initialize form data from transformed data
  useEffect(() => {
    if (transformedData?.measurableKras) {
      const initialScores = {};
      transformedData.measurableKras.forEach(kra => {
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
        areas: rawData.areasPerformanceComment || ''
      };

      setFormData(prev => ({ 
        ...prev, 
        measurableKraScores: initialScores,
        sectionComments: initialSectionComments
      }));
    }
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
    
    const kraData = originalKras.map(kra => {
      const updates = formData.measurableKraScores[kra.KRA_CODE] || {};
      
      // Map UI fields back to API fields
      // Note: We preserve all original fields and only update what changed
      return {
        ...kra,
        actual: updates.KraActualScore !== undefined ? updates.KraActualScore : kra.actual,
        target: updates.KraTarget !== undefined ? updates.KraTarget : kra.target,
        KRA_COMMENT: updates.KraComments !== undefined ? updates.KraComments : kra.KRA_COMMENT,
        // Ensure numeric values are handled if needed, though API seems to accept strings for some
      };
    });

    return {
      financialYear: extractYear(financialYear),
      quarter: quarter || "Q1",
      empNumber: employee?.empNo || "",
      urlId: urlId || "U-34545", // Use provided urlId or fallback
      kraData: kraData,
      submittype: "self", // TODO: Make dynamic based on role/intent if needed
      startDate: rawData.startDate || "2024-07-01 00:00:00.0",
      endDate: rawData.endDate || "2024-09-30 00:00:00.0",
      reportingAuthority: rawData.reportingAuthority || "string",
      organizationName: rawData.organizationName || "string",
      performanceMeasurableComment: Array.isArray(formData.sectionComments?.measurable) 
        ? formData.sectionComments.measurable 
        : [formData.sectionComments?.measurable || ""], // Ensure array
      nonMeasurableComment: formData.sectionComments?.nonMeasurable || "",
      performanceNonMeasurableComment: formData.sectionComments?.performanceNonMeasurable || "",
      performanceSemiMeasurableComment: formData.sectionComments?.semiMeasurable || "",
      performancePeriodComment: formData.sectionComments?.period || "",
      areasPerformanceComment: formData.sectionComments?.areas || ""
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
