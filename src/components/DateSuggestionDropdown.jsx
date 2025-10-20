import { useState, useEffect, useRef } from 'react'
import { getDateSuggestions, formatDateForDisplay } from '../lib/utils/dateParser'

export function DateSuggestionDropdown({ 
  value, 
  onChange, 
  onSuggestionSelect, 
  placeholder = "Type to see date suggestions...",
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get suggestions when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      const newSuggestions = getDateSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect(suggestion.text)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleInputChange = (e) => {
    onChange(e.target.value)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = (e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{suggestion.text}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDateForDisplay(suggestion.date)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
