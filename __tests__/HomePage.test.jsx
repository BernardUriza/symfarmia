import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'
import { AppModeProvider } from '../app/providers/AppModeProvider'
import { ThemeProvider } from '../app/providers/ThemeProvider'
import { I18nProvider } from 'app/providers/I18nProvider'
import { PatientContextProvider } from '../app/providers/PatientContextProvider'

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.setItem('preferredLanguage', 'es')
  })
  it('renders the LandingPage component', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <PatientContextProvider>
            <AppModeProvider>
              <HomePage />
            </AppModeProvider>
          </PatientContextProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByText(/Convierte consultas médicas/i)).toBeInTheDocument()
  })

  it('contains the main SYMFARMIA branding', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <PatientContextProvider>
            <AppModeProvider>
              <HomePage />
            </AppModeProvider>
          </PatientContextProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Convierte consultas médicas en reportes clínicos automáticamente')
  })

  it('displays the platform description', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <PatientContextProvider>
            <AppModeProvider>
              <HomePage />
            </AppModeProvider>
          </PatientContextProvider>
        </I18nProvider>
      </ThemeProvider>
    )
    expect(screen.getByText(/Habla durante tu consulta/i)).toBeInTheDocument()
  })
})