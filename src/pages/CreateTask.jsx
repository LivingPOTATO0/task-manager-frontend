import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService';

const CreateTask = () => {
    const navigate = useNavigate();
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await taskService.createTask(inputText);
            if (response.status === 'OK' && response.data?.id) {
                navigate(`/tasks/${response.data.id}`);
            } else {
                setError('Failed to create task: no ID returned');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-3xl font-bold text-gray-800">Create New Task</h1>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-2xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Task Description
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Enter your task or input text..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows="6"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-gray-500 text-sm mt-2">
                                Provide a clear description of what you need processed.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                            >
                                {isLoading ? 'Creating...' : 'Create Task'}
                            </button>
                            <Link
                                to="/dashboard"
                                className="flex-1 text-center py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateTask;