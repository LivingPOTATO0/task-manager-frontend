import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService';
import ProgressBar from '../components/ProgressBar';

const TaskView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState('');
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const workerRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchTask();
        }
    }, [id]);

    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const fetchTask = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await taskService.getTask(id);
            const taskData = response.data;
            setTask(taskData);
            setStatus(taskData.status);
            setResult(taskData.result || '');

            // Auto-process if task is not completed
            if (taskData.status !== 'completed' && !taskData.result) {
                startWorkerProcessing(taskData.inputText);
            }
        } catch (err) {
            setError('Failed to load task');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const startWorkerProcessing = (text) => {
        setIsProcessing(true);
        setProgress(0);
        setProcessingStep('Initializing...');

        // Create worker with Vite-compatible import
        const worker = new Worker(
            new URL('../workers/textProcessor.js', import.meta.url),
            { type: 'module' }
        );
        workerRef.current = worker;

        worker.onmessage = (event) => {
            const { type, value, step, result: workerResult } = event.data;

            if (type === 'progress') {
                setProgress(value);
                setProcessingStep(step || `Processing: ${value}%`);
            } else if (type === 'done') {
                setProgress(100);
                setProcessingStep('Complete!');
                setResult(JSON.stringify(workerResult, null, 2));
                setStatus('completed');
                setIsProcessing(false);

                // Auto-save result
                setTimeout(() => {
                    saveResult('completed', JSON.stringify(workerResult, null, 2));
                }, 500);
            } else if (type === 'error') {
                setError(event.data.message);
                setIsProcessing(false);
            }
        };

        worker.onerror = (error) => {
            setError(`Worker error: ${error.message}`);
            setIsProcessing(false);
        };

        worker.postMessage({ text });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        await saveResult(status, result);
    };

    const saveResult = async (newStatus, newResult) => {
        setIsUpdating(true);
        try {
            await taskService.updateTask(id, {
                status: newStatus,
                result: newResult,
            });
            await fetchTask();
        } catch (err) {
            setError('Failed to update task');
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await taskService.deleteTask(id);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to delete task');
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">Loading task...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">Task not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-3xl font-bold text-gray-800">Task Details</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Task Info */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Input Text</h2>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
                            {task.inputText}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Status</h3>
                        <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'processing'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {task.status}
                        </span>
                    </div>

                    {/* Progress Bar - Show while processing */}
                    {isProcessing && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <ProgressBar value={progress} />
                            <p className="text-sm text-blue-700 mt-3">{processingStep}</p>
                        </div>
                    )}

                    {/* Update Form */}
                    <form onSubmit={handleUpdate} className="space-y-6 border-t pt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Update Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={isUpdating || isProcessing}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Result
                            </label>
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                placeholder="Add the result of processing..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                                rows="6"
                                disabled={isUpdating || isProcessing}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isUpdating || isProcessing}
                                className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                            >
                                {isUpdating ? 'Updating...' : 'Update Task'}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                            >
                                Delete
                            </button>
                            <Link
                                to="/dashboard"
                                className="flex-1 text-center py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
                            >
                                Back
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default TaskView;