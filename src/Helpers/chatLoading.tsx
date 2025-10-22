import React from "react";

const ChatLoading: React.FC = () => {
  return (
    <div className="relative w-full h-32 mb-2 border border-gray-300 p-4 bg-gray-200 overflow-hidden animate-pulse rounded-md">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>

      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 h-2.5 w-full bg-gray-400 rounded-md"></div>
        <div className="absolute top-8 left-0 h-2.5 w-11/12 bg-gray-400 rounded-md"></div>
        <div className="absolute top-16 left-0 h-2.5 w-10/12 bg-gray-400 rounded-md"></div>
      </div>
    </div>
  );
};

export default ChatLoading;
