import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appraisalAPI } from '../../../../services/api';
import { transformAnnualAppraisalData } from '../appraisalTransformers';

/**
 * Custom hook for Annual Review View-Only Interface
 *
 * Handles data fetching and state management for the read-only annual review page.
 * This hook is specifically designed for view-only mode and does not include
 * any form state management or mutation functions.
 *
 * @returns {Object} Hook state containing:
 *   - data: Transformed appraisal data
 *   - isLoading: Loading state
 *   - isError: Error state
 *   - error: Error object
 *   - context: Employee and appraisal context information
 *   - isContextValid: Whether all required parameters are present
 */
export const useAnnualReviewView = () => {
  const location = useLocation();

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const queryParams = Object.fromEntries(searchParams.entries());

  // Extract data from location state or fallback to query params
  const stateOrQuery = location.state || {};

  // Extract parameters from URL search params or location state
  const empNo = stateOrQuery.empNo || queryParams.empNo || '';
  const url = stateOrQuery.url || queryParams.url || '';
  const zoneName = stateOrQuery.zoneName || queryParams.zoneName || '';
  const roleType = stateOrQuery.roleType || queryParams.roleType || '';
  const financialYear = stateOrQuery.financialYear || queryParams.financialYear || '';
  const quarter = stateOrQuery.quarter || queryParams.quarter || '';

  // Validate that required parameters are present
  const isContextValid = Boolean(empNo && financialYear && url);

  // Build query key for caching
  const queryKey = [
    'annualReviewView',
    empNo,
    url,
    zoneName,
    roleType,
    financialYear,
    quarter,
  ];

  // Fetch annual appraisal view data
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () =>
      appraisalAPI.getAcceptorAppraisalView({
        empNo,
        url,
        zoneName,
        roleType,
        financialYear,
        quarter,
      }),
    enabled: isContextValid,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Retry once on failure
  });

  // Transform API response to component-compatible format
  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return transformAnnualAppraisalData(apiResponse);
  }, [apiResponse]);

  // Show error toast when query fails
  useEffect(() => {
    if (isError && error) {
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to load annual review data. Please try again.';
      toast.error(errorMessage);
    }
  }, [isError, error]);

  // Show warning if context is invalid
  useEffect(() => {
    if (!isContextValid && !isLoading) {
      toast.warning('Missing required parameters. Please check the URL and try again.');
    }
  }, [isContextValid, isLoading]);

  // Extract context information from transformed data
  const context = useMemo(() => {
    if (!transformedData?.metadata) {
      return {
        employee: {
          name: '',
          number: empNo,
          organisation: '',
          scale: '',
          jobFamily: '',
          cohort: '',
        },
        financialYear,
        quarter,
        appraisalPeriod: 'Annual',
        dateRange: {
          startDate: '',
          endDate: '',
        },
        authorities: {
          reportingAuthority: {
            number: '',
            name: '',
          },
          reviewingAuthority: {
            number: '',
            name: '',
          },
          acceptingAuthority: {
            number: '',
            name: '',
          },
        },
      };
    }

    const { metadata } = transformedData;

    return {
      employee: {
        name: metadata.empName || '',
        number: metadata.empNumber || empNo,
        organisation: metadata.organisation || '',
        scale: metadata.scale || '',
        jobFamily: metadata.jobFamily || '',
        cohort: metadata.cohort || '',
        primary: metadata.primary || '',
        secondary: metadata.secondary || '',
        tertiary: metadata.tertiary || '',
      },
      financialYear,
      quarter,
      appraisalPeriod: 'Annual',
      dateRange: {
        startDate: metadata.startDate || '',
        endDate: metadata.endDate || '',
      },
      authorities: {
        reportingAuthority: {
          number: metadata.reportingAuthorityNo || '',
          name: metadata.reportingAuthorityName || '',
        },
        reviewingAuthority: {
          number: metadata.reviewingAuthorityNo || '',
          name: metadata.reviewingAuthorityName || '',
        },
        acceptingAuthority: {
          number: metadata.acceptingAuthorityNo || '',
          name: metadata.acceptingAuthorityName || '',
        },
      },
      warnings: {
        repaWarningComment: metadata.repaWarningComment || '',
        revaWarningComment: metadata.revaWarningComment || '',
        warningFlagRepa: metadata.warningFlagRepa || '',
        warningFlagReva: metadata.warningFlagReva || '',
      },
    };
  }, [transformedData, empNo, financialYear, quarter]);

  return {
    // Data
    data: transformedData,
    isLoading,
    isError,
    error,

    // Context
    context,
    isContextValid,

    // Raw parameters (for debugging or advanced use cases)
    parameters: {
      empNo,
      url,
      zoneName,
      roleType,
      financialYear,
      quarter,
    },
  };
};
