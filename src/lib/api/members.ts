import apiClient from "./client";
import { MembersResponse } from "./kas";

export const memberApi = {
  // Get members for current treasurer's eschool
  getMembers: async (eschoolId:number): Promise<MembersResponse> => {
    

    
    try {
      const response = await apiClient.get("/members", {
        params:{
          eschool_id:eschoolId
        }
      });
      

      // if (response.data.eschool && response.data.members) {
      //   return response.data;
      // }
      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },
  getMembersAvailable: async (params:{eschool_id:number , date? : string}): Promise<MembersResponse> => {
    try {
      const response = await apiClient.get("/attendance/members/available", {
        params 
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },
}