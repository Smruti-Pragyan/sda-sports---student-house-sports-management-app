import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
});

// This is an interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('sda-sports-user');
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;