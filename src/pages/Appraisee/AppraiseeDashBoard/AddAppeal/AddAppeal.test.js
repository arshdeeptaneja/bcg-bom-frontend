import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import AddAppeal from './Addappeal';
import { useAddAppeal } from './useAddAppeal';

// Mock dependencies
jest.mock('./useAddAppeal');
jest.mock('react-toastify');
jest.mock('../../../../components/common', () => ({
  BackButton: () => <button>Back</button>
}));
jest.mock('../../../../components/Appraisal', () => ({
  CheckInDescriptionSection: ({ employee }) => <div>Employee: {employee.employeeName}</div>,
  FinalScoreSummaryTable: ({ kraListData }) => <div>Score Summary: {kraListData.length} items</div>
}));
jest.mock('./AppealKRASection', () => {
  return function AppealKRASection({ kras, type }) {
    return <div>KRA Section: {type} - {kras.length} KRAs</div>;
  };
});
jest.mock('./FileUploadSection', () => {
  return function FileUploadSection({ files }) {
    return <div>Files: {files.length}</div>;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      financialYear: '2025',
      appraisalPeriod: 'Annual',
      dateRange: '01 Apr 2025 - 31 Mar 2026'
    }
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('AddAppeal Component', () => {
  const mockData = {
    finalScoreSummary: [
      { KraName: 'Business Performance', KraWeight: 70 }
    ],
    measurableKras: {
      'Business Performance': [
        {
          KraId: 1,
          KraName: 'CASA Account Growth',
          KraDescription: 'Test description',
          Actual: 145,
          Target: 150,
          MaxScore: 25,
          Score: 24
        }
      ]
    },
    nonMeasurableKras: {
      'Behavioral Competencies': [
        {
          KraId: 101,
          KraName: 'Team Leadership',
          KraDescription: 'Test description',
          Score: 4,
          MaxScore: 5
        }
      ]
    }
  };

  const mockContext = {
    financialYear: '2025',
    appraisalPeriod: 'Annual',
    dateRange: '01 Apr 2025 - 31 Mar 2026',
    employee: {
      empNo: '36663',
      employeeName: 'Test User',
      primaryRole: 'Manager',
      branch: 'Mumbai',
      appraiser: 'Jane Doe',
      roles: []
    }
  };

  const mockFormState = {
    selectedKras: new Set(),
    appealTexts: new Map(),
    uploadedFiles: []
  };

  const mockActions = {
    handleKraSelection: jest.fn(),
    handleAppealTextChange: jest.fn(),
    handleFileUpload: jest.fn(),
    handleFileRemove: jest.fn(),
    handleSubmit: jest.fn(),
    isSubmitting: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: mockFormState,
      actions: mockActions,
      isValid: false,
      isLoading: false,
      isError: false,
      error: null
    });
  });

  test('renders AddAppeal component with header', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Add Appeal')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  test('displays employee information', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Employee: Test User/)).toBeInTheDocument();
  });

  test('displays final score summary', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Score Summary: 1 items/)).toBeInTheDocument();
  });

  test('displays measurable KRA sections', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/KRA Section: measurable - 1 KRAs/)).toBeInTheDocument();
  });

  test('displays non-measurable KRA sections', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/KRA Section: non-measurable - 1 KRAs/)).toBeInTheDocument();
  });

  test('displays file upload section', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Files: 0/)).toBeInTheDocument();
  });

  test('submit button is disabled when form is invalid', () => {
    render(<AddAppeal />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /Submit Appeal/i });
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when form is valid', () => {
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: {
        selectedKras: new Set([1]),
        appealTexts: new Map([[1, 'Test appeal text']]),
        uploadedFiles: []
      },
      actions: mockActions,
      isValid: true,
      isLoading: false,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /Submit Appeal/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('displays loading state', () => {
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: mockFormState,
      actions: mockActions,
      isValid: false,
      isLoading: true,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Loading appraisal data/)).toBeInTheDocument();
  });

  test('displays error state with retry button', () => {
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: mockFormState,
      actions: mockActions,
      isValid: false,
      isLoading: false,
      isError: true,
      error: { message: 'Test error' }
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Error Loading Data/)).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  test('displays validation errors', async () => {
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: {
        selectedKras: new Set(),
        appealTexts: new Map(),
        uploadedFiles: []
      },
      actions: mockActions,
      isValid: false,
      isLoading: false,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /Submit Appeal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please fix the following errors/)).toBeInTheDocument();
    });
  });

  test('displays selection summary when KRAs are selected', () => {
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: {
        selectedKras: new Set([1, 2]),
        appealTexts: new Map([[1, 'Text 1'], [2, 'Text 2']]),
        uploadedFiles: []
      },
      actions: mockActions,
      isValid: true,
      isLoading: false,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/You have selected/)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  test('handles successful submission', async () => {
    const mockHandleSubmit = jest.fn().mockResolvedValue({
      data: { appealId: 'APPEAL-123' }
    });

    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: {
        selectedKras: new Set([1]),
        appealTexts: new Map([[1, 'Test appeal']]),
        uploadedFiles: []
      },
      actions: {
        ...mockActions,
        handleSubmit: mockHandleSubmit
      },
      isValid: true,
      isLoading: false,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /Submit Appeal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Appeal submitted successfully!');
    });
  });

  test('handles submission error', async () => {
    const mockHandleSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));

    useAddAppeal.mockReturnValue({
      data: mockData,
      context: mockContext,
      formState: {
        selectedKras: new Set([1]),
        appealTexts: new Map([[1, 'Test appeal']]),
        uploadedFiles: []
      },
      actions: {
        ...mockActions,
        handleSubmit: mockHandleSubmit
      },
      isValid: true,
      isLoading: false,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /Submit Appeal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Submission failed');
    });
  });

  test('displays warning when context is missing', () => {
    useAddAppeal.mockReturnValue({
      data: mockData,
      context: {
        financialYear: null,
        employee: null
      },
      formState: mockFormState,
      actions: mockActions,
      isValid: false,
      isLoading: false,
      isError: false,
      error: null
    });

    render(<AddAppeal />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Missing Information/)).toBeInTheDocument();
    expect(screen.getByText(/Required information is missing/)).toBeInTheDocument();
  });
});
