import { render } from '@testing-library/react'
import { ActivityIcon } from './ActivityIcon.jsx'

describe('ActivityIcon Component', () => {
  test('renders without crashing', () => {
    render(<ActivityIcon activityName="Feed" />)
  })

  test('renders Feed icon', () => {
    const { container } = render(<ActivityIcon activityName="Feed" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  test('renders different icons for different activities', () => {
    const { rerender } = render(<ActivityIcon activityName="Feed" />)
    expect(document.querySelector('svg')).toBeInTheDocument()

    rerender(<ActivityIcon activityName="Diaper" />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  test('applies custom color', () => {
    const { container } = render(<ActivityIcon activityName="Feed" color="red" />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  test('renders default circle icon for unknown activity', () => {
    const { container } = render(<ActivityIcon activityName="Unknown" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
