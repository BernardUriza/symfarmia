import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'
import { AppModeProvider } from '../app/providers/AppModeProvider'

describe('HomePage', () => {
  it('renders the LandingPage component', () => {
    render(
      <AppModeProvider>
        <HomePage />
      </AppModeProvider>
    )
    expect(screen.getByText('Welcome to')).toBeInTheDocument()
    expect(screen.getAllByText('SYMFARMIA').length).toBeGreaterThan(0)
  })

  it('contains the main SYMFARMIA branding', () => {
    render(
      <AppModeProvider>
        <HomePage />
      </AppModeProvider>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to SYMFARMIA')
  })

  it('displays the platform description', () => {
    render(
      <AppModeProvider>
        <HomePage />
      </AppModeProvider>
    )
    expect(screen.getByText('Intelligent platform for independent doctors')).toBeInTheDocument()
  })
})