import React from 'react';
import Logo from '../atoms/Logo';
import Button from '../atoms/Button';
import { Heading, Text } from '../atoms/Typography';
import LanguageToggle from '../../../components/LanguageToggle';
import AnimatedWrapper from '../atoms/AnimatedWrapper';
import SafeParticles from '../atoms/SafeParticles';
import { useScrollTransforms } from '../hooks/useAnimations';

const HeroSection = ({ t }) => {
  const { particleY } = useScrollTransforms();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-600 text-white overflow-hidden">
      {/* Floating Particles */}
      <AnimatedWrapper
        animation="fadeIn"
        delay={0.5}
        style={{ transform: `translateY(${particleY}px)` }}
        className="absolute inset-0"
      >
        <SafeParticles count={20} intensity="low" />
      </AnimatedWrapper>

      {/* Header */}
      <AnimatedWrapper animation="slideDown" delay={0.2}>
        <header className="flex justify-between items-center p-6 relative z-20">
          <Logo size="medium" variant="white" />
          <LanguageToggle variant="prominent" />
        </header>
      </AnimatedWrapper>

      {/* Hero Content */}
      <div className="flex items-center justify-center min-h-[80vh] px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <AnimatedWrapper animation="slideUp" delay={0.5}>
            <Heading level={1} color="white" align="center" className="mb-6">
              {t('hero_title')}
            </Heading>
          </AnimatedWrapper>

          <AnimatedWrapper animation="slideUp" delay={0.7}>
            <Text
              size="xl"
              color="light"
              className="mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              {t('hero_subtitle')}
            </Text>
          </AnimatedWrapper>

          <AnimatedWrapper animation="slideUp" delay={0.9}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button size="large" className="bg-teal-500 hover:bg-teal-600">
                {t('hero_cta')}
              </Button>

              <div className="flex items-center text-teal-200">
                <div className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></div>
                <Text size="sm" color="light">
                  {t('journey_progress')}
                </Text>
              </div>
            </div>
          </AnimatedWrapper>

          {/* Scroll Indicator */}
          <AnimatedWrapper animation="fadeIn" delay={1.2}>
            <div className="text-center text-teal-300">
              <div className="w-px h-8 bg-teal-300 mx-auto mb-2"></div>
              <Text size="sm">Scroll para continuar</Text>
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
