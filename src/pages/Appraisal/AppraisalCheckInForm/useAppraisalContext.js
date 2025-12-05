import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractYear } from './appraisalTransformers';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Shared context hook for appraisal flows.
 * Extracts and normalizes route state and query parameters used by both
 * quarterly and annual appraisal flows.
 */
export const useAppraisalContext = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getUserProperty } = useAuth();
  const zoneName = getUserProperty('ZNNAME', 'Central Zone') || '';
  console.log('[useAppraisalContext] zoneName from auth context:', zoneName);
  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const queryParams = Object.fromEntries(searchParams.entries());

  // Extract data from location state or fallback to query params
  const stateOrQuery = location.state || {};
  console.log('stateOrQuery in useAppraisalContext:', stateOrQuery);

  // Core identifiers
  const empNo = stateOrQuery.employee?.empNo || queryParams.empNo;
  const financialYear = stateOrQuery.financialYear || queryParams.financialYear;
  const quarter = stateOrQuery.quarter || queryParams.quarter;
  const appraisalPeriod = stateOrQuery.appraisalPeriod || queryParams.appraisalPeriod;
  const dateRange = stateOrQuery.dateRange || queryParams.dateRange;

  // Navigation/routing identifiers
  const urlId = stateOrQuery.urlId || queryParams.urlId;
  const roleType = stateOrQuery.roleType || queryParams.roleType;
  const pageType = stateOrQuery.pageType || queryParams.pageType;
  const intent = stateOrQuery.intent || queryParams.intent;
  const initialAppraisalStatus = stateOrQuery.appraisalStatus || queryParams.appraisalStatus;

  // Zone information (from employee data or direct state)
  // const zoneName = stateOrQuery.zoneName || stateOrQuery.employee?.zoneName || stateOrQuery.employee?.ZNNAME || queryParams.zoneName;

  // Construct employee object if missing but empNo exists
  const employee = stateOrQuery.employee || (empNo ? { empNo, primaryRole: 'default' } : null);
  const employeeNumber = employee?.empNo || '';

  // Normalize financial year to plain year format (e.g., "FY 2024-25" -> "2024")
  const normalizedFinancialYear = useMemo(() => extractYear(financialYear), [financialYear]);

  // Determine if this is a quarterly flow
  const isQuarterlyFlow = useMemo(() => {
    return appraisalPeriod?.toLowerCase() === 'quarterly';
  }, [appraisalPeriod]);

  // Determine if this is an annual flow
  const isAnnualFlow = useMemo(() => {
    return appraisalPeriod?.toLowerCase() === 'annual';
  }, [appraisalPeriod]);

  // Derive actual role based on flow type and intent
  const deriveRole = useMemo(() => {
    if (isAnnualFlow) return 'APPRAISEE';
    if (intent === 'Review' || roleType === 'appraiser') return 'APPRAISER';
    return 'APPRAISEE';
  }, [isAnnualFlow, intent, roleType]);

  // Validation: check if required context is available
  const isContextValid = !!(employeeNumber && financialYear && appraisalPeriod);

  const task = stateOrQuery.task;

  console.log('TASK IN STATE :', task);

  return {
    // Navigation
    navigate,
    location,

    // Core context values
    employee,
    employeeNumber,
    financialYear,
    normalizedFinancialYear,
    quarter,
    appraisalPeriod,
    dateRange,

    // Flow identifiers
    urlId,
    roleType,
    pageType,
    intent,
    initialAppraisalStatus,
    zoneName,

    // Flow type flags
    isQuarterlyFlow,
    isAnnualFlow,

    // Derived values
    deriveRole,
    isContextValid,

    task,
  };
};
