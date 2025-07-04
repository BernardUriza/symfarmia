import React from 'react';
import { useTranslation } from '../../app/providers/I18nProvider';
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  TrustSection,
  TestimonialsSection,
  PricingSection,
  ContactSection,
  Footer
} from './simple-landing';

const SimpleLandingPage = () => {
  const { t } = useTranslation();

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

export default SimpleLandingPage;