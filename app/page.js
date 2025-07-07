import nextDynamic from 'next/dynamic'
const LandingPageStrategy = nextDynamic(() => import('../src/components/LandingPageStrategy'))

export const dynamic = 'force-static'

export default function HomePage({ searchParams }) {
  const isDemo = searchParams?.demo === 'true'
  return <LandingPageStrategy isDemo={isDemo} />
}