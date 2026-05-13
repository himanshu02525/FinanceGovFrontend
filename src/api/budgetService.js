import axiosInstance from './axiosInstance';

const BUDGET_API = '/budget';

const budgetService = {
  /**
   * Create a new budget allocation
   * @param {Object} data - Budget allocation data
   * @param {number} data.programId - Program ID
   * @param {number} data.amount - Amount to allocate
   * @param {string} data.date - Allocation date (ISO format)
   * @param {string} data.status - Status (ALLOCATED or CANCELLED)
   * @returns {Promise<Object>} - Response with allocationId, programId, amount, date, status
   */
  createAllocation: async (data) => {
    try {
      const response = await axiosInstance.post(`${BUDGET_API}/createAllocation`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all budget allocations
   * @returns {Promise<Array>} - Array of all allocations
   */
  getAllAllocations: async () => {
    try {
      const response = await axiosInstance.get(`${BUDGET_API}/getAllAllocation`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get budget summary for a specific program
   * @param {number} programId - Program ID
   * @returns {Promise<Object>} - Summary including baseBudget, totalAllocated, remainingBase, totalUsed, remainingAllocated
   */
  getBudgetSummary: async (programId) => {
    try {
      const response = await axiosInstance.get(`${BUDGET_API}/summary/${programId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a budget allocation
   * @param {number} allocationId - Allocation ID to delete
   * @returns {Promise<Object>} - Response with message
   */
  deleteAllocation: async (allocationId) => {
    try {
      console.log('📤 SENDING DELETE ALLOCATION REQUEST');
      console.log('Allocation ID:', allocationId);
      const response = await axiosInstance.delete(`${BUDGET_API}/deleteAllocation/${allocationId}`);
      console.log('📥 DELETE ALLOCATION RESPONSE:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('💥 DELETE ALLOCATION FAILED:', error);
      throw error;
    }
  },
};

export default budgetService;
