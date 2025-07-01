import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'

describe('HomePage', () => {
  it('renders the LandingPage component', () => {
    render(<HomePage />)
    expect(screen.getByText('Welcome to')).toBeInTheDocument()
    expect(screen.getByText('SYMFARMIA')).toBeInTheDocument()
  })

  it('contains the main SYMFARMIA branding', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to SYMFARMIA')
  })

  it('displays the platform description', () => {
    render(<HomePage />)
    expect(screen.getByText('Intelligent platform for independent doctors')).toBeInTheDocument()
  })
})