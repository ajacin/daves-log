import { useState, useRef, useEffect } from 'react'
import { extractDateFromTask, getDateSuggestions, formatDateForDisplay } from '../lib/utils/dateParser'

export function SmartDateTextarea({ 
  value, 
  onChange, 
  placeholder = "Enter tasks here...",
  className = "",
  rows = 8
}) {
  const [highlightedText, setHighlightedText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [currentLineText, setCurrentLineText] = useState('')
  const textareaRef = useRef(null)
  const overlayRef = useRef(null)
  const suggestionRef = useRef(null)

  // Parse text and create highlighted version
  useEffect(() => {
    if (!value) {
      setHighlightedText('')
      return
    }

    const lines = value.split('\n')
    const highlightedLines = lines.map(line => {
      if (!line.trim()) return line

      const dateInfo = extractDateFromTask(line)
      if (!dateInfo) return line

      const { parsed, startIndex, endIndex } = dateInfo
      
      if (parsed && parsed.confidence === 'high') {
        // Highlight the date part in blue
        const beforeDate = line.substring(0, startIndex)
        const datePart = line.substring(startIndex, endIndex)
        const afterDate = line.substring(endIndex)
        
        return `${beforeDate}<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">${datePart}</span>${afterDate}`
      } else if (parsed && parsed.isPartial) {
        // Highlight partial matches in orange
        const beforeDate = line.substring(0, startIndex)
        const datePart = line.substring(startIndex, endIndex)
        const afterDate = line.substring(endIndex)
        
        return `${beforeDate}<span class="bg-orange-100 text-orange-800 px-1 rounded font-medium">${datePart}</span>${afterDate}`
      }
      
      return line
    })

    setHighlightedText(highlightedLines.join('\n'))
  }, [value])

  const handleTextareaChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    checkForSuggestions(newValue)
  }

  const handleTextareaScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    if (!currentLineText || currentLineIndex === -1) return

    const lines = value.split('\n')
    const currentLine = lines[currentLineIndex]
    
    // Find the partial match in the current line
    const partialMatch = currentLineText.toLowerCase().trim()
    const suggestions = getDateSuggestions(partialMatch)
    const selectedSuggestion = suggestions.find(s => s.text === suggestion)
    
    if (selectedSuggestion) {
      // Replace the partial text with the full suggestion
      const updatedLine = currentLine.replace(
        new RegExp(partialMatch + '$', 'i'), 
        suggestion
      )
      
      lines[currentLineIndex] = updatedLine
      onChange(lines.join('\n'))
    }
    
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setCurrentLineIndex(-1)
    setCurrentLineText('')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex].text)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        setCurrentLineIndex(-1)
        setCurrentLineText('')
        break
      default:
        break
    }
  }

  // Calculate cursor position for suggestion dropdown
  const calculateSuggestionPosition = (lineIndex, lineText) => {
    if (!textareaRef.current) return { top: 0, left: 0 }

    const textarea = textareaRef.current
    const rect = textarea.getBoundingClientRect()
    const lineHeight = 20 // Approximate line height
    const padding = 12 // Textarea padding
    
    return {
      top: rect.top + (lineIndex * lineHeight) + lineHeight + padding,
      left: rect.left + padding
    }
  }

  // Check for suggestions when text changes
  const checkForSuggestions = (text) => {
    if (!text) {
      setShowSuggestions(false)
      return
    }

    const lines = text.split('\n')
    const cursorLine = lines.length - 1 // Assume cursor is at the last line
    
    if (cursorLine >= 0 && lines[cursorLine].trim()) {
      const lineText = lines[cursorLine].trim()
      const lineSuggestions = getDateSuggestions(lineText)
      
      if (lineSuggestions.length > 0) {
        setSuggestions(lineSuggestions)
        setShowSuggestions(true)
        setCurrentLineIndex(cursorLine)
        setCurrentLineText(lineText)
        setSuggestionPosition(calculateSuggestionPosition(cursorLine, lineText))
        setSelectedSuggestionIndex(-1)
      } else {
        setShowSuggestions(false)
        setCurrentLineIndex(-1)
        setCurrentLineText('')
      }
    } else {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative">
      {/* Highlighted overlay */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap font-mono text-sm p-3 border border-transparent ${className}`}
        style={{
          zIndex: 1,
          color: 'transparent',
          lineHeight: '1.5'
        }}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
      
      {/* Actual textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onScroll={handleTextareaScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm bg-transparent relative z-10 ${className}`}
        rows={rows}
        style={{ color: 'transparent', caretColor: '#111827' }}
      />
      
      {/* Visible text overlay */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap font-mono text-sm p-3 border border-transparent ${className}`}
        style={{
          zIndex: 2,
          lineHeight: '1.5'
        }}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
      
      {/* Suggestion dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            minWidth: '200px'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionSelect(suggestion.text)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
