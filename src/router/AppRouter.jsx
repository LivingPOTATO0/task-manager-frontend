import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Page imports
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CreateTask from '../pages/CreateTask';
import TaskView from '../pages/TaskView';
import Debug from '../pages/Debug';

const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/debug" element={<Debug />} />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tasks/create"
                element={
                    <ProtectedRoute>
                        <CreateTask />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tasks/:id"
                element={
                    <ProtectedRoute>
                        <TaskView />
                    </ProtectedRoute>
                }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRouter;