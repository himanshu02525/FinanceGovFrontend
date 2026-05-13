import axios from 'axios';

/**
 * API SERVICE CONFIGURATION
 * Direct connection to citizen_business_service to bypass Gateway issues.
 */
const api = axios.create({
  baseURL: 'http://localhost:8082', // UPDATED: Direct port for 8082
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * AUTHENTICATION INTERCEPTOR
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * CITIZEN & BUSINESS ENTITY ENDPOINTS
 */
export const createCitizen = (data) => api.post('/entities/createCitizen', data);
export const getCitizenById = (id) => api.get(`/entities/getCitizenById/${id}`);
export const getCitizenByUserId = (userId) => api.get(`/entities/getCitizenByUserId/${userId}`);
export const approveCitizen = (id) => api.put(`/entities/approveCitizen/${id}`);
export const updateCitizen = (id, data) => api.put(`/entities/updateCitizenById/${id}`, data);

/**
 * DOCUMENT MANAGEMENT ENDPOINTS
 */
export const uploadDoc = (entityId, docData) => api.post(`/documents/uploadDoc/${entityId}`, docData);
export const verifyDoc = (entityId, docType) => api.put(`/documents/verify/${entityId}/${docType}`);
export const rejectDoc = (entityId, docType) => api.put(`/documents/reject/${entityId}/${docType}`);
export const fetchAllDocuments = () =>
  api.get('/documents/getAllDocument').then((response) => response.data);
export const updateDoc = (entityId, docType, docData) => api.put(`/documents/updateDoc/${entityId}/${docType}`, docData);

export default api;