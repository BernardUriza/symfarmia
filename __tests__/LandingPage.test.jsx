import { render, screen, fireEvent } from '@testing-library/react'
import LandingPage from '../src/pages/LandingPage'
import { ThemeProvider } from '../app/providers/ThemeProviderBulletproof'
import { I18nProvider } from 'app/providers/I18nProvider'
import { AppModeProvider } from '../app/providers/AppModeProvider'

// Mock window.alert
window.alert = jest.fn()

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('preferredLanguage', 'es')
  })

  it('renders the main heading', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByText('welcome_to')).toBeInTheDocument()
    expect(screen.getAllByText('SYMFARMIA').length).toBeGreaterThan(0)
  })

  it('renders the subtitle', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByText('tagline')).toBeInTheDocument()
  })

  it('renders Login and Register buttons', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument()
  })

  it('renders Try Demo Mode button', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: /try_demo/i })).toBeInTheDocument()
  })

  it('opens the demo modal when Try Demo Mode is clicked', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    const demoButton = screen.getByRole('button', { name: /try_demo/i })
    fireEvent.click(demoButton)
    expect(screen.getByText('demo_login')).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByText('patient_management')).toBeInTheDocument()
    expect(screen.getByText('medical_reports')).toBeInTheDocument()
    expect(screen.getByText('analytics')).toBeInTheDocument()
  })

  it('has correct Login link href', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    const loginLink = screen.getByRole('link', { name: /iniciar sesión/i })
    expect(loginLink).toHaveAttribute('href', '/api/auth/login?returnTo=/legacy')
  })

  it('has correct Register link href', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    const registerLink = screen.getByRole('link', { name: /registrarse/i })
    expect(registerLink).toHaveAttribute('href', '/api/auth/login?returnTo=/legacy')
  })

  it('renders footer copyright', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppModeProvider>
            <LandingPage />
          </AppModeProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByText(/© 2024 SYMFARMIA/)).toBeInTheDocument()
  })
})