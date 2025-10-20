import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'

// Mock settings context
jest.mock('../lib/context/settings', () => ({
  useSettings: () => ({
    sidePanelMode: 'default'
  })
}))

describe('Navbar Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Navbar setIsDrawerOpen={() => {}} />
      </BrowserRouter>
    )
  })
})
