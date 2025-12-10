import React from 'react';

const ProgressBar = ({ value = 0 }) => {
    const percentage = Math.min(Math.max(value, 0), 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Processing</span>
                <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
