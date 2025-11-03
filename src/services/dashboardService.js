import apiClient from './api';
import axios from 'axios';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
export class DashboardService {
  
  /**
   * Get general dashboard data
   * @returns {Promise} Dashboard data
   */
  static async getDashboardData() {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get role history data
   * @returns {Promise} Role history data
   */
  static async getRoleHistory() {
    try {
      const response = await apiClient.get('/dashboard/role-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching role history:', error);
      throw error;
    }
  }

  /**
   * Get RCT dashboard data with employee details
   * @param {string} empNo - Employee number
   * @param {string} sol - SOL (Service Outlet Location)
   * @param {string} unitType - Unit type (e.g., 'Retail')
   * @returns {Promise} RCT dashboard data
   */
  static async getRCTDashboard(empNo, sol, unitType,empDsg) {
    try {
      // Validate required parameters
      if (!empNo || !sol || !unitType) {
        throw new Error('Employee number, SOL, and unit type are required');
      }

      const params = new URLSearchParams({
        empNo: empNo.toString(),
        sol: sol.toString(),
        unitType: unitType.toString(),
        empDsg: empDsg,
      });

      const response = await apiClient.get(`/roleClarity/v1/rct/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching RCT dashboard data:', error);
      throw error;
    }
  }

  static async getDashboardDetails(empNo, sol, unitType, empDsg){
        const token = localStorage.getItem('accessToken');
        try{
            // const response = await axios.get(`/rct/dashboard`, {
            //         params: {
            //             empNo,
            //             unitType,
            //             empDsg,
            //             sol
            //         }, headers: {
            //             Authorization: `Bearer ${token}`
            //         }
            //     }
            //     )
             const response = await axios.get(`/roleClarity/v1/rct/dashboard`, {
                    params: {
                        empNo,
                        unitType ,
                        empDsg,
                        sol
                    }, headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
                )

            return response.data;
        }catch(error){
            console.error('Error fetching dashboard details:', error);
            throw error;
        }
    }

  /**
   * Get RCT dashboard data with optional parameters
   * @param {Object} params - Parameters object
   * @param {string} params.empNo - Employee number
   * @param {string} params.sol - SOL (Service Outlet Location)
   * @param {string} params.unitType - Unit type
   * @param {Object} params.additionalParams - Any additional query parameters
   * @returns {Promise} RCT dashboard data
   */
  static async getRCTDashboardWithParams({ empNo, sol, unitType, additionalParams = {} }) {
    try {
      // Validate required parameters
      if (!empNo || !sol || !unitType) {
        throw new Error('Employee number, SOL, and unit type are required');
      }

      const queryParams = {
        empNo: empNo.toString(),
        sol: sol.toString(),
        unitType: unitType.toString(),
        ...additionalParams
      };

      const params = new URLSearchParams(queryParams);
      // const response = await apiClient.get(`/rct/dashboard?${params.toString()}`);
      const response = await apiClient.get(`/roleClarity/v1/rct/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching RCT dashboard data with params:', error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics
   * @param {string} empNo - Employee number
   * @returns {Promise} Dashboard metrics data
   */
  static async getDashboardMetrics(empNo) {
    try {
      if (!empNo) {
        throw new Error('Employee number is required');
      }

      const response = await apiClient.get(`/dashboard/metrics?empNo=${empNo}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get team performance data
   * @param {string} sol - SOL (Service Outlet Location)
   * @param {string} unitType - Unit type
   * @returns {Promise} Team performance data
   */
  static async getTeamPerformance(sol, unitType) {
    try {
      if (!sol || !unitType) {
        throw new Error('SOL and unit type are required');
      }

      const params = new URLSearchParams({
        sol: sol.toString(),
        unitType: unitType.toString()
      });

      const response = await apiClient.get(`/dashboard/team-performance?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team performance data:', error);
      throw error;
    }
  }
}

// Export default instance for convenience
export default DashboardService;

// Named exports for specific methods (for easier importing)
export const {
  getDashboardData,
  getRoleHistory,
  getRCTDashboard,
  getRCTDashboardWithParams,
  getDashboardDetails,
  getDashboardMetrics,
  getTeamPerformance
} = DashboardService;