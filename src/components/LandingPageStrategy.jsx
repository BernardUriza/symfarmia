import React from 'react';
import CinematicLandingPage from './CinematicLandingPage';
import MinimalistLandingPage from './MinimalistLandingPage';

const LANDING_PAGE_TYPES = {
  CINEMATIC: 'cinematic',
  MINIMALIST: 'minimalist'
};

const LandingPageStrategy = ({ type = LANDING_PAGE_TYPES.MINIMALIST }) => {
  const renderLandingPage = () => {
    switch (type) {
      case LANDING_PAGE_TYPES.CINEMATIC:
        return <CinematicLandingPage />;
      case LANDING_PAGE_TYPES.MINIMALIST:
        return <MinimalistLandingPage />;
      default:
        return <MinimalistLandingPage />;
    }
  };

  return renderLandingPage();
};

export default LandingPageStrategy;
export { LANDING_PAGE_TYPES };