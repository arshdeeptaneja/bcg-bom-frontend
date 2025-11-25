import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalAPI } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { parseFinancialYear, buildQuarterDateRange } from '../utils/exceptionHelpers';

/**
 * Custom hook for Exception Validator List (Validator view)
 * Manages data fetching, filtering, and navigation for exception validation
 */
export const useExceptionValidations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');

  // Get URL params
  const financialYear = searchParams.get('financialYear');
  const quarter = searchParams.get('quarter');
  const appraisalPeriod = searchParams.get('appraisalPeriod');

  // Get filter values from URL params
  const [filters, setFilters] = useState({
    employee: searchParams.get('employee') || '',
    primaryRole: searchParams.get('primaryRole') || '',
    branch: searchParams.get('branch') || '',
    exceptionStatus: searchParams.get('exceptionStatus') || '',
  });

  // Sync filters with URL params
  useEffect(() => {
    setFilters({
      employee: searchParams.get('employee') || '',
      primaryRole: searchParams.get('primaryRole') || '',
      branch: searchParams.get('branch') || '',
      exceptionStatus: searchParams.get('exceptionStatus') || '',
    });
  }, [searchParams]);

  // React Query to fetch exception validator data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exceptionQuarterlyValidator', financialYear, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getExceptionQuarterlyValidator({
        fy: parseFinancialYear(financialYear),
        quarter: quarter,
        empNo: empNo,
      }),
    enabled: !!empNo && !!financialYear && !!quarter,
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch validation data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Transform API response to component-friendly format
  const exceptionListData = useMemo(() => {
    if (!data?.result) return [];

    return data.result.map((item) => ({
      exceptionId: item.CUST_TICKET_ID,
      custTicketId: item.CUST_TICKET_ID,
      urlId: item.P_URL_ID,
      employee: {
        empNo: item.EC_NUMBER,
        name: item.EMP_NAME,
        branch: item.BRNAME,
        primaryRole: item.PRIMARY_ROLE,
        appraiser: item.REP_NAME,
        zone: item.ZNNAME,
      },
      exceptionDescription: item.exception_description || '',
      preExceptionScore: item.TOTAL_SCORE,
      postExceptionScore: item.TOTAL_FINAL_SCORE,
      exceptionStatus: item.FINAL_APPEAL_STATUS,
    }));
  }, [data]);

  // Apply client-side filters
  const filteredData = useMemo(() => {
    return exceptionListData.filter((item) => {
      if (filters.employee && item.employee.name !== filters.employee) return false;
      if (filters.primaryRole && item.employee.primaryRole !== filters.primaryRole) return false;
      if (filters.branch && item.employee.branch !== filters.branch) return false;
      if (filters.exceptionStatus && item.exceptionStatus !== filters.exceptionStatus)
        return false;
      return true;
    });
  }, [exceptionListData, filters]);

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterName, value);
    } else {
      newParams.delete(filterName);
    }
    setSearchParams(newParams);
  };

  // Handle search (filters are already applied reactively)
  const handleSearch = () => {
    // Filters are already applied via URL params and useMemo
    // This is a placeholder for future server-side filtering if needed
    console.log('Active filters:', filters);
  };

  // Clear all filters
  const handleClearFilter = () => {
    const newFilters = {
      employee: '',
      primaryRole: '',
      branch: '',
      exceptionStatus: '',
    };
    setFilters(newFilters);

    // Clear filter params from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('employee');
    newParams.delete('primaryRole');
    newParams.delete('branch');
    newParams.delete('exceptionStatus');
    setSearchParams(newParams);
  };

  // Handle review exception validation navigation
  const handleReviewException = (exception) => {
    navigate('/appraisal/employee-review-quarterly-exception', {
      state: {
        financialYear,
        quarter,
        appraisalPeriod,
        dateRange: buildQuarterDateRange(financialYear, quarter),
        employee: {
          empNo: exception.employee.empNo,
          employeeName: exception.employee.name,
          branch: exception.employee.branch,
          primaryRole: exception.employee.primaryRole,
          appraiser: exception.employee.appraiser,
          zone: exception.employee.zone,
        },
        role: 'VALIDATOR',
        roleName: 'VALIDATOR',
        roleId: 'VALIDATOR',
        custTicketId: exception.custTicketId,
        exceptionId: exception.exceptionId,
        urlId: exception.urlId,
      },
    });
  };

  return {
    // Data
    exceptionListData: filteredData,
    filterOptions: {
      employees: data?.EMP_NAME || [],
      primaryRoles: data?.PRIMARY_ROLE || [],
      branches: data?.BRANCH_NAME || [],
      exceptionStatuses: data?.TICKET_STATUS || [],
    },
    filters,
    
    // Loading states
    isLoading,
    isError,
    error,

    // URL params
    financialYear,
    quarter,
    appraisalPeriod,

    // Actions
    handleFilterChange,
    handleSearch,
    handleClearFilter,
    handleReviewException,
  };
};
