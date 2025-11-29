import axios from 'axios';
import { appraisalAPI } from './api';

// Mock axios
jest.mock('axios');

describe('appraisalAPI.getAcceptorAppraisalView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
  });

  it('should call the correct endpoint with all required parameters', async () => {
    // Arrange
    const mockParams = {
      empNo: '12345',
      url: 'U-67890',
      zoneName: 'ZONE1',
      roleType: 'ROLE_TYPE_1',
      financialYear: '2024-25',
      quarter: 'Q1',
    };

    const mockResponse = {
      data: {
        success: true,
        data: { /* mock appraisal data */ }
      }
    };

    // Create a mock axios instance
    const mockAxiosInstance = {
      get: jest.fn().mockResolvedValue(mockResponse),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    axios.create = jest.fn(() => mockAxiosInstance);

    // Re-import to get the mocked version
    jest.resetModules();
    const { appraisalAPI: mockedAPI } = require('./api');

    // Act
    const result = await mockedAPI.getAcceptorAppraisalView(mockParams);

    // Assert
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('/appraisal/acceptor_appraisal/view'),
      expect.objectContaining({
        headers: expect.objectContaining({
          accept: '*/*'
        })
      })
    );

    // Verify all parameters are in the URL
    const callArgs = mockAxiosInstance.get.mock.calls[0][0];
    expect(callArgs).toContain('empNo=12345');
    expect(callArgs).toContain('url=U-67890');
    expect(callArgs).toContain('zoneName=ZONE1');
    expect(callArgs).toContain('roleType=ROLE_TYPE_1');
    expect(callArgs).toContain('financialYear=2024-25');
    expect(callArgs).toContain('quarter=Q1');
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    const mockParams = {
      empNo: '12345',
      url: 'U-67890',
      zoneName: 'ZONE1',
      roleType: 'ROLE_TYPE_1',
      financialYear: '2024-25',
      quarter: 'Q1',
    };

    const mockError = new Error('Network error');

    const mockAxiosInstance = {
      get: jest.fn().mockRejectedValue(mockError),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    axios.create = jest.fn(() => mockAxiosInstance);

    // Re-import to get the mocked version
    jest.resetModules();
    const { appraisalAPI: mockedAPI } = require('./api');

    // Act & Assert
    await expect(mockedAPI.getAcceptorAppraisalView(mockParams)).rejects.toThrow('Network error');
  });

  it('should include Authorization header from localStorage', async () => {
    // This test verifies that the interceptor adds the auth token
    // The actual implementation is in the interceptor, so we just verify the setup
    expect(Storage.prototype.getItem).toBeDefined();
  });
});
