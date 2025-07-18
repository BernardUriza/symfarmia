"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import {
  MicrophoneIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
const DemoLoginModal = dynamic(() => import('./layout/DemoLoginModal'));
const AudioProcessingTest = dynamic(() => import('./medical/AudioProcessingTest'), { ssr: false });
const DemoModeBanner = dynamic(() => import('./layout/DemoModeBanner'), { ssr: false });
// Removed DashboardLanding import - redirecting to main dashboard
import { useTranslation } from '../providers/I18nProvider';
import { useAppMode } from '../providers/AppModeProvider';

const MinimalistLandingPage = ({ isDemo = false }) => {
  const { isDemoMode: contextDemo } = useAppMode();
  const isDemoMode = isDemo || contextDemo;

  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after success
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };
  
  const handleDemoClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleDemoLogin = () => {
    setIsModalOpen(false);
    console.log('handleDemoLogin: Redirecting to dashboard');
    // Set demo mode in localStorage if needed
    localStorage.setItem('demoMode', 'true');
    window.location.href = '/dashboard';
  };

  // Removed automatic redirect - let users see the landing page
  
  console.log('MinimalistLandingPage: Rendering normal landing page');


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 dark:from-background dark:via-card dark:to-primary/10 text-foreground font-sans relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-[0.03] dark:opacity-[0.02] pointer-events-none" />
      
      {/* Modern Navigation Header with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass dark:glass-dark border-b border-border animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gradient">SYMFARMIA</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-smooth hover-scale"
              >
                Dashboard
              </a>
              <button
                onClick={handleDemoClick}
                className="btn-medical btn-medical-primary text-sm"
              >
                {t('try_demo')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Mode Banner */}
      {isDemoMode && <DemoModeBanner />}

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-6 ${isDemoMode ? 'pt-48' : 'pt-32'}`}>
        
        {/* Modern Hero Section with Glassmorphism */}
        <section className="text-center mb-20 hero-section animate-fade-in">
          <div className="card-gradient glass dark:glass-dark rounded-3xl p-12 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight animate-slide-up">
              <span className="text-gradient">{t('hero_heading')}</span>
            </h1>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              {t('hero_subheading')}
            </p>

            <div className="mb-8">
            <span itemScope itemType="image/png"
                itemProp="image"> 
              <a itemProp="url" href="/banner1.png"/> 
            </span>
              <Image
                src="/banner1.png"
                alt="SYMFARMIA Medical Platform"
                width={1200}
                height={600}
                priority
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAEw2mNhQlgAATDaanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAANxNqdW1iAAAA"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          
            {/* CTA Buttons */}
            <div className="mb-12">
              {!isDemoMode && !isSubmitted ? (
                <div className="space-y-6">
                  <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu-email@ejemplo.com"
                        required
                        className="input-modern flex-1 text-base shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-medical btn-medical-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? t('cta_sending') : t('cta_save_time')}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t('beta_free')}
                    </p>
                  </form>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleDemoClick}
                      className="btn-medical btn-medical-secondary glass dark:glass-dark border-2 border-primary/30 text-primary hover:border-primary/50"
                    >
                      {t('demo_interactive')}
                    </button>
                  </div>
                </div>
              ) : isDemoMode ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="card-gradient p-8 shadow-2xl rounded-2xl border border-success/20">
                    <HeartIcon className="w-12 h-12 mx-auto mb-4 text-success animate-float" />
                    <h3 className="text-2xl font-semibold mb-2 text-foreground">
                      {t('demo_welcome')}
                    </h3>
                    <p className="text-foreground/80">
                      {t('demo_explore_features')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 animate-fade-in">
                  <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {t('contact_soon')}
                  </h3>
                  <p className="text-foreground/70">
                    {t('check_email')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modern Three Key Benefits with animations */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-float glass dark:glass-dark p-8 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-float">
                <MicrophoneIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {t('benefit_speak')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('benefit_speak_desc')}
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ArrowPathIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {t('benefit_processing')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('benefit_processing_desc')}
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {t('benefit_report')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('benefit_report_desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Process Flow Simulation */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {t('how_it_works')}
          </h2>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 dark:border-slate-700/50">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('step_consult')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t('step_consult_desc')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('step_processing')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t('step_processing_desc')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('step_report')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t('step_report_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Testimonial */}
        <section className="mb-20">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('testimonial_author')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t('testimonial_position')}</p>
              </div>
            </div>
            <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">
              {t('testimonial_quote')}
            </blockquote>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{t('testimonial_savings')}</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mb-20">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 dark:border-slate-700/50">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {t('final_cta_heading')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('final_cta_text')}
            </p>
            
            {!isSubmitted && !isDemoMode && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => document.querySelector('input[type="email"]').scrollIntoView()}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('final_cta_signup')}
                </button>
                <button
                  onClick={handleDemoClick}
                  className="bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 border-2 border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('final_cta_demo')}
                </button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Audio Processing Test Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              🎙️ {t('demo.demo_transcription_title', 'Prueba la Tecnología')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('demo.demo_transcription_subtitle', 'Experimenta la transcripción médica en tiempo real con IA')}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 p-8">
            <AudioProcessingTest />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-white/30 dark:border-slate-700/30 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {t('footer_copy')}
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer_privacy')}</a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer_terms')}</a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer_contact')}</a>
          </div>
        </div>
      </footer>
      
      {/* Demo Login Modal */}
      <DemoLoginModal isOpen={isModalOpen} onClose={handleModalClose} onLogin={handleDemoLogin} />
    </div>
  );
};

export default MinimalistLandingPage;