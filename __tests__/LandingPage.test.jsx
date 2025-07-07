import { render, screen, fireEvent } from '@testing-library/react'
import LandingPage from '../src/pages/LandingPage'
import { ThemeProvider } from '../app/providers/ThemeProvider'
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
    expect(screen.getByText('Bienvenido a')).toBeInTheDocument()
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
    expect(screen.getByText('Administra expedientes, reportes y analíticas desde un solo lugar')).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: /probar modo demo/i })).toBeInTheDocument()
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
    const demoButton = screen.getByRole('button', { name: /probar modo demo/i })
    fireEvent.click(demoButton)
    expect(screen.getByText('Acceso al Demo')).toBeInTheDocument()
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
    expect(screen.getByText('Gestión de Pacientes')).toBeInTheDocument()
    expect(screen.getByText('Reportes Médicos')).toBeInTheDocument()
    expect(screen.getByText('Analíticas')).toBeInTheDocument()
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