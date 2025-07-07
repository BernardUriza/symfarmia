"use client";
import { lazy, Suspense } from 'react';
import LandingSkeleton from '../../src/components/LandingSkeleton';

const FeaturesSection = lazy(() => import('../../src/components/landing/FeaturesSection'));

export default function FeaturesPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <FeaturesSection />
    </Suspense>
  );
}