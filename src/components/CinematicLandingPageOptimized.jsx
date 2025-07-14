import React, { Suspense, lazy } from 'react';
import { useTranslation } from '../providers/I18nProvider';
import { useMouseTracking, useOptimizedScroll } from './landing';

// Lazy load sections for better performance
const HeroSection = lazy(() => import('./landing/HeroSection'));
const ProblemSection = lazy(() => import('./landing/ProblemSection'));
const SolutionSection = lazy(() => import('./landing/SolutionSection'));
const TrustSection = lazy(() => import('./landing/TrustSection'));

// Loading component
const SectionSkeleton = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-slate-700 rounded mb-4"></div>
      <div className="h-4 w-32 bg-slate-700 rounded"></div>
    </div>
  </div>
);

const CinematicLandingPageOptimized = () => {
  const { t } = useTranslation();
  const mousePosition = useMouseTracking(100); // Throttle to 100ms
  const { textY, particleY } = useOptimizedScroll();

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden">
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection 
          t={t} 
          textY={textY} 
          particleY={particleY} 
          mousePosition={mousePosition} 
        />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ProblemSection t={t} />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <SolutionSection t={t} />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <TrustSection t={t} />
      </Suspense>
      
      {/* Placeholder for remaining sections */}
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Performance Optimized! ⚡</h2>
          <p className="text-teal-200">
            ✅ Lazy loading • ✅ Memoized components • ✅ Optimized animations
          </p>
          <p className="text-slate-400 mt-4">
            Remaining sections: Testimonials, Pricing, and CTA
          </p>
        </div>
      </div>
    </div>
  );
};

export default CinematicLandingPageOptimized;