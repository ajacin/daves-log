import { render } from '@testing-library/react'
import ActivityTime from './ActivityTime.jsx'

describe('ActivityTime Component', () => {
  test('renders without crashing', () => {
    render(<ActivityTime />)
  })
})
