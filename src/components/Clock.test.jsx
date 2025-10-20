import { render } from '@testing-library/react'
import Clock from './Clock.jsx'

describe('Clock Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders without crashing', () => {
    render(<Clock />)
  })

  test('displays current time in h1 element', () => {
    const { container } = render(<Clock />)
    const heading = container.querySelector('h1')
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toBeTruthy()
  })

  test('time string is in valid format', () => {
    const { container } = render(<Clock />)
    const heading = container.querySelector('h1')
    const timeText = heading.textContent
    expect(timeText).toMatch(/\d+:\d+:\d+/)
  })
})
