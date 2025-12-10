import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axiosClient, { setAccessToken as updateAxiosToken, getAccessToken } from '../api/axiosClient.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const autoRefreshIntervalRef = useRef(null);

    // Set access token and update Axios
    const setAccessToken = useCallback((token) => {
        setAccessTokenState(token);
        updateAxiosToken(token);
        setIsAuthenticated(!!token);
    }, []);

    // Login function
    const login = useCallback(
        async (email, password) => {
            setLoading(true);
            try {
                const response = await axiosClient.post('/api/auth/login', {
                    email,
                    password,
                });

                const { accessToken: token } = response.data;
                setAccessToken(token);
                setUser({ email }); // Store minimal user info
                return { success: true };
            } catch (error) {
                const message = error.response?.data?.message || 'Login failed';
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [setAccessToken]
    );

    // Logout function
    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await axiosClient.post('/api/auth/logout');
            setAccessToken('');
            setUser(null);
            setIsAuthenticated(false);
            // Clear auto-refresh interval
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
                autoRefreshIntervalRef.current = null;
            }
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear token even if logout API fails
            setAccessToken('');
            setUser(null);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }, [setAccessToken]);

    // Register function
    const register = useCallback(
        async (name, email, password) => {
            setLoading(true);
            try {
                const response = await axiosClient.post('/api/auth/register', {
                    name,
                    email,
                    password,
                });

                const { accessToken: token } = response.data;
                setAccessToken(token);
                setUser({ name, email });
                return { success: true };
            } catch (error) {
                const message = error.response?.data?.message || 'Registration failed';
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [setAccessToken]
    );

    // Refresh access token function
    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await axiosClient.post('/api/auth/refresh');
            const { accessToken: token } = response.data;
            setAccessToken(token);
            return { success: true };
        } catch (error) {
            console.error('Token refresh failed:', error);
            setAccessToken('');
            setUser(null);
            window.dispatchEvent(new Event('logout'));
            return { success: false, error: error.message };
        }
    }, [setAccessToken]);

    // Setup auto-refresh every 10 minutes
    useEffect(() => {
        if (accessToken) {
            // Clear existing interval if any
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }

            // Setup new interval: refresh every 10 minutes (600000ms)
            autoRefreshIntervalRef.current = setInterval(() => {
                refreshAccessToken();
            }, 10 * 60 * 1000); // 10 minutes

            return () => {
                if (autoRefreshIntervalRef.current) {
                    clearInterval(autoRefreshIntervalRef.current);
                }
            };
        }
    }, [accessToken, refreshAccessToken]);

    // Listen for logout events from axios interceptor
    useEffect(() => {
        const handleLogout = () => {
            setAccessToken('');
            setUser(null);
            setIsAuthenticated(false);
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }
        };

        window.addEventListener('logout', handleLogout);
        return () => window.removeEventListener('logout', handleLogout);
    }, [setAccessToken]);

    const value = {
        accessToken,
        setAccessToken,
        isAuthenticated,
        user,
        setUser,
        login,
        logout,
        register,
        refreshAccessToken,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};