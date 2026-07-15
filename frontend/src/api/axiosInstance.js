import axios from 'axios'

/**
 * Axios Instance - Pre-configured HTTP client for all API calls.
 *
 * Why use an instance instead of plain axios?
 * - Sets the base URL once (no need to repeat it in every call)
 * - Attaches JWT token automatically via request interceptor
 * - Handles 401 errors globally via response interceptor
 *
 * Interview Tip:
 * Axios interceptors are middleware for HTTP requests/responses.
 * They run before the request is sent (request interceptor) or
 * after the response is received (response interceptor).
 */
const axiosInstance = axios.create({
  baseURL: '/api',  // Proxied to http://localhost:8080/api via vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor - Runs before every request is sent.
 * Reads the JWT token from localStorage and adds it to the Authorization header.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response Interceptor - Runs after every response is received.
 * If the response is 401 Unauthorized (token expired or invalid),
 * clear the local storage and redirect to login.
 */
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - force logout
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
