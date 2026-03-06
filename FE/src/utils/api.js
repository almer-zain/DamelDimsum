import axios from 'axios';

// 1. Create the instance
const api = axios.create({
  // Clean up the URL to prevent double slashes
  baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/v1',
  
  // 2. MANDATORY: This is what allows the browser to send/receive 
  // HttpOnly cookies across different ports (5173 to 3000)
  withCredentials: true 
});

// 3. The REQUEST Interceptor 
// You NO LONGER need to manually attach the token from localStorage.
// The browser handles the cookie "wristband" for you automatically.
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. The RESPONSE Interceptor (Handling expired sessions)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401, the cookie is either missing, expired, or tampered with.
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid. Redirecting to login...");
      
      // Clean up local data
      localStorage.removeItem('admin');
      
      // Only redirect if we are not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;