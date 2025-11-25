import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8084';

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
  // const token = localStorage.getItem('accessToken');
   const token = 'kf93jF!8sh2%wX9aL0pQzV3rB8xYtU2eR6sD9jH1kM5nW4qT';
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

  //GET: get quarterly check-in report data Apppraiser

 getQuarterlyAppraiserCheckInReport: async ({
  empNo,
  url,
  roleType,
  financialYear,
  quarter,
  pageType,
  appraisalStatus,
  intent = "Fill",
}) => {
  try {
    const params = new URLSearchParams();

    // Only append if value exists
    if (empNo) params.append("empNo", empNo);
    if (url) params.append("url", url);
    if (roleType) params.append("roleType", roleType);
    if (financialYear) params.append("financialYear", financialYear);
    if (quarter) params.append("quarter", quarter);
    if (pageType) params.append("pageType", pageType);
    if (appraisalStatus) params.append("appraisalStatus", appraisalStatus);

    // Always required
    params.append("intent", intent);

    const response = await apiClient.get(
      `${appraisalBaseUrl}/quarterly_check_in_report?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("Error in getQuarterlyAppraiserCheckInReport:", error);
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
  const res = await axios.get(`/appraisal/admin/hr_dashboard`, {
    params: {
      empNo,
      appraisalPeriod,
      financialYear,
    },
  });
  return res.data;
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

 //post : Appraiser check in submit
  submitQuarterlyAppraiserCheckInReport: async (payload = {}) => {
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

  //post :Appraiser check-in save
  appraiserSaveQuarterlyCheckIn: async (payload = {}) => {
    try{ const response= await apiClient.post(
        '/appraisal/quarterly_check_in_report/save',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('appraiserSaveQuarterlyCheckIn error', error);
      throw error;
    }
  },


//post : Appraisee check in submit
    submitQuarterlyAppraiseeCheckInReport: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        '/appraisal/quarterly_check_in_report/submit',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('submitQuarterlyAppraiseeCheckInReport error', error);
      throw error;
    }
  },

  //post Appraisee Check in save 
  appraiseeSaveQuarterlyCheckIn: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        'appraisal/quarterly_check_in_report/save',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('appraiseeSaveQuarterlyCheckIn error', error);
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

  // POST: Submit quarterly exception report with file attachment
  submitQuarterlyExceptionReport: async (payload, attachment) => {
    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      formData.append('attachment', attachment);
      const response = await apiClient.post(
        '/appraisal/quarterly_exception_report/submit_exception',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('submitQuarterlyExceptionReport success:', response.data);
      return response.data;
    } catch (error) {
      console.error('submitQuarterlyExceptionReport error:', error.response?.data || error.message);
      throw error;
    }
  },

  
  // GET: Get quarterly exception report data
  getQuarterlyExceptionReport: async ({ urlId, financialYear, quarter }) => {
    try {
      const params = new URLSearchParams({
        urlId: urlId,
        financialYear: financialYear,
        quarter: quarter,
      });
      const response = await apiClient.get(
        `/appraisal/quarterly_exception_report?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('getQuarterlyExceptionReport error', error);
      throw error;
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
      const params = new URLSearchParams({
        sol,
        roleName,
        empNo,
      });

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/appraisal/admin/hr_update_annual_repa_reva_surl/upload?${params.toString()}`,
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
  searchHRStatusUpdate: async ({ empNo }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo || ""
      });

      const response = await apiClient.get(
        `/admin/hr_status_update_utility?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("HR Status Search Error:", error);
      throw error;
    }
  },


  //Appraisal Status Change Utility--Update Status
  updateHRStatus: async ({ assignmentId, newStatus }) => {
    try {
      const response = await apiClient.post(
        `/admin/hr_status_update_utility/update_status`,
        {
          assignmentId,
          newStatus,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },

  // SEARCH EMP EXCEPTION DELETE URL LIST
  searchExceptionDeleteURL: async ({ empNo }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo || "",
      });

      const response = await apiClient.get(
        `/admin/hr_exception_delete_urlid?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching exception delete url:", error);
      throw error;
    }
  },

  //EXCEPTION DELETE BUTTON TO DELETE 
  deleteExceptionURL: async ({ urlId }) => {
    try {
      const params = new URLSearchParams({
        urlId: urlId
      });

      const response = await apiClient.delete(
        `/admin/hr_exception_delete_urlid/delete?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting exception URL:", error);
      throw error;
    }
  },

  //SEARCH APPEAL DELECTION
  searchAppealDeleteURL: async ({ empNo }) => {
    try {
      const params = new URLSearchParams({
        empNo: empNo || "",
      });

      const response = await apiClient.get(
        `/admin/hr_appeal_delete_urlid?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching Appeal delete url:", error);
      throw error;
    }
  },

  //Appeal DELETE BUTTON TO DELETE 
  deleteAppealURL: async ({ urlId }) => {
    try {
      const params = new URLSearchParams({
        urlId: urlId
      });

      const response = await apiClient.delete(
        `/admin/hr_appeal_delete_urlid/delete?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting exception URL:", error);
      throw error;
    }
  },

  //Module Active Inactive Date
  // GET LIST 
  moduleActiveInactiveDateGetList: async () => {
    try {
      const response = await apiClient.get(
        `/admin/hr_module_active_inactive_date`
      );
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
        `/admin/hr_module_active_inactive_date/${intent}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error in ${intent}:`, error);
      throw error;
    }
  },

  //insert Annual Roles
  insertAnnualRoles: async () => {
    try {
      const response = await apiClient.post(`/admin/hr_insert_annual_roles`);
      return response.data;
    } catch (error) {
      console.error("Error inserting annual roles:", error);
      throw error;
    }
  },



  // Appeal Committee APIs
  appealCommittee: {

    // List/History logs
    getErrorLogs: async () => {
      const response = await apiClient.get(
        `/admin/hr_update_appeal_committee/error_logs`
      );
      return response.data;
    },

    // Upload Excel File
    uploadFile: async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/admin/hr_update_appeal_committee/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    },

    // Download Data Table
    downloadDataTable: async () => {
      const response = await apiClient.get(
        `/admin/hr_update_appeal_committee/download_data_table`,
        { responseType: "blob" }
      );
      return response.data;
    },

    // Download Sample File
    downloadSample: async () => {
      const response = await apiClient.get(
        `/admin/hr_update_appeal_committee/download_sample`,
        { responseType: "blob" }
      );
      return response.data;
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
