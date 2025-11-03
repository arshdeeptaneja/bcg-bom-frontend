import apiClient from './api';

export class RoleAllocationService {

  // Get role allocation data for all employees
  static async getRoleAllocationData() {
    try {
      const response = await apiClient.get('/roleClarity/v1/role-allocation/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching role allocation data:', error);
      throw error;
    }
  }

  // Get role history for a specific employee
  static async getEmployeeRoleHistory(empId, empName, sol, assignmentId, usertype, unitType) {
    try {
      const params = new URLSearchParams({
        empId: empId,
        empName: empName.toString(),
        sol: sol.toString(),
        assignmentId: assignmentId.toString(),
        userType: 4,
        unitType: unitType
      });
      const response = await apiClient(`/roleClarity/v1/rct/roleAllocation/${empId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee role history:', error);
      throw error;
    }
  }

  // Get team members and their allocation status
  static async getTeamAllocationStatus(empNo) {
    try {
      const response = await apiClient.get(`/roleClarity/v1/role-allocation/team/${empNo}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team allocation status:', error);
      throw error;
    }
  }

  // Add new role for an employee
  static async addNewRole(empNo, roleData) {
    try {
      const response = await apiClient.post(`/roleClarity/v1/role-allocation/employee/${empNo}/role`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error adding new role:', error);
      throw error;
    }
  }

  // Update role status (accept/reject)
  static async updateRoleStatus(empNo, roleId, status) {
    try {
      const response = await apiClient.put(`/roleClarity/v1/role-allocation/employee/${empNo}/role/${roleId}/status`, {
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating role status:', error);
      throw error;
    }
  }

  // Update role status (accept/reject)
  static async deleteRole(empId, urlId) {
    try {
      const response = await apiClient.post(`/roleClarity/v1/rct/deleteRoleData`, {
        // status: status
        empNo: empId,
        urlId: urlId

      });
      return response.data;
    } catch (error) {
      console.error('Error updating role status:', error);
      throw error;
    }
  }
  // static async getRolesForCombination(EMP_ID,LOCATION_ID,primary,unitType) {
  //   try {
  //     const response = await apiClient.post(`/roleClarity/v1/rct/getRolesForCombination`,{
  //         "empId": EMP_ID,
  //         "locationId": LOCATION_ID,
  //         "unitType": unitType,
  //         "userTypeCode": '',
  //         "vertical": "",
  //         "primary": primary,
  //         "secondary": "None",
  //         "tertiary": "None",
  //         "quaternary": "",
  //         "quinary": "",
  //         "rcMppStatus": "NO",
  //         "level": ''

  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching team allocation status:', error);
  //     throw error;
  //   }
  // }
  static async getRolesForCombination(EMP_ID, LOCATION_ID,vertical,primary, secondary, tertiary, unitType, userType) {
    try {
      const response = await apiClient.post(`/roleClarity/v1/rct/getRolesForCombination`, {
        "empId": EMP_ID,
        "locationId": LOCATION_ID,
        "unitType": unitType,
        "userTypeCode": 4,
        "vertical": vertical || "None",
        "primary": primary || "None",
        "secondary": secondary || "None",
        "tertiary": tertiary || "None",
        "quaternary": "",
        "quinary": "",
        "rcMppStatus": "",
        "level": ''

      });
      console.log(response, "responseresponse")
      return response.data;
    } catch (error) {
      console.error('Error fetching team allocation status:', error);
      throw error;
    }
  }

  static async getNewEmpKraData(data) {
    try {
      const response = await apiClient.post(`/roleClarity/v1/rct/getNewEmpKraData`, data);
      return response.data;
    } catch (error) {
      console.error('Error fetching team allocation status:', error);
      throw error;
    }
  }

  static async submitRoleData(data) {
    try {
      const response = await apiClient.post(`/roleClarity/v1/rct/submitRoleData`, data);
      return response.data;
    } catch (error) {
      console.error('Error fetching team allocation status:', error);
      throw error;
    }
  }
  static async submitRespond(data) {
    try {
      const response = await apiClient.post(`/roleClarity/v1/rct/saveResponse`, data);
      return response.data;
    } catch (error) {
      console.error('Error fetching team allocation status:', error);
      throw error;
    }
  }

}




// Export default instance for convenience
export default RoleAllocationService;

// Named exports for specific methods
export const {
  getRoleAllocationData,
  getEmployeeRoleHistory,
  getTeamAllocationStatus,
  addNewRole,
  updateRoleStatus,
  getMockData
} = RoleAllocationService;