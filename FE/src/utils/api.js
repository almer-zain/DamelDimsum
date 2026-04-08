import axios from "axios";

/*
|--------------------------------------------------------------------------
| Resolve API URL
|--------------------------------------------------------------------------
|
| VITE_API_URL examples:
| Local dev:
|   http://localhost:3000/api
|
| Ngrok:
|   https://randolph-jawbreaking-myung.ngrok-free.dev/api
|
*/

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1")
  .replace(/\/$/, "");

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: `${API_URL}/v1`,
 withCredentials: true,
  headers: {
    // Prevent ngrok browser warning page
    "ngrok-skip-browser-warning": "true"
  }
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
|
| You can add auth headers here if needed.
| Cookies are automatically handled by the browser.
|
*/

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
|
| Handle expired sessions automatically.
|
*/

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {

      if (error.response.status === 401) {

        console.warn("Session expired or invalid. Redirecting to login...");

        localStorage.removeItem("admin");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

    }

    return Promise.reject(error);
  }
);

export default api;