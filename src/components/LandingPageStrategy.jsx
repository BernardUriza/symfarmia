'use client';
import React from 'react';
import dynamic from 'next/dynamic';
const MinimalistLandingPage = dynamic(() => import('./MinimalistLandingPage'), {
  ssr: false,
});

const LandingPageStrategy = ({ isDemo = false }) => {
  return <MinimalistLandingPage isDemo={isDemo} />;
};

export default LandingPageStrategy;
