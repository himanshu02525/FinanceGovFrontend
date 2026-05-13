import axios from 'axios';

const DISCLOSURE_TAX_BASE_URL = 'http://localhost:8084';
const ENTITY_BASE_URL = 'http://localhost:8082';

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error?.response?.data?.message || error.message || 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

export const apiClient = createClient(DISCLOSURE_TAX_BASE_URL);
export const entityClient = createClient(ENTITY_BASE_URL);
