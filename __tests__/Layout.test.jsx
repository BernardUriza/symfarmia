import { render, screen } from '@testing-library/react'
import RootLayout from '../app/layout'

describe('RootLayout', () => {
  const mockChildren = <div>Test Children Content</div>

  it('renders children content', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)
    expect(screen.getByText('Test Children Content')).toBeInTheDocument()
  })

  it('has correct metadata structure', () => {
    const { metadata } = require('../app/layout')
    expect(metadata.title).toBe('SYMFARMIA')
    expect(metadata.description).toBe('Intelligent platform for independent doctors')
  })

  it('renders with proper HTML structure', () => {
    const { container } = render(<RootLayout>{mockChildren}</RootLayout>)
    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
    expect(container.querySelector('body')).toBeInTheDocument()
  })

  it('applies correct styling to body', () => {
    const { container } = render(<RootLayout>{mockChildren}</RootLayout>)
    const body = container.querySelector('body')
    expect(body).toHaveStyle('background-color: #F9FAFB')
  })
})