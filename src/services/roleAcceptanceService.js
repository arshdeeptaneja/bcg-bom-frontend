import apiClient from "./api";

export class RoleAcceptanceService {
    static async getAcceptanceKraDetails(URL_ID,empNo,empSol){
       try{
        const  response = await apiClient.get(`/roleClarity/v1/rct/acceptanceKraDetails?url_id=${URL_ID}&empNo=${empNo}&empSol=${empSol}`);
        return response.data;
       }catch(error){
          console.log(error);
        throw error;
       }
     }

  static async saveRoleAcceptance(payload){
    try{
      const response = await apiClient.post(`/roleClarity/v1/rct/roleAcceptance`,payload);
      return response.data;
    }catch(error){
       console.error('Error while saving role',error);
       throw error;
    }
  }

  
  static async getDiscussionComment(URL_ID){
    try{
      const response = await apiClient.get(`/roleClarity/v1/rct/getComment/${URL_ID}?urlId=${URL_ID}`);
      return response.data;
    }catch(error){
       console.error('Error while saving role',error);
       throw error;
    }
  }
}

export default RoleAcceptanceService;


// Named exports for specific methods

export const {
  getAcceptanceKraDetails,
  saveRoleAcceptance,
  getDiscussionComment
} = RoleAcceptanceService