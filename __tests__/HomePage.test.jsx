import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'
import { AppModeProvider } from '../app/providers/AppModeProvider'
import { ThemeProvider } from '../app/providers/ThemeProvider'
import { I18nProvider } from 'app/providers/I18nProvider'
import { PatientContextProvider } from '../app/providers/PatientContextProvider'

describe('HomePage', () => {
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
    expect(screen.getByText('El Futuro de la Medicina Está Aquí')).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('El Futuro de la Medicina Está Aquí')
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
    expect(screen.getByText('Libera el 70% de tu tiempo y restaura la esperanza en tu práctica médica')).toBeInTheDocument()
  })
})