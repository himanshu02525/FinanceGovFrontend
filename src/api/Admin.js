import axios from 'axios';

const BASE_URL = 'http://localhost:8082';

export const fetchAllCitizens = () =>
  axios.get(`${BASE_URL}/entities/getAllEntity`).then((response) => response.data);

export const approveCitizen = (entityId) =>
  axios.put(`${BASE_URL}/entities/approveCitizen/${entityId}`).then((response) => response.data);

export const fetchAllDocuments = () =>
  axios.get(`${BASE_URL}/documents/getAllDocument`).then((response) => response.data);

export const verifyDocument = (entityId, docType) =>
  axios.put(`${BASE_URL}/documents/verify/${entityId}/${docType}`).then((response) => response.data);

export const rejectDocument = (entityId, docType) =>
  axios.put(`${BASE_URL}/documents/reject/${entityId}/${docType}`).then((response) => response.data);

export const getDocumentPreview = (entityId, docType) =>
  axios.get(`${BASE_URL}/documents/downloadDoc/${entityId}/${docType}`, {
    responseType: 'blob'
  }).catch(() => {
    // Fallback to alternative endpoint if downloadDoc doesn't exist
    return axios.get(`${BASE_URL}/documents/getDoc/${entityId}/${docType}`, {
      responseType: 'blob'
    });
  });
