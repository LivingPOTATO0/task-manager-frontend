import React, { useState, useEffect } from 'react';

// Global error store
let errorListeners = [];

export const useErrorToast = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleError = (err) => {
            if (err && err.message) {
                setError(err.message);
                setTimeout(() => setError(null), 3000);
            }
        };

        errorListeners.push(handleError);

        return () => {
            errorListeners = errorListeners.filter((listener) => listener !== handleError);
        };
    }, []);

    return error;
};

export const showError = (message) => {
    const error = { message };
    errorListeners.forEach((listener) => listener(error));
};

const ErrorToast = () => {
    const error = useErrorToast();

    if (!error) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            {error}
        </div>
    );
};

export default ErrorToast;
