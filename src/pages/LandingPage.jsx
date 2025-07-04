"use client"
import React, { useState } from 'react';
import SmokeTest from '../components/SmokeTest';
import Logger from '../utils/logger';
import DemoLoginModal from '../../components/DemoLoginModal';
import PatientManagementPreview from '../components/PatientManagementPreview';
import MedicalReportsPreview from '../components/MedicalReportsPreview';
import { AppModeProvider, useAppMode } from '../../app/providers/AppModeProvider';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import { I18nProvider, useTranslation } from '../../app/providers/I18nProvider';

const LandingPageContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPatientPreviewOpen, setIsPatientPreviewOpen] = useState(false);
  const [isMedicalReportsPreviewOpen, setIsMedicalReportsPreviewOpen] = useState(false);
  const { isDemoMode } = useAppMode();
  const { t } = useTranslation();

  React.useEffect(() => {
    Logger.component('LandingPage', { timestamp: new Date().toISOString() })
  }, [])

  const handleDemoClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleDemoLogin = () => {
    setIsModalOpen(false);
    window.location.href = '?demo=true';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="w-full px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">SYMFARMIA</div>
          <div className="flex gap-4">
            <ThemeToggle className="text-blue-600 dark:text-blue-400" />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{t('welcome_to')} <span className="text-blue-600">SYMFARMIA</span></h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t('tagline')}</p>
            {!isDemoMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-blue-800 text-sm"><strong>{t('demo_prompt')}</strong> — {t('demo_desc')}</p>
              </div>
            )}
            {isDemoMode && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('welcome_demo_title')}</h3>
                <p className="text-gray-700 text-lg">{t('welcome_demo_sub')}</p>
              </div>
            )}
          </div>

          {!isDemoMode && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/api/auth/login?returnTo=/legacy" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl">{t('login')}</a>
              <a href="/api/auth/login?returnTo=/legacy" className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl">{t('register')}</a>
              <button onClick={handleDemoClick} className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-8 rounded-lg transition duration-200 border-2 border-gray-300 dark:border-gray-600 inline-block">{t('try_demo')}</button>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div onClick={() => setIsPatientPreviewOpen(true)} className={`p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${isDemoMode ? 'animate-pulse border-2 border-blue-200 dark:border-blue-400' : ''}`}>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('patient_management')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('patient_management_desc')}</p>
              {isDemoMode && <div className="mt-3 text-xs text-blue-600 font-medium">{t('click_for_demo')}</div>}
            </div>

            <div onClick={() => setIsMedicalReportsPreviewOpen(true)} className={`p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${isDemoMode ? 'animate-pulse border-2 border-green-200 dark:border-green-400' : ''}`}>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical_reports')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('medical_reports_desc')}</p>
              {isDemoMode && <div className="mt-3 text-xs text-green-600 font-medium">{t('click_for_demo')}</div>}
            </div>

            <div onClick={() => window.location.href = '/analytics'} className={`p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${isDemoMode ? 'animate-pulse border-2 border-purple-200 dark:border-purple-400' : ''}`}>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('analytics')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('analytics_desc')}</p>
              {isDemoMode && <div className="mt-3 text-xs text-purple-600 font-medium">{t('click_for_demo')}</div>}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 SYMFARMIA. {t('copyright')}</p>
        </div>
      </footer>

      <DemoLoginModal isOpen={isModalOpen} onClose={handleModalClose} onLogin={handleDemoLogin} />
      <PatientManagementPreview isOpen={isPatientPreviewOpen} onClose={() => setIsPatientPreviewOpen(false)} />
      <MedicalReportsPreview isOpen={isMedicalReportsPreviewOpen} onClose={() => setIsMedicalReportsPreviewOpen(false)} />
      <SmokeTest />
    </div>
  );
};

const LandingPage = () => (
  <I18nProvider>
    <AppModeProvider>
      <LandingPageContent />
    </AppModeProvider>
  </I18nProvider>
);

export default LandingPage;
