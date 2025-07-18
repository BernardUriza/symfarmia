import LandingPageStrategy from '../src/components/LandingPageStrategy'

export const dynamic = 'force-static'

interface HomePageProps {
  searchParams?: { demo?: string }
}

export default function HomePage({ searchParams }: HomePageProps) {
  const isDemo = searchParams?.demo === 'true'
  return <LandingPageStrategy isDemo={isDemo} />
}
