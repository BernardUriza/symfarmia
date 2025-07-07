import { lazy, Suspense } from 'react'
const LandingPageStrategy = lazy(() => import('../src/components/LandingPageStrategy'))
import LandingSkeleton from '../src/components/LandingSkeleton'

export const dynamic = 'force-static'

export default function HomePage({ searchParams }) {
  const isDemo = searchParams?.demo === 'true'
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <LandingPageStrategy isDemo={isDemo} />
    </Suspense>
  )
}