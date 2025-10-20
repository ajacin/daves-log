import { useState, useRef, useEffect } from 'react'
import { getDateSuggestions, formatDateForDisplay, extractDateFromTask } from '../lib/utils/dateParser'

export function SimpleBulkInput({ 
  value, 
  onChange, 
  placeholder = "Enter tasks here...",
  className = "",
  rows = 8
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [currentWord, setCurrentWord] = useState('')
  const [highlightedText, setHighlightedText] = useState('')
  
  const textareaRef = useRef(null)
  const dropdownRef = useRef(null)
  const overlayRef = useRef(null)

  // Simple word detection - get the last word typed
  const getLastWord = (text) => {
    const words = text.split(/\s+/)
    return words[words.length - 1] || ''
  }

  // Create highlighted text with smart date highlighting
  const createHighlightedText = (text) => {
    if (!text) return ''

    const lines = text.split('\n')
    const highlightedLines = lines.map(line => {
      if (!line.trim()) return line

      // Check if this line has a smart date
      const dateInfo = extractDateFromTask(line)
      if (dateInfo && dateInfo.parsed && dateInfo.parsed.confidence === 'high') {
        const { startIndex, endIndex } = dateInfo
        const beforeDate = line.substring(0, startIndex)
        const datePart = line.substring(startIndex, endIndex)
        const afterDate = line.substring(endIndex)
        
        return `${beforeDate}<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">${datePart}</span>${afterDate}`
      }
      
      return line
    })

    return highlightedLines.join('\n')
  }

  // Update highlighted text when value changes
  useEffect(() => {
    setHighlightedText(createHighlightedText(value))
  }, [value])

  // Check for suggestions when text changes
  const checkSuggestions = (text) => {
    const lastWord = getLastWord(text).toLowerCase().trim()
    
    console.log('Checking suggestions for:', lastWord) // Debug log
    
    if (lastWord.length >= 2) {
      const newSuggestions = getDateSuggestions(lastWord)
      console.log('Found suggestions:', newSuggestions) // Debug log
      
      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions)
        setShowSuggestions(true)
        setCurrentWord(lastWord)
        setSelectedIndex(-1)
        return
      }
    }
    
    setShowSuggestions(false)
    setCurrentWord('')
  }

  // Handle text change
  const handleChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    checkSuggestions(newValue)
  }

  // Handle suggestion selection
  const selectSuggestion = (suggestion) => {
    const words = value.split(/\s+/)
    words[words.length - 1] = suggestion
    const newValue = words.join(' ')
    
    onChange(newValue)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 0)
  }

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
          selectSuggestion(suggestions[selectedIndex].text)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex].text)
        }
        break
      default:
        // No action needed for other keys
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      
      {/* Highlighted overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap font-mono text-sm p-3 border border-transparent"
        style={{
          zIndex: 1,
          color: 'transparent',
          lineHeight: '1.5'
        }}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
      
      {/* Main textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={() => {
          if (overlayRef.current && textareaRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop
            overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
          }
        }}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm bg-transparent relative z-10 ${className}`}
        rows={rows}
        style={{ color: 'transparent' }}
      />
      
      {/* Visible text overlay */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap font-mono text-sm p-3 border border-transparent"
        style={{
          zIndex: 2,
          lineHeight: '1.5'
        }}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
      
      {/* Suggestion dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          style={{
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            minWidth: '250px'
          }}
        >
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
            Smart date suggestions for "{currentWord}"
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion.text)}
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
