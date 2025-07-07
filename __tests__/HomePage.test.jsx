import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'
import { AppModeProvider } from '../app/providers/AppModeProvider'
import { ThemeProvider } from '../app/providers/ThemeProviderBulletproof'
import { I18nProvider } from 'app/providers/I18nProvider'
import { PatientContextProvider } from '../app/providers/PatientContextProvider'

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.setItem('preferredLanguage', 'es')
  })
  it('renders the LandingPage component', async () => {
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
    expect(await screen.findByText(/Herramientas inteligentes para médicos modernos/i)).toBeInTheDocument()
  })

  it('contains the main SYMFARMIA branding', async () => {
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
    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Herramientas inteligentes para médicos modernos')
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
    expect(screen.getByText(/Ahorra tiempo en papeleo/i)).toBeInTheDocument()
  })
})