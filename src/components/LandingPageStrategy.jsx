"use client";
import React from 'react';
import dynamic from 'next/dynamic';
const CinematicLandingPage = dynamic(() => import('./CinematicLandingPage'), { ssr: false });
const MinimalistLandingPage = dynamic(() => import('./MinimalistLandingPage'), { ssr: false });

const LANDING_PAGE_TYPES = {
  CINEMATIC: 'cinematic',
  MINIMALIST: 'minimalist'
};

const LandingPageStrategy = ({ type = LANDING_PAGE_TYPES.MINIMALIST, isDemo = false }) => {
  const renderLandingPage = () => {
    switch (type) {
      case LANDING_PAGE_TYPES.CINEMATIC:
        return <CinematicLandingPage />;
      case LANDING_PAGE_TYPES.MINIMALIST:
        return <MinimalistLandingPage isDemo={isDemo} />;
      default:
        return <MinimalistLandingPage isDemo={isDemo} />;
    }
  };

  return renderLandingPage();
};

export default LandingPageStrategy;
export { LANDING_PAGE_TYPES };