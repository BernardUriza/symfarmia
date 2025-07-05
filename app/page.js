import LandingPageStrategy from '../src/components/LandingPageStrategy'

export default function HomePage({ searchParams }) {
  const isDemo = searchParams?.demo === 'true'
  return <LandingPageStrategy isDemo={isDemo} />
}