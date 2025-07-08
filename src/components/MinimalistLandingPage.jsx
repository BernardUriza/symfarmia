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
import LanguageToggle from '../../components/LanguageToggle';
import dynamic from 'next/dynamic';
const DemoLoginModal = dynamic(() => import('../../components/DemoLoginModal'));
const DashboardLanding = dynamic(() => import('./DashboardLanding'));
import { useTranslation } from '../../app/providers/I18nProvider';
import { useAppMode } from '../../app/providers/AppModeProvider';

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
    console.log('handleDemoLogin: Redirecting to demo mode');
    window.location.href = window.location.pathname + '?demo=true';
  };

  // If in demo mode, render the dashboard instead
  if (isDemoMode) {
    console.log('MinimalistLandingPage: Rendering DashboardLanding');
    return <DashboardLanding />;
  }
  
  console.log('MinimalistLandingPage: Rendering normal landing page');


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="fixed top-0 right-0 p-6 z-50">
        <LanguageToggle variant="minimal" />
      </header>
      
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <span role="img" aria-label="demo">🧪</span>
          <span className="demo-text">{t('demo_mode_active')}</span>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-6 ${isDemoMode ? 'pt-32' : 'pt-20'}`}>
        
        {/* Hero Section */}
        <section className="text-center mb-20 hero-section">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 dark:border-slate-700/50">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
              {t('hero_heading')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero_subheading')}
            </p>

            <div className="mb-8">
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
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
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
                      className="bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 border-2 border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                    >
                      {t('demo_interactive')}
                    </button>
                  </div>
                </div>
              ) : isDemoMode ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg">
                    <HeartIcon className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">
                      {t('demo_welcome')}
                    </h3>
                    <p className="text-green-100">
                      {t('demo_explore_features')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {t('contact_soon')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('check_email')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Three Key Benefits */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MicrophoneIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
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
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-lg">
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