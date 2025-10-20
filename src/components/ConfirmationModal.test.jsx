import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationModal } from './ConfirmationModal.jsx'

describe('ConfirmationModal Component', () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    message: 'Are you sure?'
  }

  test('does not render when isOpen is false', () => {
    const { container } = render(<ConfirmationModal {...defaultProps} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={true} />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  test('displays custom title', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={true} title="Delete Item?" />)
    expect(screen.getByText('Delete Item?')).toBeInTheDocument()
  })

  test('displays message', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={true} message="This action cannot be undone" />)
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<ConfirmationModal {...defaultProps} isOpen={true} onClose={onClose} />)
    const closeButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  test('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()
    render(<ConfirmationModal {...defaultProps} isOpen={true} onConfirm={onConfirm} />)
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)
    expect(onConfirm).toHaveBeenCalled()
  })
})
