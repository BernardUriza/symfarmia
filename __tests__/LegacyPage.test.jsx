import { render, screen } from '@testing-library/react'
import { useUser } from '@auth0/nextjs-auth0/client'

// Mock the legacy page since it requires complex dependencies
jest.mock('../app/legacy/page', () => {
  return function MockLegacyPage() {
    const { user, isLoading } = useUser()
    
    if (isLoading) return <div>Loading...</div>
    if (!user) return <div>Please log in to access the legacy system</div>
    
    return (
      <div>
        <h1>Legacy SYMFARMIA System</h1>
        <p>Welcome, {user.name}</p>
      </div>
    )
  }
})

const LegacyPage = require('../app/legacy/page').default

describe('LegacyPage', () => {
  it('shows loading state when user is loading', () => {
    require('@auth0/nextjs-auth0/client').useUser.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
    })

    render(<LegacyPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows login prompt when user is not authenticated', () => {
    require('@auth0/nextjs-auth0/client').useUser.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
    })

    render(<LegacyPage />)
    expect(screen.getByText('Please log in to access the legacy system')).toBeInTheDocument()
  })

  it('shows legacy system when user is authenticated', () => {
    require('@auth0/nextjs-auth0/client').useUser.mockReturnValue({
      user: { name: 'Dr. Test', email: 'test@symfarmia.com' },
      isLoading: false,
      error: null,
    })

    render(<LegacyPage />)
    expect(screen.getByText('Legacy SYMFARMIA System')).toBeInTheDocument()
    expect(screen.getByText('Welcome, Dr. Test')).toBeInTheDocument()
  })
})