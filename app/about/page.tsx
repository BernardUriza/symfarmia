"use client";
import { lazy, Suspense } from 'react';
import LandingSkeleton from '../../src/components/LandingSkeleton';

const AboutSection = lazy(() => import('../../src/components/landing/AboutSection'));

export default function AboutPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <AboutSection />
    </Suspense>
  );
}