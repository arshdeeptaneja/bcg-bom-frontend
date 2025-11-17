import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8084';

const unauthClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = 'kf93jF!8sh2%wX9aL0pQzV3rB8xYtU2eR6sD9jH1kM5nW4qT'; //  localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userDetailedInfo');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  // POST: Login user
  login: async (credentials) => {
    try {
      console.log('Sending login request:', {
        url: `${API_BASE_URL}/identity/auth/login`,

        method: 'POST',
        credentials: {
          ...credentials,
          password: '[REDACTED]', // Don't log actual password
        },
      });

      const response = await apiClient.post('/identity/auth/login', credentials);
      console.log('Login response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      console.error('Login API error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },

  // POST: Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post('/identity/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST: Logout user
  logout: async () => {
    try {
      const response = await apiClient.post('/identity/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const userAPI = {
  // GET: Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get user roles
  getRoles: async () => {
    try {
      const response = await apiClient.get('/user/roles');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get user KRA metrics
  getKRAMetrics: async () => {
    try {
      const response = await apiClient.get('/user/kra-metrics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get team members
  getTeamMembers: async () => {
    try {
      const response = await apiClient.get('/user/team-members');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Captcha API methods

export const generateCaptchaAPI = {
  getCaptchaImage: async () => {
    try {
      const response = await apiClient.get('/identity/captcha/generate');
      return {
        id: response.data.captchaId,
        image: response.data.captchaImg,
      };
    } catch (error) {
      console.error('CAPTCHA API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate CAPTCHA.');
    }
  },

  validateCaptcha: async (captchaId, userInput) => {
    try {
      const response = await apiClient.post('/identity/captcha/validate', null, {
        params: {
          captchaId: captchaId,
          userInput: userInput,
        },
      });

      if (response.data === false || response.data === 'false') {
        throw new Error('Invalid Captcha');
      }

      return true;
    } catch (error) {
      console.error('CAPTCHA validation API error:', error);
      throw error;
    }
  },

  getCaptchaImageByRefresh: async (captchaIdToRefresh) => {
    try {
      const response = await apiClient.get(`/identity/captcha/refresh/${captchaIdToRefresh}`);
      return {
        id: response.data.captchaId,
        image: response.data.captchaImg,
      };
    } catch (error) {
      console.error('CAPTCHA Refresh API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to refresh CAPTCHA.');
    }
  },

  // login: async (credentials) => {
  //   try {
  //     console.log('Sending login request:', {
  //       url: `${API_BASE_URL}/identity/auth/login`,
  //       method: 'POST',
  //       credentials: {
  //         ...credentials,
  //         password: '[REDACTED]'
  //       }
  //     });

  //     const response = await apiClient.post('/identity/auth/login', credentials);

  //     return response.data;
  //   } catch (error) {
  //     console.error('Login API error:', error);
  //     throw error;
  //   }
  // }
};

export const dashboardAPI = {
  // GET: Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get role history
  getRoleHistory: async () => {
    try {
      const response = await apiClient.get('/dashboard/role-history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get RCT dashboard data with employee details
  getRCTDashboard: async (empNo, sol, unitType) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo,
        sol: sol,
        unitType: unitType,
      });
      const response = await apiClient.get(`/rct/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

const appraisalBaseUrl = '/appraisal'; //'/appraisal/v1/appraisal';
export const appraisalAPI = {
  // GET: Get appraisal dashboard data
  getAppraisalDashboard: async ({ fy, empNo, sol, roleType }) => {
    try {
      const params = new URLSearchParams({
        current_fy: fy,
        empNo: empNo,
        sol: sol,
        role_type: roleType,
      });
      const response = await apiClient.get(`${appraisalBaseUrl}/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get exception dashboard data
  getExceptionDashboard: async ({ fy, quarter, exception_period, empNo }) => {
    try {
      const params = new URLSearchParams({
        fy: fy,
        quarter: quarter,
        exception_period,
        empNo: empNo,
      });
      const response = await apiClient.get(
        `${appraisalBaseUrl}/exception_verify/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get exception validator dashboard data
  getExceptionValidatorDashboard: async ({ fy, quarter, exceptionPeriod, empNo }) => {
    try {
      const params = new URLSearchParams({
        fy: fy,
        quarter: quarter,
        exceptionPeriod,
        empNo: empNo,
      });
      const response = await apiClient.get(
        `${appraisalBaseUrl}/exception_validator/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get exception validator dashboard data
  getExceptionQuarterlyVerify: async ({ fy, quarter, empNo }) => {
    try {
      const params = new URLSearchParams({
        fy: fy,
        quarter: quarter,
        empNo: empNo,
      });
      const response = await apiClient.get(
        `${appraisalBaseUrl}/exception_quarterly_verify?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get appraisal home dashboard data
  getAppraisalHomeDashboard: async ({ empNo, role, appraisalPeriod, financialYear, quarter }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo,
        role: role,
        appraisalPeriod: appraisalPeriod,
        financialYear: financialYear,
        quarter: quarter,
      });
      const response = await apiClient.get(
        `${appraisalBaseUrl}/home/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },

  // GET: Get appraiser check-in dashboard data
  getAppraiserCheckInDashboard: async ({ empNo, financialYear, quarter, appraisalPeriod }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo,
        financialYear: financialYear,
        quarter: quarter,
        appraisalPeriod: appraisalPeriod,
      });
      const response = await apiClient.get(
        `/appraisal/quarterly_reportee_appraisal/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },

  // GET: Get appraisee dashboard data
  getAppraiseeDashboard: async ({ fy, quarter, appraisalPeriod, empNo }) => {
    try {
      const params = new URLSearchParams({
        fy: fy,
        quarter: quarter || '',
        appraisalPeriod: appraisalPeriod,
        empNo: empNo,
      });
      const response = await apiClient.get(
        `${appraisalBaseUrl}/appraisee/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },

  // GET: Get appraisee check-in dashboard data (my appraisal dashboard)
  getAppraiseeCheckInDashboard: async ({ empNo, financialYear, appraisalPeriod }) => {
    try {
      const params = new URLSearchParams({
        fy: financialYear,
        empNo: empNo,
        appraisalPeriod: appraisalPeriod,
      });
      const response = await apiClient.get(
        `/appraisal/my_appraisal_dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },

  // GET: Get employee self-appraisal data for check-in form
  getEmployeeSelfAppraisal: async ({
    empNo,
    url,
    zoneName,
    roleId,
    roleType,
    financialYear,
    quarter,
    pageType,
    appraisalStatus,
  }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo,
        url: url,
        zoneName: zoneName,
        roleId: roleId,
        roleType: roleType,
        financialYear: financialYear,
        quarter: quarter || '',
        pageType: pageType,
        appraisalStatus: appraisalStatus,
      });
      const response = await apiClient.get(
        `/appraisal/employee_self_appraisal?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },
};

// Generic API methods
export const api = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const accessService = {
  async getAccessModuleWise(empId, unitType, role) {
    try {
      const response = await apiClient.get('/identity/auth/accessModuleWise', {
        params: {
          empId: empId,
          unitType: unitType,
          role: role,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in getAccessModuleWise:', error);
      throw error;
    }
  },
};

export default apiClient;
