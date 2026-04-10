import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://chopra-footwear.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Could dispatch a logout action here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
