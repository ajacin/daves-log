import { render } from '@testing-library/react'
import TimeAgo from './TImeAgo.jsx'

describe('TimeAgo Component', () => {
  test('renders without crashing', () => {
    render(<TimeAgo />)
  })

  test('renders time ago element', () => {
    const { container } = render(<TimeAgo />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
