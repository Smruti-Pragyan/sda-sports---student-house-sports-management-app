import axios from 'axios';

const baseURL =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : '/api';

const api = axios.create({
  baseURL,
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