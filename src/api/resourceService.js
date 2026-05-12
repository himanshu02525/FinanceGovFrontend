import axiosInstance from './axiosInstance';

const RESOURCE_API = '/resources';

const resourceService = {
  /**
   * Create a new resource
   * @param {Object} data - Resource data
   * @param {number} data.programId - Program ID
   * @param {string} data.type - Resource type
   * @param {number} data.quantity - Resource quantity
   * @param {string} data.status - Status (AVAILABLE or UTILIZED)
   * @returns {Promise<Object>} - Response with resourceId, programId, type, quantity, status
   */
  createResource: async (data) => {
    try {
      const response = await axiosInstance.post(`${RESOURCE_API}/createResource`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get resources for a specific program
   * @param {number} programId - Program ID
   * @returns {Promise<Array>} - Array of resources for the program
   */
  getResourcesByProgram: async (programId) => {
    try {
      const response = await axiosInstance.get(`${RESOURCE_API}/program/${programId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all allocated resources
   * @returns {Promise<Array>} - Array of all allocated resources
   */
  getAllAllocatedResources: async () => {
    try {
      const response = await axiosInstance.get(`${RESOURCE_API}/getAllallocated`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a resource
   * @param {number} resourceId - Resource ID to delete
   * @returns {Promise<Object>} - Response with message
   */
  deleteResource: async (resourceId) => {
    try {
      console.log('📤 SENDING DELETE RESOURCE REQUEST');
      console.log('Resource ID:', resourceId);
      const response = await axiosInstance.delete(`${RESOURCE_API}/deleteResource/${resourceId}`);
      console.log('📥 DELETE RESOURCE RESPONSE:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('💥 DELETE RESOURCE FAILED:', error);
      throw error;
    }
  },
};

export default resourceService;
