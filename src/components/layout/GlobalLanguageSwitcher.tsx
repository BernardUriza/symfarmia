/**
 * GLOBAL LANGUAGE SWITCHER
 *
 * Universal language switcher that can be integrated into any layout
 * Automatically adapts to the current page context
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  CompactLanguageSwitcher,
  FloatingLanguageSwitcher,
  MedicalLanguageSwitcher,
  FullLanguageSwitcher,
} from '../ui/LanguageSwitcher';

type PageContext = 'medical' | 'admin' | 'marketing' | 'app';
type SwitcherStyle = 'compact' | 'full' | 'medical' | 'floating';
type Position = 'header' | 'sidebar' | 'settings' | 'floating';

// 🎯 PAGE CONTEXT DETECTION
const getPageContext = (pathname: string): PageContext => {
  // Medical/clinical pages
  if (
    pathname.includes('/consultation') ||
    pathname.includes('/medical') ||
    pathname.includes('/clinical') ||
    pathname.includes('/orders') ||
    pathname.includes('/patient')
  ) {
    return 'medical';
  }

  // Admin/settings pages
  if (
    pathname.includes('/admin') ||
    pathname.includes('/settings') ||
    pathname.includes('/preferences')
  ) {
    return 'admin';
  }

  // Landing/marketing pages
  if (
    pathname === '/' ||
    pathname.includes('/landing') ||
    pathname.includes('/demo') ||
    pathname.includes('/features')
  ) {
    return 'marketing';
  }

  // Default application context
  return 'app';
};

interface GlobalLanguageSwitcherProps {
  forceStyle?: SwitcherStyle | null;
  showFloating?: boolean;
  className?: string;
  position?: Position;
}

// 🎯 GLOBAL LANGUAGE SWITCHER
const GlobalLanguageSwitcher: React.FC<GlobalLanguageSwitcherProps> = ({
  forceStyle = null,
  showFloating = true,
  className = '',
  position = 'header',
}) => {
  const pathname = usePathname();
  const [pageContext, setPageContext] = useState('app');
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // Detect page context
  useEffect(() => {
    const context = getPageContext(pathname);
    setPageContext(context);
  }, [pathname]);

  // Show floating button on scroll or when no header switcher is visible
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const headerSwitcher = document.querySelector(
        '[data-header-language-switcher]',
      );
      if (headerSwitcher) {
        const rect = headerSwitcher.getBoundingClientRect();
        const isHeaderVisible =
          rect.top >= 0 && rect.bottom <= window.innerHeight;
        setShowFloatingButton(!isHeaderVisible);
      } else {
        setShowFloatingButton(true);
      }
    };

    if (showFloating) {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (showFloating) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showFloating]);

  // Return appropriate switcher based on context and position
  const renderSwitcher = () => {
    // Force specific style if requested
    if (forceStyle) {
      switch (forceStyle) {
        case 'compact':
          return <CompactLanguageSwitcher className={className} />;
        case 'full':
          return <FullLanguageSwitcher className={className} />;
        case 'medical':
          return <MedicalLanguageSwitcher className={className} />;
        case 'floating':
          return <FloatingLanguageSwitcher className={className} />;
        default:
          return <CompactLanguageSwitcher className={className} />;
      }
    }

    // Auto-select based on context and position
    if (position === 'floating') {
      return <FloatingLanguageSwitcher className={className} />;
    }

    switch (pageContext) {
      case 'medical':
        return position === 'header' ? (
          <MedicalLanguageSwitcher className={className} style="compact" />
        ) : (
          <MedicalLanguageSwitcher className={className} style="full" />
        );

      case 'admin':
        return position === 'header' ? (
          <CompactLanguageSwitcher className={className} />
        ) : (
          <FullLanguageSwitcher className={className} />
        );

      case 'marketing':
        return <CompactLanguageSwitcher className={className} />;

      default:
        return <CompactLanguageSwitcher className={className} />;
    }
  };

  return (
    <>
      {/* Main switcher */}
      <div
        className={`${className} ${position === 'header' ? 'data-header-language-switcher' : ''}`}
        data-header-language-switcher={position === 'header'}
      >
        {renderSwitcher()}
      </div>

      {/* Floating switcher (when enabled and appropriate) */}
      {showFloating && showFloatingButton && position === 'header' && (
        <FloatingLanguageSwitcher />
      )}
    </>
  );
};

interface LanguageSwitcherProps {
  className?: string;
}

// 🎯 HEADER LANGUAGE SWITCHER
export const HeaderLanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  return (
    <GlobalLanguageSwitcher
      position="header"
      showFloating={true}
      className={className}
    />
  );
};

// 🎯 SIDEBAR LANGUAGE SWITCHER
export const SidebarLanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  return (
    <GlobalLanguageSwitcher
      position="sidebar"
      showFloating={false}
      className={className}
    />
  );
};

// 🎯 MEDICAL HEADER LANGUAGE SWITCHER
export const MedicalHeaderLanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  return (
    <GlobalLanguageSwitcher
      forceStyle="medical"
      position="header"
      showFloating={true}
      className={className}
    />
  );
};

// 🎯 SETTINGS LANGUAGE SWITCHER
export const SettingsLanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  return (
    <GlobalLanguageSwitcher
      forceStyle="full"
      position="settings"
      showFloating={false}
      className={className}
    />
  );
};

export default GlobalLanguageSwitcher;
