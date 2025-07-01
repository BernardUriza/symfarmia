import { render, screen, fireEvent } from '@testing-library/react'
import LandingPage from '../src/pages/LandingPage'

// Mock window.alert
window.alert = jest.fn()

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(<LandingPage />)
    expect(screen.getByText('Welcome to')).toBeInTheDocument()
    expect(screen.getByText('SYMFARMIA')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<LandingPage />)
    expect(screen.getByText('Intelligent platform for independent doctors')).toBeInTheDocument()
  })

  it('renders Login and Register buttons', () => {
    render(<LandingPage />)
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('renders Explore Without Account button', () => {
    render(<LandingPage />)
    expect(screen.getByRole('button', { name: /explore without account/i })).toBeInTheDocument()
  })

  it('shows alert when Explore Without Account is clicked', () => {
    render(<LandingPage />)
    const exploreButton = screen.getByRole('button', { name: /explore without account/i })
    fireEvent.click(exploreButton)
    expect(window.alert).toHaveBeenCalledWith('Demo functionality coming soon!')
  })

  it('renders feature cards', () => {
    render(<LandingPage />)
    expect(screen.getByText('Patient Management')).toBeInTheDocument()
    expect(screen.getByText('Medical Reports')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('has correct Login link href', () => {
    render(<LandingPage />)
    const loginLink = screen.getByRole('link', { name: /login/i })
    expect(loginLink).toHaveAttribute('href', '/api/auth/login?returnTo=/legacy')
  })

  it('has correct Register link href', () => {
    render(<LandingPage />)
    const registerLink = screen.getByRole('link', { name: /register/i })
    expect(registerLink).toHaveAttribute('href', '/api/auth/login?returnTo=/legacy')
  })

  it('renders footer copyright', () => {
    render(<LandingPage />)
    expect(screen.getByText(/© 2024 SYMFARMIA/)).toBeInTheDocument()
  })
})