import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import taskService from '../services/taskService';

const Debug = () => {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const log = (message) => {
        setOutput((prev) => prev + '\n' + JSON.stringify(message, null, 2));
    };

    const clearLog = () => setOutput('');

    const testHealth = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/api/health');
            log({ test: 'GET /api/health', result: res.data });
        } catch (err) {
            log({ test: 'GET /api/health', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testHealthDB = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/api/health/db');
            log({ test: 'GET /api/health/db', result: res.data });
        } catch (err) {
            log({ test: 'GET /api/health/db', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testRegister = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.post('/api/auth/register', {
                email: `test-${Date.now()}@example.com`,
                password: 'password123',
                name: 'Test User',
            });
            log({ test: 'POST /api/auth/register', result: res.data });
        } catch (err) {
            log({ test: 'POST /api/auth/register', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testLogin = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.post('/api/auth/login', {
                email: 'test@example.com',
                password: 'password123',
            });
            log({ test: 'POST /api/auth/login', result: res.data });
        } catch (err) {
            log({ test: 'POST /api/auth/login', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testRefreshToken = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.post('/api/auth/refresh');
            log({ test: 'POST /api/auth/refresh', result: res.data });
        } catch (err) {
            log({ test: 'POST /api/auth/refresh', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testLogout = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.post('/api/auth/logout');
            log({ test: 'POST /api/auth/logout', result: res.data });
        } catch (err) {
            log({ test: 'POST /api/auth/logout', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testCreateTask = async () => {
        setIsLoading(true);
        try {
            const res = await taskService.createTask('Debug test input text');
            log({ test: 'POST /api/tasks', result: res });
        } catch (err) {
            log({ test: 'POST /api/tasks', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testGetTasks = async () => {
        setIsLoading(true);
        try {
            const res = await taskService.getTasks();
            log({ test: 'GET /api/tasks', result: res });
        } catch (err) {
            log({ test: 'GET /api/tasks', error: err.response?.data || err.message });
        }
        setIsLoading(false);
    };

    const testWorker = async () => {
        log({ test: 'Web Worker', status: 'starting' });
        const worker = new Worker(new URL('../workers/textProcessor.js', import.meta.url), {
            type: 'module',
        });

        worker.onmessage = (event) => {
            log({ test: 'Web Worker', event: event.data });
        };

        worker.postMessage({ text: 'Hello World Test' });

        setTimeout(() => worker.terminate(), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Debug Console</h1>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={testHealth}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                    >
                        Health
                    </button>
                    <button
                        onClick={testHealthDB}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                    >
                        Health DB
                    </button>
                    <button
                        onClick={testRegister}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                    >
                        Register
                    </button>
                    <button
                        onClick={testLogin}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                    >
                        Login
                    </button>
                    <button
                        onClick={testRefreshToken}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                    >
                        Refresh Token
                    </button>
                    <button
                        onClick={testLogout}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                    >
                        Logout
                    </button>
                    <button
                        onClick={testCreateTask}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold"
                    >
                        Create Task
                    </button>
                    <button
                        onClick={testGetTasks}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold"
                    >
                        Get Tasks
                    </button>
                    <button
                        onClick={testWorker}
                        disabled={isLoading}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold"
                    >
                        Test Worker
                    </button>
                    <button
                        onClick={clearLog}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold col-span-2 md:col-span-3"
                    >
                        Clear Log
                    </button>
                </div>

                <div className="bg-black rounded p-6 font-mono text-sm overflow-auto max-h-96">
                    <pre className="text-green-400">{output || 'Output will appear here...'}</pre>
                </div>
            </div>
        </div>
    );
};

export default Debug;
