import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';

const Dashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await taskService.getTasks();
            setTasks(response.data || []);
        } catch (err) {
            setError('Failed to load tasks');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await taskService.deleteTask(taskId);
            setTasks(tasks.filter((t) => t.id !== taskId));
        } catch (err) {
            setError('Failed to delete task');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
                        {user && <p className="text-gray-600 text-sm">Welcome, {user.email}</p>}
                    </div>
                    <div className="flex gap-4">
                        <Link
                            to="/tasks/create"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
                        >
                            + New Task
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600 mb-4">No tasks yet. Create your first task!</p>
                        <Link
                            to="/tasks/create"
                            className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
                        >
                            Create Task
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.inputText}</h3>
                                <div className="mb-4">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${task.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : task.status === 'processing'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {task.status}
                                    </span>
                                </div>
                                {task.result && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        Result: {task.result}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Link
                                        to={`/tasks/${task.id}`}
                                        className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;