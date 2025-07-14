import React, { useEffect } from 'react';
import { useTranslation } from '../providers/I18nProvider';
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  TrustSection,
  TestimonialsSection,
  PricingSection,
  ContactSection,
  Footer,
  useAnimationErrorBoundary,
  monitorAnimationPerformance
} from './simple-landing';

// Import CSS animations for fallbacks
import './simple-landing/styles/animations.css';

/**
 * Enhanced Landing Page with error-safe animations and progressive enhancement
 */
const EnhancedLandingPage = () => {
  const { t } = useTranslation();
  const { shouldDisableAnimations, handleError } = useAnimationErrorBoundary();

  // Initialize performance monitoring
  useEffect(() => {
    try {
      monitorAnimationPerformance();
    } catch (error) {
      handleError(error, 'performance monitor initialization');
    }
  }, [handleError]);

  // Add global animation performance class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (shouldDisableAnimations) {
        root.classList.add('low-performance-mode');
      } else {
        root.classList.remove('low-performance-mode');
      }
    }
  }, [shouldDisableAnimations]);

  return (
    <div className="relative bg-slate-900 text-white">
      <HeroSection t={t} />
      <ProblemSection t={t} />
      <SolutionSection t={t} />
      <TrustSection t={t} />
      <TestimonialsSection t={t} />
      <PricingSection t={t} />
      <ContactSection t={t} />
      <Footer t={t} />
    </div>
  );
};

export default EnhancedLandingPage;