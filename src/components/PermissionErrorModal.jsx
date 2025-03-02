import React from 'react';

export function PermissionErrorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Warning Icon */}
          <div className="mb-4 p-3 rounded-full bg-yellow-100">
            <svg 
              className="w-12 h-12 text-yellow-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Permission Required
          </h3>

          <p className="mb-6 text-center text-gray-600">
            You don't have permission to perform this action. Please contact Arun Jacob to request access.
          </p>

          {/* Contact Information */}
          <div className="w-full p-4 bg-gray-50 rounded-lg mb-6">
            <p className="text-sm text-gray-600 text-center">
              Contact Information:<br />
              <a 
                href="mailto:arun.jacob@example.com" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                arun.jacob@example.com
              </a>
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 