'use client';

import React, { useEffect, useState } from 'react';
import { BaseComponentProps } from '@/types';
import { logComponent } from '@/utils/logger';
import DemoLoginModal from '../DemoLoginModal';

interface LandingPageProps extends BaseComponentProps {
  showDemo?: boolean;
  onDemoClick?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

/**
 * Landing page component for SYMFARMIA application
 * Provides authentication entry point and feature overview
 * @param props - Component props including demo mode and callback handlers
 */
const LandingPage: React.FC<LandingPageProps> = ({
  className = '',
  showDemo = true,
  onDemoClick,
  onLoginClick,
  onRegisterClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    logComponent({
      componentName: 'LandingPage',
      props: { showDemo },
    });
  }, [showDemo]);

  const handleDemoClick = () => {
    if (onDemoClick) {
      onDemoClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDemoLogin = () => {
    setIsModalOpen(false);
    window.location.href = '?demo=true';
  };

  const handleLoginClick = () => {
    onLoginClick?.() || (window.location.href = '/api/auth/login?returnTo=/legacy');
  };

  const handleRegisterClick = () => {
    onRegisterClick?.() || (window.location.href = '/api/auth/login?returnTo=/legacy');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col ${className}`}>
      <header className="w-full px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            SYMFARMIA
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">SYMFARMIA</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Intelligent platform for independent doctors
            </p>
            {showDemo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Try SYMFARMIA in demo mode</strong> — no account required! 
                  Explore all features with sample data to see how it can transform your medical practice.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Login to SYMFARMIA"
            >
              Login
            </button>
            <button
              onClick={handleRegisterClick}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Register for SYMFARMIA"
            >
              Register
            </button>
            {showDemo && (
              <button
                onClick={handleDemoClick}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-lg transition duration-200 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Try SYMFARMIA in demo mode"
              >
                Try Demo Mode
              </button>
            )}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
              iconBgColor="bg-blue-100"
              title="Patient Management"
              description="Complete patient profiles and medical history tracking"
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconBgColor="bg-green-100"
              title="Medical Reports"
              description="Digital diagnosis tracking and documentation"
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              }
              iconBgColor="bg-purple-100"
              title="Analytics"
              description="Intelligent insights for medical practice"
            />
          </div>
        </div>
      </main>

      <footer className="w-full px-6 py-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 SYMFARMIA. Intelligent platform for independent doctors.</p>
        </div>
      </footer>

      {/* Demo Login Modal */}
      <DemoLoginModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onLogin={handleDemoLogin}
      />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  iconBgColor,
  title,
  description,
}) => (
  <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
    <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default LandingPage;