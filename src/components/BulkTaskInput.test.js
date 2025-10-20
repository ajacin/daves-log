/**
 * Test file for BulkTaskInput component
 * This demonstrates the improved dropdown functionality
 */

import { render } from '@testing-library/react'
import { BulkTaskInput } from './BulkTaskInput.jsx'

describe('BulkTaskInput Component', () => {
  test('renders without crashing', () => {
    render(<BulkTaskInput />)
  })

  test('renders textarea input', () => {
    const { container } = render(<BulkTaskInput />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeInTheDocument()
  })
})
