import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-20 bg-gray-100 rounded-lg shadow-lg p-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce-short"></div>
        <div className="w-3 h-3 bg-red-500 rounded-full animate-spin-slow"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping-fast"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce-slow"></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-spin-fast"></div>
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping-slow"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
