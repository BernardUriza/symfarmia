import dynamicComponent from 'next/dynamic'
const LandingPageStrategy = dynamicComponent(() => import('../src/components/LandingPageStrategy'))

export const dynamic = 'force-static'

export default function HomePage({ searchParams }) {
  const isDemo = searchParams?.demo === 'true'
  return <LandingPageStrategy isDemo={isDemo} />
}