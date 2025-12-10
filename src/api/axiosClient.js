import axios from 'axios';
import { showError } from '../components/ErrorToast';

// Module-level variable to store access token (in memory only)
let accessToken = '';

// Function to set the access token (called by AuthContext)
export const setAccessToken = (token) => {
    accessToken = token;
    if (token) {
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosClient.defaults.headers.common['Authorization'];
    }
};

// Get current access token
export const getAccessToken = () => accessToken;

// Create axios instance with default config
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    withCredentials: true, // Enable cookies for refresh token (httpOnly cookie will be sent automatically)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Add token to every request
axiosClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401 and auto-refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Create a fresh axios instance to avoid circular interceptor issues
                const refreshAxios = axios.create({
                    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
                    withCredentials: true,
                });

                // Call refresh endpoint
                const refreshResponse = await refreshAxios.post('/api/auth/refresh');

                // Update token
                const newToken = refreshResponse.data.accessToken;
                setAccessToken(newToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear token and dispatch logout event
                setAccessToken('');
                window.dispatchEvent(new Event('logout'));
                showError('Session expired. Please login again.');
                return Promise.reject(refreshError);
            }
        }

        // Show error toast for non-401 errors
        if (error.response?.status !== 401) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            showError(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;