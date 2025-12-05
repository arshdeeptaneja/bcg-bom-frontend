import axios from 'axios';

// Base API configuration
const AUTH_BASE_URL = 'http://localhost:8090';  // Auth & Identity APIs
const APPRAISAL_BASE_URL = 'http://localhost:8084';  // Appraisal APIs

const appendQueryParam = (searchParams, key, value) => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => appendQueryParam(searchParams, key, entry));
    return;
  }

  searchParams.append(key, String(value));
};

const unauthClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Auth client for identity/auth endpoints
const authClient = axios.create({
  baseURL: AUTH_BASE_URL, // ✔ 8090
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  },
});



// Appraisal client for appraisal endpoints
const appraisalClient = axios.create({
  baseURL: APPRAISAL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Legacy alias (points to appraisal by default for backward compatibility)
const apiClient = appraisalClient;


// Response interceptor to handle token refresh (shared by both clients)
const addRefreshTokenInterceptor = (client) => {
  client.interceptors.response.use(
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
            const response = await axios.post(`${AUTH_BASE_URL}/auth/refresh`, {
              refreshToken: refreshToken,
            });

            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
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
};

// Request interceptor to add Authorization header (shared by both clients)
const addAuthInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        console.warn("No access token found in localStorage");
      }
      
      // For FormData requests, ensure Content-Type is not set (browser will set it with boundary)
      if (config.data instanceof FormData) {
        // Remove Content-Type header completely - browser will set it with boundary
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        // Ensure we're not overriding it in the config
        if (config.headers && config.headers['Content-Type']) {
          delete config.headers['Content-Type'];
        }
      }
      
      // Debug logging for upload requests
      if (config.url && config.url.includes('/upload')) {
        console.log("Upload request config:", {
          url: config.url,
          method: config.method,
          hasAuth: !!config.headers.Authorization,
          authHeader: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 20)}...` : 'missing',
          isFormData: config.data instanceof FormData,
          contentType: config.headers['Content-Type'],
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(authClient);
addAuthInterceptor(appraisalClient);

addRefreshTokenInterceptor(authClient);
addRefreshTokenInterceptor(appraisalClient);

// API service methods
export const authAPI = {
  // POST: Login user
  login: async (credentials) => {
    try {
      console.log('Sending login request:', {
        url: `${AUTH_BASE_URL}/identity/auth/login`,

        method: 'POST',
        credentials: {
          ...credentials,
          password: '[REDACTED]', // Don't log actual password
        },
      });

      const response = await authClient.post('/identity/auth/login', credentials);

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
     const response = await authClient.post('/identity/auth/refresh', { refreshToken });

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
      const response = await authClient.get('/identity/captcha/generate');
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
      const response = await authClient.post('/identity/captcha/validate', null, {
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
      const response = await authClient.get(`/identity/captcha/refresh/${captchaIdToRefresh}`);
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

      console.log("role in api is: ", role)
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
getAppraiserCheckInDashboard: async ({
  empNo,
  financialYear,
  quarter,
  appraisalPeriod,

  filterEmpId,
  filterName,
  filterRole,
  filterAppraiser,
  filterStatus,
}) => {
  try {
    const params = new URLSearchParams({
      empNo,
      financialYear,
      quarter,
      appraisalPeriod,
    });

    // Apply filters if selected
    if (filterEmpId) params.append("ecNumber", filterEmpId);
    if (filterName) params.append("employeeName", filterName);
    if (filterRole) params.append("primaryRole", filterRole);
    if (filterAppraiser) params.append("appraiser", filterAppraiser);
    if (filterStatus) params.append("status", filterStatus);

    const response = await apiClient.get(
      `/appraisal/quarterly_reportee_appraisal/dashboard?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
},


  // GET: Get quarterly check-in report data
  getQuarterlyCheckInReport: async ({ 
    empNo, 
    url, 
    roleType, 
    financialYear, 
    quarter, 
    pageType, 
    appraisalStatus, 
    intent = 'Fill' 
  }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo,
        url: url,
        roleType: roleType,
        financialYear: financialYear,
        quarter: quarter,
        pageType: pageType,
        appraisalStatus: appraisalStatus,
        intent: intent,
      });
      const response = await apiClient.get(
        `${appraisalBaseUrl}/quarterly_check_in_report?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },

    // GET: Get quarterly exception report data
getAppraiserCheckInDashboard: async ({
  empNo,
  financialYear,
  quarter,
  appraisalPeriod,
  filterEmpId,
  filterName,
  filterRole,
  filterAppraiser,
  filterStatus,
}) => {
  try {
    const params = new URLSearchParams({
      empNo,
      financialYear,
      quarter,
      appraisalPeriod,
    });

    // Add filters to API params
   if (filterEmpId) params.append("EC_NUMBER", filterEmpId);
if (filterName) params.append("EMP_NAME", filterName);
if (filterRole) params.append("MAIN_ROLE", filterRole);
if (filterAppraiser) params.append("REPORTING_AUTHORITY_NAME", filterAppraiser);
if (filterStatus) params.append("STATUS", filterStatus);


    const response = await apiClient.get(
      `/appraisal/quarterly_reportee_appraisal/dashboard?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
},

  // POST: Submit quarterly exception report with file attachment

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
  getAppraiseeCheckInDashboard: async ({
    empNo,
    financialYear,
    role,
    appraisalPeriod,
    quarter,
  }) => {
    try {
      const params = new URLSearchParams({
        fy: financialYear,
        empNo: empNo,
        // role: role,
        appraisalPeriod: appraisalPeriod,
        quarter: quarter || '',
      });
      // if (quarter) {
      //   params.append('quarter', quarter);
      // }
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
   // zoneName,
   // roleId,
    roleType,
    financialYear,
    quarter,
    pageType,
    appraisalStatus,
    intent,
  }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo,
        url: url,
       // zoneName: zoneName,
       // roleId: roleId,
        roleType: roleType,
        financialYear: financialYear,
        quarter: quarter || '',
        pageType: pageType,
        appraisalStatus: appraisalStatus,
        intent: intent,
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

  // GET: Get Admin HR Dashboard data
  getHrDashboard: async ({ empNo, appraisalPeriod, financialYear }) => {
    try {
      const params = new URLSearchParams({
      empNo,
      appraisalPeriod,
      financialYear,
  });

      // Use the shared appraisal API client so the request actually goes to 8084
      const response = await apiClient.get(
        `/appraisal/admin/hr_dashboard?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching HR dashboard:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      throw error;
    }
},
  appraisalStatusChange: async ({ empNo, appraisalPeriod, searchEmpNo, financialYear }) => {
    try {
      const params = new URLSearchParams({
        empNo,
        appraisalPeriod,
        financialYear,
        searchEmpNo
      });

      const response = await apiClient.get(
        `/admin/hr_status_update_utility/search?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error searching appraisal status:", error);
      throw error;
    }
  },

  // GET: Fetch acceptor (reviewer) appraisal payload
  getAcceptorAppraisal: async ({
    empNo,
    urlId,
    roleName,
    roleId,
    zoneName,
    financialYear,
    appraisalPeriod,
    quarter,
    appraisalStatus,
  }) => {
    try {
      const params = new URLSearchParams();
      appendQueryParam(params, 'empNo', empNo);
      appendQueryParam(params, 'urlId', urlId);
      appendQueryParam(params, 'roleName', roleName);
      appendQueryParam(params, 'roleId', roleId);
      appendQueryParam(params, 'zoneName', zoneName);
      appendQueryParam(params, 'financialYear', financialYear);
      appendQueryParam(params, 'appraisalPeriod', appraisalPeriod);
      appendQueryParam(params, 'quarter', quarter);
      appendQueryParam(params, 'appraisalStatus', appraisalStatus);

      const response = await apiClient.get(
        `/appraisal/acceptor_appraisal?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('getAcceptorAppraisal error', error);
      throw error;
    }
  },

  // Reporting and reviewing authority update by emp number
  appraisalUpdate: async ({ empNo, roleName, appraisalPeriod, quarter, empName, financialYear, sol, statusUpdates }) => {
    try {
      const body = {
        empNo,
        roleName,
        appraisalPeriod,   // Quarterly or Annual
        financialYear,
        quarter,
        empName,
        sol,
        statusUpdates
      };

      const response = await apiClient.post(
        `/admin/hr_status_update_utility/update_status/search`,
        body
      );

      return response.data;
    } catch (error) {
      console.error("Error searching appraisal status:", error);
      throw error;
    }
  },

  // POST: Submit reviewer/acceptor appraisal response
  submitAcceptorAppraisal: async (payload = {}, { endpoint } = {}) => {
    try {
      const response = await apiClient.post(
        endpoint || '/appraisal/acceptor_appraisal/submit',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('submitAcceptorAppraisal error', error);
      throw error;
    }
  },

  submitSelfAppraisal: async (payload) => {
    try {
      const params = new URLSearchParams();

      Object.entries(payload || {}).forEach(([key, value]) => {
        appendQueryParam(params, key, value);
      });

      const response = await apiClient.post(
        `/appraisal/submit-self-appraisal?${params.toString()}`,
        null
      );

      return response.data;
    } catch (error) {
      console.error('submitSelfAppraisal error', error);
      throw error;
    }
  },

  saveQuarterlyCheckInReport: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        '/appraisal/quarterly_check_in_report/save',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('saveQuarterlyCheckInReport error', error);
      throw error;
    }
  },

  submitQuarterlyCheckInReport: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        '/appraisal/quarterly_check_in_report/submit',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('submitQuarterlyCheckInReport error', error);
      throw error;
    }
  },

  // GET: Get reportee appraisal dashboard data
  getReporteeAppraisalDashboard: async ({ empNo, financialYear, quarter }) => {
    try {
      const params = new URLSearchParams({
        empNo,
        financialYear,
        quarter
      });
      // TODO: Verify this endpoint. It was lost in a merge conflict.
      const response = await apiClient.get(
        `/appraisal/reportee/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reportee appraisal dashboard:", error);
      throw error;
    }
  },

  // Fetch reporting authority bulk upload history
  reportingAuthorityBulkList: async ({ financialYear }) => {
    try {
      const params = new URLSearchParams({
        financialYear,
      });

      const response = await apiClient.get(
        `/appraisal/hr/reporting-authority-bulk/files?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching reporting authority bulk list:", error);
      throw error;
    }
  },



   // GET: Get quarterly exception report data
 getQuarterlyExceptionReport: async ({ urlId, financialYear, quarter }) => {
  try {
    const params = new URLSearchParams({
      urlId,
      financialYear,
      quarter,
    });

    const response = await apiClient.get(
      `/appraisal/quarterly_exception_report?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("getQuarterlyExceptionReport error", error);
    throw error;
  }
},


  // POST: Submit quarterly exception report with file attachment
  submitQuarterlyExceptionReport: async (payload, attachment) => {
    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      if (attachment) {
        formData.append('attachment', attachment);
      }
      const response = await apiClient.post(
        '/appraisal/quarterly_exception_report/submit_exception',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('submitQuarterlyExceptionReport error', error);
    }
  },


  // GET: Get appeal report data
  getAppealReport: async ({ roleId, roleType }) => {
    try {
      const params = new URLSearchParams({
        roleId,
        roleType
      });
      // TODO: Verify this endpoint. It was lost in a merge conflict.
      const response = await apiClient.get(
        `/appraisal/appeal/report?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appeal report:", error);
      throw error;
    }
  },

  // Bulk upload for reporting authority update
  reportingAuthorityBulkUpload: async ({ file, sol, roleName, empNo }) => {
    try {
      const params = new URLSearchParams({
        sol,
        roleName,
        empNo,
      });

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/appraisal/admin/hr_update_quarterly_repa_reva_surl/upload?${params.toString()}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading Reporting Authority Bulk file:", error);
      throw error;
    }
  },

  // GET: Review exception payload used by exception resolution reviewers
  getExceptionQuarterlyReview: async ({
    fy,
    quarter,
    empNo,
    roleName,
    roleId,
    zone,
    //custTicketId,
  }) => {
    try {
      const params = new URLSearchParams();
      appendQueryParam(params, 'fy', fy);
      appendQueryParam(params, 'quarter', quarter);
      appendQueryParam(params, 'empNo', empNo);
      appendQueryParam(params, 'roleName', roleName);
      appendQueryParam(params, 'roleId', roleId);
      appendQueryParam(params, 'zone', zone);
    //  appendQueryParam(params, 'custTicketId', custTicketId);

      const response = await apiClient.get(
        `/appraisal/exception_quarterly_verify/review?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('getExceptionQuarterlyReview error', error);
      throw error;
    }
  },

  // POST: Submit reviewer decision for quarterly exception
  submitExceptionQuarterlyReview: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        '/appraisal/exception_quarterly_verify/submit',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('submitExceptionQuarterlyReview error', error);
      throw error;
    }
  },

  // GET: Fetch validator view of exception for review
  getExceptionQuarterlyValidatorReview: async ({
    fy,
    quarter,
    empNo,
    roleName,
    roleId,
    zone,
    custTicketId,
  }) => {
    try {
      const params = new URLSearchParams();
      appendQueryParam(params, 'fy', fy);
      appendQueryParam(params, 'quarter', quarter);
      appendQueryParam(params, 'empNo', empNo);
      appendQueryParam(params, 'roleName', roleName);
      appendQueryParam(params, 'roleId', roleId);
      appendQueryParam(params, 'zone', zone);
      appendQueryParam(params, 'custTicketId', custTicketId);

      const response = await apiClient.get(
        `/appraisal/exception_quarterly_validator/review?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('getExceptionQuarterlyValidatorReview error', error);
      throw error;
    }
  },

  // POST: Submit validator decision for quarterly exception
  submitExceptionQuarterlyValidatorReview: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        '/appraisal/exception_quarterly_validator/submit',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('submitExceptionQuarterlyValidatorReview error', error);
      throw error;
    }
  },

  // POST: Submit appeal report with file attachment
  submitAppealReport: async (payload, attachment) => {
    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      formData.append('attachment', attachment);
      const response = await apiClient.post(
        '/appraisal/appeal_report/submit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('submitAppealReport error', error);
      throw error;
    }
  },

  // GET: Fetch appeal report for committee review
  getAppealCommitteeReviewData: async ({ roleId, roleType, empNo, financialYear }) => {
    try {
      const params = new URLSearchParams();
      appendQueryParam(params, 'roleId', roleId);
      appendQueryParam(params, 'roleType', roleType);
      appendQueryParam(params, 'empNo', empNo);
      appendQueryParam(params, 'financialYear', financialYear);
      const response = await apiClient.get(
        `/appraisal/appeal_report/review?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('getAppealCommitteeReviewData error', error);
      throw error;
    }
  },

  // POST: Submit appeal committee review decision
  submitAppealCommitteeReview: async (payload = {}) => {
    try {
      const response = await apiClient.post('/appraisal/appeal_committee/submit', payload);
      return response.data;
    } catch (error) {
      console.error('submitAppealCommitteeReview error', error);
      throw error;
    }
  },

  // GET: Get appeal committee data
  getAppealCommittee: async ({ empNo, financialYear }) => {
    try {
      const response = await apiClient.get(
        `/appraisal/appeal_committee?empNo=${empNo}&financialYear=${financialYear}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appeal committee data:", error);
      throw error;
    }
  },

  // Download sample Excel for reporting authority bulk update
  reportingAuthorityBulkDownloadSample: async ({
    roleName,
    regionCode,
    quarter,
    financialYear,
  }) => {
    try {
      const params = new URLSearchParams({
        roleName,
        regionCode,
        quarter,
        financialYear,
      });

      const response = await apiClient.get(
        `/appraisal/admin/hr_update_quarterly_repa_reva_surl/download_sample?${params.toString()}`,
        {
          headers: {
            // Match Postman cURL Accept header for Excel
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          responseType: "blob",
        }
      );

      return response.data; // XLSX blob
    } catch (error) {
      console.error("Error downloading sample file:", error);
      throw error;
    }
  },

  // Download sample Excel for reporting authority bulk update
 reportingAuthorityBulkDownloadDataTable: async ({
  roleName,
  regionCode,
  quarter,
  financialYear,
}) => {
  try {
    const params = new URLSearchParams({
      roleName,
      regionCode,
      quarter,
      financialYear,
    });

    const response = await apiClient.get(
      `/appraisal/admin/hr_update_quarterly_repa_reva_surl/download_data_table?${params.toString()}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error downloading sample file:", error);
    throw error;
  }
},

  // Get error logs for reporting authority bulk update
  reportingAuthorityBulkErrorLogs: async ({ financialYear }) => {
    try {
      const params = new URLSearchParams({
        financialYear,
      });

      const response = await apiClient.get(
        `/appraisal/admin/hr_update_quarterly_repa_reva_surl/error_logs?${params.toString()}`
      );

      return response.data; // JSON logs
    } catch (error) {
      console.error("Error fetching reporting authority error logs:", error);
      throw error;
    }
  },

  // Annual reporting authority bulk update error logs
  reportingAuthorityAndReviewAnnualErrorLogs: async ({ financialYear }) => {
    try {
      const params = new URLSearchParams({
        financialYear,
      });

      const response = await apiClient.get(
        `/appraisal/admin/hr_update_annual_repa_reva_surl/error_logs?${params.toString()}`
      );

      return response.data; // JSON error logs list
    } catch (error) {
      console.error("Error fetching annual reporting authority error logs:", error);
      throw error;
    }
  },

  // Annual reporting authority bulk update - Download Data Table
  reportingAuthorityAndReviewAnnualDownloadDataTable: async ({
    roleName,
    regionCode,
    financialYear,
  }) => {
    try {
      const params = new URLSearchParams({
        roleName,
        regionCode,
        financialYear,
      });

      const response = await apiClient.get(
        `/appraisal/admin/hr_update_annual_repa_reva_surl/download_data_table?${params.toString()}`,
        {
          responseType: "blob", // XLSX file
        }
      );

      return response.data; // Return blob
    } catch (error) {
      console.error("Error downloading annual data table:", error);
      throw error;
    }
  },

  // Upload Annually reporting and reviewing
  reportingAuthorityAndReviewAnnualUpload: async ({ file, sol, roleName, empNo }) => {
    try {
      // Build query string manually to match cURL format
      // POST /appraisal/admin/hr_update_annual_repa_reva_surl/upload?sol=256214&roleName=admin&empNo=38096
      const queryParams = [];
      if (sol) queryParams.push(`sol=${encodeURIComponent(String(sol))}`);
      if (roleName) queryParams.push(`roleName=${encodeURIComponent(roleName)}`);
      if (empNo) queryParams.push(`empNo=${encodeURIComponent(String(empNo))}`);
      const queryString = queryParams.join("&");

      const formData = new FormData();
      // Include filename explicitly to match typical multipart behavior
      formData.append("file", file, file?.name);

      const response = await apiClient.post(
        `/appraisal/admin/hr_update_annual_repa_reva_surl/upload?${queryString}`,
        formData
        // Let the browser set Content-Type with boundary
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading Reporting Authority Bulk file:", error);
      throw error;
    }
  },

  // Download sample Excel for Reporting Authority and Reviewing Authority update in bulk

  reportingAuthorityReviewingAuthorityBulkDownloadSample: async ({
    roleName, regionCode, quarter, financialYear,
  }) => {
    try {
      const params = new URLSearchParams({
        roleName,
        regionCode,
        quarter,
        financialYear,
      });

      const response = await apiClient.get(
        `/appraisal/admin/hr_update_annual_repa_reva_surl/download_sample?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      return response.data; // XLSX blob
    } catch (error) {
      console.error("Error downloading sample file:", error);
      throw error;
    }
  },

  // SEARCH EMPLOYEE STATUS CHANGE LIST
searchHRStatusUpdate: async ({ 
  financialYear, 
  appraisalPeriod,
  
  empNo,
  searchEmpNo
}) => {

  try {
    const params = new URLSearchParams({
      financialYear,
      appraisalPeriod,
      
      empNo,
      searchEmpNo
    });

    const response = await apiClient.get(
      `/appraisal/admin/hr_status_update_utility?${params.toString()}`
    );

    return response.data;

  } catch (error) {
    console.error("HR Status Search Error:", error);
    throw error;
  }
},



  // Appraisal Status Change Utility -- Update Status
  // Expects full payload as per backend cURL, e.g.:
  // {
  //   "statusUpdates": [{ "urlid": "...", "rolecode": "...", "status": "approved", "comment": "..." }],
  //   "roleName": "HR Admin",
  //   "solId": "12345",
  //   "appraisalPeriod": "annual" | "quarterly",
  //   "quarter": "Q1" | null,
  //   "financialYear": 2024,
  //   "empNo": "EMP001",
  //   "empName": "John Doe"
  // }
  updateHRStatus: async (payload) => {
    try {
      const response = await apiClient.post(
        `${appraisalBaseUrl}/admin/hr_status_update_utility/update_status`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating status:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // SEARCH EMP EXCEPTION DELETE URL LIST
 searchExceptionDeleteURL: async ({
  searchEmpNo,
  roleName,
  sol,
  financialYear,
}) => {
  try {
    // Ensure roleName is decoded (replace + with space) before encoding
    const decodedRoleName = roleName ? roleName.replace(/\+/g, ' ') : roleName;

    // Build query string manually to match cURL format (using %20 for spaces)
    const queryParams = [];
    if (searchEmpNo) queryParams.push(`searchEmpNo=${encodeURIComponent(String(searchEmpNo))}`);
    if (decodedRoleName) queryParams.push(`roleName=${encodeURIComponent(decodedRoleName)}`); // Encodes space as %20
    if (sol) queryParams.push(`sol=${encodeURIComponent(String(sol))}`);
    if (financialYear) queryParams.push(`financialYear=${encodeURIComponent(String(financialYear))}`);

    const queryString = queryParams.join('&');

    const response = await apiClient.get(
      `/appraisal/admin/hr_exception_delete_urlid?${queryString}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching exception delete URL:", error);
    throw error;
  }
}
,

  //EXCEPTION DELETE BUTTON TO DELETE 
deleteExceptionURL: async (payload) => {
  try {
    const response = await apiClient.post(
      `/appraisal/admin/hr_exception_delete_urlid/delete`,
      payload
    );
    return response.data;

  } catch (error) {
    console.error("Error deleting exception URL:", error);
    throw error;
  }
},



// SEARCH APPEAL DELETION
searchAppealDeleteURL: async ({ searchEmpNo, roleName, sol, financialYear }) => {
  try {
    const params = new URLSearchParams({
      searchEmpNo,
      roleName,
      sol,
      financialYear,
    });

    const response = await apiClient.get(
      `/appraisal/admin/hr_appeal_delete_urlid?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching Appeal delete url:", error);
    throw error;
  }
},


 
 // APPEAL DELETE API - CORRECT ONE
deleteAppealURL: async (payload) => {
  try {
    const response = await apiClient.post(
      `/appraisal/admin/hr_appeal_delete_urlid/delete`,
      payload  // JSON body
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting appeal URL:", error);
    throw error;
  }
},


  //Module Active Inactive Date
  // GET LIST 
moduleActiveInactiveDateGetList: async () => { 
  try {
    const response = await apiClient.get(`/appraisal/admin/hr_module_active_inactive_date`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module active/inactive list:", error);
    throw error;
  }
},


  // COMMON UPDATE API (INSERT / UPDATE / DELETE)
  moduleActiveInactiveDateUpdate: async ({ intent, payload }) => {
    try {
      const response = await apiClient.post(
        `/appraisal/admin/hr_module_active_inactive_date/${intent}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error in ${intent}:`, error);
      throw error;
    }
  },

 
 // Insert Annual Roles
insertAnnualRoles: async () => {
  try {
    const response = await apiClient.get(`/appraisal/admin/hr_insert_annual_roles`);
    return response.data;
  } catch (error) {
    console.error("Error inserting annual roles:", error);
    throw error;
  }
},



  // Search HR Repa/Reva by EC Number
  searchHRRepaRevaByEC: async ({
    searchEmpNo,
    empNo,
    appraisalPeriod,
    quarter,
    financialYear,
  }) => {
    try {
      const params = new URLSearchParams();
      appendQueryParam(params, 'searchEmpNo', searchEmpNo);
      appendQueryParam(params, 'empNo', empNo);
      appendQueryParam(params, 'appraisalPeriod', appraisalPeriod);
      appendQueryParam(params, 'quarter', quarter);
      appendQueryParam(params, 'financialYear', financialYear);

      const response = await apiClient.get(
        `/appraisal/admin/hr_update_repa_reva_by_ec?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching HR Repa/Reva by EC:", error);
      throw error;
    }
  },

  // Update HR Repa/Reva by EC Number
  updateHRRepaRevaByEC: async ({
    ecno,
    urlId,
    RA_Ecno,
    RE_Ecno,
    AC_Ecno,
    financialYear,
    appraisalPeriod,
    quarter,
    empNo,
    selfEmpNo,
    solId,
    roleName,
  }) => {
    try {
      // Ensure roleName is decoded (replace + with space) before sending
      const decodedRoleName = roleName ? roleName.replace(/\+/g, ' ') : roleName;

      const payload = {
        ecno: String(ecno),
        urlId: String(urlId),
        RA_Ecno: String(RA_Ecno),
        RE_Ecno: String(RE_Ecno),
        AC_Ecno: String(AC_Ecno || ""),
        financialYear: Number(financialYear),
        appraisalPeriod: String(appraisalPeriod),
        quarter: quarter === null || quarter === undefined ? null : String(quarter),
        empNo: String(empNo),
        selfEmpNo: String(selfEmpNo),
        solId: String(solId),
        roleName: decodedRoleName,
      };

      console.log("Update HR Repa/Reva by EC - Payload:", payload);

      const response = await apiClient.post(
        `/appraisal/admin/hr_update_repa_reva_by_ec/update`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating HR Repa/Reva by EC:", error);
      throw error;
    }
  },

  // Appeal Committee APIs
  appealCommittee: {

    // List/History logs
    getErrorLogs: async ({ financialYear, roleName }) => {
      // Build query string manually to match working cURL:
      // /appraisal/admin/hr_update_appeal_committee/error_logs?financialYear=2025&roleName=Super%20Admin
      const queryParams = [];
      if (financialYear)
        queryParams.push(
          `financialYear=${encodeURIComponent(String(financialYear))}`
        );
      if (roleName)
        queryParams.push(`roleName=${encodeURIComponent(roleName)}`);

      const queryString = queryParams.join("&");
      const fullUrl = `/appraisal/admin/hr_update_appeal_committee/error_logs?${
        queryString || ""
      }`;

      const response = await apiClient.get(fullUrl);
      return response.data;
    },

    // Upload Excel File
    uploadFile: async ({ file, sol, roleName, empNo }) => {
      const formData = new FormData();
      // Include filename explicitly to match typical multipart behaviour
      formData.append("file", file, file?.name);

      // Build query string manually so spaces become %20 (not "+")
      // and the final URL matches the working Postman cURL exactly.
      const queryParams = [];
      if (sol) queryParams.push(`sol=${encodeURIComponent(String(sol))}`);
      if (roleName) queryParams.push(`roleName=${encodeURIComponent(roleName)}`);
      if (empNo) queryParams.push(`empNo=${encodeURIComponent(String(empNo))}`);
      const queryString = queryParams.join("&");

      const fullUrl = `/appraisal/admin/hr_update_appeal_committee/upload?${queryString}`;

      const response = await apiClient.post(fullUrl, formData);
      return response.data;
    },
//appeal commitee download data table
downloadDataTable: async ({ roleName, regionCode, quarter, financialYear }) => {
  const response = await apiClient.get(
    `/appraisal/admin/hr_update_appeal_committee/download_data_table`,
    {
      params: {
        roleName,
        regionCode,
        quarter,
        financialYear,
      },
      responseType: "blob",
    }
  );

  return response.data;
},



    // Download Sample File
    // Download Sample File AppealCommittee
    downloadSample: async ({ roleName, regionCode, quarter, financialYear }) => {
      // Build query string manually to match cURL format
      const queryParams = [];
      if (roleName) queryParams.push(`roleName=${encodeURIComponent(roleName)}`);
      if (regionCode) queryParams.push(`regionCode=${encodeURIComponent(String(regionCode))}`);
      if (quarter) queryParams.push(`quarter=${encodeURIComponent(quarter)}`);
      if (financialYear) queryParams.push(`financialYear=${encodeURIComponent(String(financialYear))}`);
      
      const queryString = queryParams.join('&');
      const fullUrl = `/appraisal/admin/hr_update_appeal_committee/download_sample?${queryString}`;
      
      const response = await apiClient.get(
        fullUrl,
        {
          responseType: "blob",
        }
      );
      return response.data;
    },


  },

  // Validator Update APIs
  validatorUpdate: {
    // Upload Excel File
    uploadFile: async ({ file, empNo }) => {
      const formData = new FormData();
      formData.append("file", file, file?.name);

      // Build query string manually to match cURL format (only empNo)
      const queryParams = [];
      if (empNo) queryParams.push(`empNo=${encodeURIComponent(String(empNo))}`);

      const queryString = queryParams.join('&');
      const fullUrl = `/appraisal/admin/hr_update_validator/upload?${queryString}`;

      // Debug logging
      console.log("Validator upload API - Full URL:", fullUrl);
      console.log("Validator upload API - Parameters:", { 
        empNo,
        file: { name: file?.name, size: file?.size, type: file?.type }
      });
      
      // Check if token exists
      const accessToken = localStorage.getItem('accessToken');
      console.log("Access token exists:", !!accessToken);
      if (!accessToken) {
        console.error("No access token found! User may need to log in again.");
      }

      try {
        // Don't pass headers object - let the interceptor handle Authorization
        // and let browser set Content-Type automatically for FormData
        const response = await apiClient.post(
          fullUrl,
          formData
        );

        return response.data;
      } catch (error) {
        // Log detailed error information
        console.error("Validator upload error details:", {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          message: error?.message,
          config: {
            url: error?.config?.url,
            method: error?.config?.method,
            headers: error?.config?.headers,
            dataType: error?.config?.data?.constructor?.name,
            isFormData: error?.config?.data instanceof FormData,
          }
        });
        throw error;
      }
    },

    // Get error logs
    getErrorLogs: async ({ financialYear, roleName }) => {
      try {
        // Ensure roleName is decoded (replace + with space) before encoding
        const decodedRoleName = roleName ? roleName.replace(/\+/g, ' ') : roleName;

        // Build query string manually to match cURL format (using %20 for spaces like cURL)
        const queryParams = [];
        if (financialYear) queryParams.push(`financialYear=${encodeURIComponent(financialYear)}`);
        if (decodedRoleName) queryParams.push(`roleName=${encodeURIComponent(decodedRoleName)}`); // This will encode space as %20

        const queryString = queryParams.join('&');

        const response = await apiClient.get(
          `/appraisal/admin/hr_update_validator/error_logs?${queryString}`
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching validator error logs:", error);
        throw error;
      }
    },

    // Download data table
    downloadDataTable: async ({ roleName, regionCode, quarter, financialYear }) => {
      try {
        const params = new URLSearchParams({
          roleName,
          regionCode,
          quarter,
          financialYear,
        });

        const response = await apiClient.get(
          `/appraisal/admin/hr_update_validator/download_data_table?${params.toString()}`,
          {
            responseType: "blob",
          }
        );

        return response.data;
      } catch (error) {
        console.error("Error downloading validator data table:", error);
        throw error;
      }
    },

    // Download sample file
    downloadSample: async ({ roleName, regionCode, quarter, financialYear }) => {
      try {
        // Ensure roleName is decoded (replace + with space) before encoding
        const decodedRoleName = roleName ? roleName.replace(/\+/g, ' ') : roleName;

        // Build query string manually to match cURL format exactly (using %20 for spaces)
        const queryParams = [];
        if (decodedRoleName) queryParams.push(`roleName=${encodeURIComponent(decodedRoleName)}`);
        if (regionCode) queryParams.push(`regionCode=${encodeURIComponent(String(regionCode))}`);
        if (quarter) queryParams.push(`quarter=${encodeURIComponent(quarter)}`);
        if (financialYear) queryParams.push(`financialYear=${encodeURIComponent(String(financialYear))}`);

        const queryString = queryParams.join('&');
        const fullUrl = `/appraisal/admin/hr_update_validator/download_sample?${queryString}`;

        console.log("Download sample API - Full URL:", fullUrl);
        console.log("Download sample API - Parameters:", {
          roleName,
          decodedRoleName,
          regionCode,
          quarter,
          financialYear,
        });

        const response = await apiClient.get(fullUrl, {
          headers: {
            // Match Excel content type expected by backend (like Postman cURL)
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          responseType: "blob",
        });

        return response.data;
      } catch (error) {
        console.error("Error downloading validator sample:", error);
        throw error;
      }
    },
  },

  // Logs APIs
  logs: {
    // Quarterly Appraisal Status Log
    getQuarterlyAppraisalStatusLog: async ({ financialYear }) => {
      // Matches cURL:
      // /appraisal/admin/logs/quarterly-appraisal-status?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/quarterly-appraisal-status`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q1 Appraisal Status Log
    getQ1StatusLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q1-status?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q1-status`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q2 Appraisal Status Log
    getQ2StatusLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q2-status?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q2-status`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q3 Appraisal Status Log
    getQ3StatusLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q3-status?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q3-status`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q4 Appraisal Status Log
    getQ4StatusLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q4-status?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q4-status`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Annual Appraisal Status Log
    getAnnualAppraisalStatusLog: async ({ financialYear }) => {
      // Matches cURL:
      // /appraisal/admin/logs/annual-appraisal-status?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/annual-appraisal-status`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Download annual appraiser details
    getAnnualAppraiserDetails: async ({ financialYear }) => {
      // Matches cURL:
      // /appraisal/admin/logs/annual-appraiser-details?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/annual-appraiser-details`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Annual Score Log
    getAnnualScoreLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/annual-score?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/annual-score`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Appeal Report Log
    getAppealReportLog: async ({ financialYear }) => {
      // Matches cURL:
      // /appraisal/admin/logs/appeal-report?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/appeal-report`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q1 Appraisal Score Log
    getQ1ScoreLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q1-score?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q1-score`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q2 Appraisal Score Log
    getQ2ScoreLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q2-score?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q2-score`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q3 Appraisal Score Log
    getQ3ScoreLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q3-score?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q3-score`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q4 Appraisal Score Log
    getQ4ScoreLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q4-score?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q4-score`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Q4 Appraisal Score Log
    getQ4ScoreLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/q4-score?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/q4-score`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Final Score Log
    getFinalScoreLog: async ({ financialYear, empNumber }) => {
      // /appraisal/admin/logs/final-score?financialYear=2025&empNumber=36663
      const year = String(financialYear);
      const empNo = String(empNumber);
      const response = await apiClient.get(
        `/appraisal/admin/logs/final-score`,
        {
          params: {
            financialYear: year,
            empNumber: empNo,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Quarterly Exception Log
    getQuarterlyExceptionLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/quarterly-exception?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/quarterly-exception`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Development Inputs Log
    getDevelopmentInputsLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/development-inputs?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/development-inputs`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Integrity Inputs Log
    getIntegrityInputsLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/integrity-inputs?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/integrity-inputs`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Repa, Reva, and AC Remarks Log
    getRepaRevaAcRemarksLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/repa-reva-ac-remarks?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/repa-reva-ac-remarks`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },

    // Exception Approval List Log
    getExceptionApprovalListLog: async ({ financialYear }) => {
      // /appraisal/admin/logs/exception-approval-list?financialYear=2025
      const year = String(financialYear);
      const response = await apiClient.get(
        `/appraisal/admin/logs/exception-approval-list`,
        {
          params: {
            financialYear: year,
          },
          responseType: "blob",
        }
      );
      return response.data; // XLSX blob
    },
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
