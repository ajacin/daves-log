import { render, screen, fireEvent } from '@testing-library/react'
import SelectBox from './SelectBox.jsx'

describe('SelectBox Component', () => {
  const defaultProps = {
    onChange: jest.fn(),
    value: 'Feed',
    options: ['Feed', 'Diaper', 'Medicine']
  }

  test('renders without crashing', () => {
    render(<SelectBox {...defaultProps} />)
  })

  test('renders all options', () => {
    render(<SelectBox {...defaultProps} />)
    expect(screen.getByText('Feed')).toBeInTheDocument()
    expect(screen.getByText('Diaper')).toBeInTheDocument()
    expect(screen.getByText('Medicine')).toBeInTheDocument()
  })

  test('highlights selected option', () => {
    render(<SelectBox {...defaultProps} value="Diaper" />)
    const diaperOption = screen.getByText('Diaper').closest('div')
    expect(diaperOption).toHaveClass('bg-purple-600')
  })

  test('calls onChange when option is clicked', () => {
    const onChange = jest.fn()
    render(<SelectBox {...defaultProps} onChange={onChange} />)
    const medicineOption = screen.getByText('Medicine').closest('div')
    fireEvent.click(medicineOption)
    expect(onChange).toHaveBeenCalled()
  })

  test('renders icons for each option', () => {
    const { container } = render(<SelectBox {...defaultProps} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
