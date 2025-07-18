"use client";
import { lazy, Suspense } from 'react';
import LandingSkeleton from '../../src/components/LandingSkeleton';

const DemoSection = lazy(() => import('../../src/components/landing/DemoSection'));

export default function DemoPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <DemoSection />
    </Suspense>
  );
}