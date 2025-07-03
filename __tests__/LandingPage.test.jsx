import { render, screen, fireEvent } from '@testing-library/react'
import LandingPage from '../src/pages/LandingPage'
import { AppModeProvider } from '../app/providers/AppModeProvider'

// Mock window.alert
window.alert = jest.fn()

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    expect(screen.getByText('Welcome to')).toBeInTheDocument()
    expect(screen.getAllByText('SYMFARMIA').length).toBeGreaterThan(0)
  })

  it('renders the subtitle', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    expect(screen.getByText('Intelligent platform for independent doctors')).toBeInTheDocument()
  })

  it('renders Login and Register buttons', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('renders Try Demo Mode button', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    expect(screen.getByRole('button', { name: /try demo mode/i })).toBeInTheDocument()
  })

  it('opens the demo modal when Try Demo Mode is clicked', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    const demoButton = screen.getByRole('button', { name: /try demo mode/i })
    fireEvent.click(demoButton)
    expect(screen.getByText('Demo Login')).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    expect(screen.getByText('Patient Management')).toBeInTheDocument()
    expect(screen.getByText('Medical Reports')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('has correct Login link href', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    const loginLink = screen.getByRole('link', { name: /login/i })
    expect(loginLink).toHaveAttribute('href', '/api/auth/login?returnTo=/legacy')
  })

  it('has correct Register link href', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    const registerLink = screen.getByRole('link', { name: /register/i })
    expect(registerLink).toHaveAttribute('href', '/api/auth/login?returnTo=/legacy')
  })

  it('renders footer copyright', () => {
    render(
      <AppModeProvider>
        <LandingPage />
      </AppModeProvider>
    )
    expect(screen.getByText(/© 2024 SYMFARMIA/)).toBeInTheDocument()
  })
})