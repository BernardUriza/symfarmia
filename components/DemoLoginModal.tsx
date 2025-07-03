'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const DemoLoginModal = ({
  isOpen,
  onClose,
  onLogin,
}: DemoLoginModalProps) => {
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [isTypingEmail, setIsTypingEmail] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const passwordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const demoEmail = 'demo@symfarmia.com';
  const demoPassword = 'demo123';

  const typewriterDelay = 80; // milliseconds between characters

  const startTypewriterEffect = useCallback(() => {
    setEmailValue('');
    setPasswordValue('');
    setIsTypingEmail(true);
    setIsTypingPassword(false);
    setIsLoading(false);
    setShowPassword(false);
    setHasStarted(true);

    // Type email first
    let emailIndex = 0;
    const typeEmail = () => {
      if (emailIndex < demoEmail.length) {
        setEmailValue(demoEmail.substring(0, emailIndex + 1));
        emailIndex++;
        emailTimeoutRef.current = setTimeout(typeEmail, typewriterDelay);
      } else {
        setIsTypingEmail(false);
        setIsTypingPassword(true);
        setShowPassword(true);
        
        // Start typing password after a brief pause
        setTimeout(() => {
          let passwordIndex = 0;
          const typePassword = () => {
            if (passwordIndex < demoPassword.length) {
              setPasswordValue(demoPassword.substring(0, passwordIndex + 1));
              passwordIndex++;
              passwordTimeoutRef.current = setTimeout(typePassword, typewriterDelay);
            } else {
              setIsTypingPassword(false);
              
              // Show loading spinner and proceed with login after a brief pause
              setTimeout(() => {
                setIsLoading(true);
                setTimeout(() => {
                  onLogin();
                }, 1500); // Loading duration
              }, 500);
            }
          };
          typePassword();
        }, 300);
      }
    };
    
    // Start typing after modal animation
    setTimeout(typeEmail, 500);
  }, [onLogin]);

  const cleanup = useCallback(() => {
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
      emailTimeoutRef.current = null;
    }
    if (passwordTimeoutRef.current) {
      clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = null;
    }
    setEmailValue('');
    setPasswordValue('');
    setIsTypingEmail(false);
    setIsTypingPassword(false);
    setIsLoading(false);
    setShowPassword(false);
    setHasStarted(false);
  }, []);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      startTypewriterEffect();
    } else if (!isOpen) {
      cleanup();
    }

    return cleanup;
  }, [isOpen, hasStarted, startTypewriterEffect, cleanup]);

  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-scale-in">
        {/* Close button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Login</h2>
          <p className="text-gray-600 text-sm">
            Watch as we automatically fill in demo credentials
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={emailValue}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
              />
              {isTypingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-0.5 h-5 bg-blue-500 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className={showPassword ? 'opacity-100' : 'opacity-30'}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={passwordValue}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
              />
              {isTypingPassword && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-0.5 h-5 bg-blue-500 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-4">
            <button
              disabled={isLoading || isTypingEmail || isTypingPassword}
              className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-200 ${
                isLoading || isTypingEmail || isTypingPassword
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : isTypingEmail || isTypingPassword ? (
                'Typing credentials...'
              ) : (
                'Login to Demo'
              )}
            </button>
          </div>
        </div>

        {/* Info message */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Demo mode provides full access with sample data
          </p>
        </div>
      </div>

      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default DemoLoginModal;