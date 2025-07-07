"use client";
import { lazy, Suspense } from 'react';
import LandingSkeleton from '../../src/components/LandingSkeleton';

const ContactSection = lazy(() => import('../../src/components/landing/ContactSection'));

export default function ContactPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <ContactSection />
    </Suspense>
  );
}