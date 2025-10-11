import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

export function SuccessModal({ 
  isOpen, 
  onClose, 
  onAddMore,
  activityName,
  activityDetails 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-6 p-4 rounded-full bg-emerald-100 border-2 border-emerald-200">
            <FontAwesomeIcon 
              icon={faCheck} 
              className="w-8 h-8 text-emerald-500"
            />
          </div>

          {/* Success Message */}
          <h3 className="mb-2 text-xl font-semibold text-slate-800">
            Activity Logged Successfully!
          </h3>
          
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-emerald-800 font-medium">{activityName}</p>
            {activityDetails && (
              <p className="text-emerald-600 text-sm mt-1">{activityDetails}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
            >
              Done
            </button>
            <button
              onClick={onAddMore}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Add More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
