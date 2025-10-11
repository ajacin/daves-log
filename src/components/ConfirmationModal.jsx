import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faCheck, faTimes, faQuestion } from '@fortawesome/free-solid-svg-icons'

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning",
  isLoading = false 
}) {
  if (!isOpen) return null

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: faCheck,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-500',
          confirmBg: 'bg-emerald-500 hover:bg-emerald-600',
          borderColor: 'border-emerald-200'
        }
      case 'danger':
        return {
          icon: faExclamationTriangle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-500',
          confirmBg: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-200'
        }
      case 'info':
        return {
          icon: faQuestion,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-500',
          confirmBg: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-200'
        }
      default: // warning
        return {
          icon: faExclamationTriangle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-500',
          confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-200'
        }
    }
  }

  const { icon, iconBg, iconColor, confirmBg, borderColor } = getIconAndColors()

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
  }

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
          {/* Icon */}
          <div className={`mb-6 p-4 rounded-full ${iconBg} ${borderColor} border-2`}>
            <FontAwesomeIcon 
              icon={icon} 
              className={`w-8 h-8 ${iconColor}`}
            />
          </div>

          {/* Title */}
          <h3 className="mb-4 text-xl font-semibold text-slate-800">
            {title}
          </h3>

          {/* Message */}
          <p className="mb-8 text-slate-600 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex space-x-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 ${confirmBg} text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
