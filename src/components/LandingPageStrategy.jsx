"use client";
import React from 'react';
import dynamic from 'next/dynamic';
const MinimalistLandingPage = dynamic(() => import('./MinimalistLandingPage'), { ssr: false });

const LANDING_PAGE_TYPES = {
  MINIMALIST: 'minimalist'
};

const LandingPageStrategy = ({ isDemo = false }) => {
  return <MinimalistLandingPage isDemo={isDemo} />;
};

export default LandingPageStrategy;
export { LANDING_PAGE_TYPES };