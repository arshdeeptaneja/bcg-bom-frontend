import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAnnualReviewView } from './useAnnualReviewView';
import { appraisalAPI } from '../../../../services/api';
import { transformAnnualAppraisalData } from '../appraisalTransformers';

// Mock dependencies
jest.mock('../../../../services/api');
jest.mock('../appraisalTransformers');
jest.mock('react-toastify');

//Mock useLocation separately
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: jest.fn(),
  };
});

describe('useAnnualReviewView', () => {
  let queryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests
        },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    toast.error = jest.fn();
    toast.warning = jest.fn();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const createWrapper = () => {
    return ({ children }) => (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </BrowserRouter>
    );
  };

  /**
   * Property 16: Parameter Extraction
   * Validates: Requirements 8.1
   *
   * Tests that the hook correctly extracts parameters from URL search params
   * and location state, with proper fallbacks.
   */
  describe('Property 16: Parameter Extraction', () => {
    it('should extract parameters from URL search params', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&zoneName=ZONE1&roleType=ROLE_TYPE_1&financialYear=2024-25&quarter=Q1',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.parameters).toEqual({
        empNo: '12345',
        url: 'U-67890',
        zoneName: 'ZONE1',
        roleType: 'ROLE_TYPE_1',
        financialYear: '2024-25',
        quarter: 'Q1',
      });
    });

    it('should fallback to location state when search params are missing', () => {
      useLocation.mockReturnValue({
        search: '',
        state: {
          empNo: '12345',
          url: 'U-67890',
          zoneName: 'ZONE1',
          roleType: 'ROLE_TYPE_1',
          financialYear: '2024-25',
          quarter: 'Q1',
        },
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.parameters).toEqual({
        empNo: '12345',
        url: 'U-67890',
        zoneName: 'ZONE1',
        roleType: 'ROLE_TYPE_1',
        financialYear: '2024-25',
        quarter: 'Q1',
      });
    });

    it('should handle missing optional parameters', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.parameters).toEqual({
        empNo: '12345',
        url: 'U-67890',
        zoneName: '',
        roleType: '',
        financialYear: '2024-25',
        quarter: '',
      });
    });
  });

  /**
   * Property 17: Hook Return Structure
   * Validates: Requirements 8.3
   *
   * Tests that the hook returns the expected structure with all required
   * properties: data, loading state, error state, context, and validation flag.
   */
  describe('Property 17: Hook Return Structure', () => {
    it('should return correct structure with all required properties', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      // Verify return structure
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('context');
      expect(result.current).toHaveProperty('isContextValid');
      expect(result.current).toHaveProperty('parameters');
    });

    it('should provide context with correct structure', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      // Verify context structure
      expect(result.current.context).toHaveProperty('employee');
      expect(result.current.context).toHaveProperty('financialYear');
      expect(result.current.context).toHaveProperty('quarter');
      expect(result.current.context).toHaveProperty('appraisalPeriod');
      expect(result.current.context).toHaveProperty('dateRange');
      expect(result.current.context).toHaveProperty('authorities');

      // Verify nested structures
      expect(result.current.context.employee).toHaveProperty('name');
      expect(result.current.context.employee).toHaveProperty('number');
      expect(result.current.context.dateRange).toHaveProperty('startDate');
      expect(result.current.context.dateRange).toHaveProperty('endDate');
      expect(result.current.context.authorities).toHaveProperty('reportingAuthority');
      expect(result.current.context.authorities).toHaveProperty('reviewingAuthority');
      expect(result.current.context.authorities).toHaveProperty('acceptingAuthority');
    });
  });

  /**
   * Property 18: API Call Validation
   * Validates: Requirements 8.5
   *
   * Tests that the hook validates required parameters before making API calls
   * and only calls the API when context is valid.
   */
  describe('Property 18: API Call Validation', () => {
    it('should validate context as valid when all required parameters are present', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isContextValid).toBe(true);
    });

    it('should validate context as invalid when empNo is missing', () => {
      useLocation.mockReturnValue({
        search: '?url=U-67890&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isContextValid).toBe(false);
    });

    it('should validate context as invalid when financialYear is missing', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isContextValid).toBe(false);
    });

    it('should validate context as invalid when url is missing', () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isContextValid).toBe(false);
    });

    it('should not call API when context is invalid', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});

      renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      // Wait a bit to ensure no API call is made
      await waitFor(() => {
        expect(appraisalAPI.getAcceptorAppraisalView).not.toHaveBeenCalled();
      });
    });

    it('should call API with correct parameters when context is valid', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&zoneName=ZONE1&roleType=ROLE_TYPE_1&financialYear=2024-25&quarter=Q1',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue({});
      transformAnnualAppraisalData.mockReturnValue(null);

      renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(appraisalAPI.getAcceptorAppraisalView).toHaveBeenCalledWith({
          empNo: '12345',
          url: 'U-67890',
          zoneName: 'ZONE1',
          roleType: 'ROLE_TYPE_1',
          financialYear: '2024-25',
          quarter: 'Q1',
        });
      });
    });
  });

  /**
   * Property 19: Error Handling
   * Validates: Requirements 2.4, 2.5
   *
   * Tests that the hook handles API errors gracefully, displays appropriate
   * error messages, and maintains stable state.
   */
  describe('Property 19: Error Handling', () => {
    it('should handle API errors and show error toast', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      const mockError = {
        response: {
          data: {
            message: 'Custom error message',
          },
        },
      };

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(toast.error).toHaveBeenCalledWith('Custom error message');
      });
    });

    it('should show default error message when API error has no message', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      const mockError = new Error('Network error');

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load annual review data. Please try again.'
        );
      });
    });

    it('should show warning when context is invalid', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345',
        state: null,
      });

      renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          'Missing required parameters. Please check the URL and try again.'
        );
      });
    });

    it('should handle empty API response gracefully', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue(null);
      transformAnnualAppraisalData.mockReturnValue(null);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(false);
      });
    });

    it('should transform data correctly when API responds with valid data', async () => {
      useLocation.mockReturnValue({
        search: '?empNo=12345&url=U-67890&financialYear=2024-25',
        state: null,
      });

      const mockApiResponse = {
        emp_name: 'John Doe',
        empnumber: '12345',
        // ... other fields
      };

      const mockTransformedData = {
        metadata: {
          empName: 'John Doe',
          empNumber: '12345',
        },
        // ... other transformed fields
      };

      appraisalAPI.getAcceptorAppraisalView = jest.fn().mockResolvedValue(mockApiResponse);
      transformAnnualAppraisalData.mockReturnValue(mockTransformedData);

      const { result } = renderHook(() => useAnnualReviewView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTransformedData);
        expect(result.current.context.employee.name).toBe('John Doe');
        expect(result.current.context.employee.number).toBe('12345');
      });
    });
  });
});
