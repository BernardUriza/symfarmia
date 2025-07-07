// Barrel export for components
export { default as ThemeToggle } from './ThemeToggle';
export { default as DemoLoginModal } from './DemoLoginModal';
export { default as LandingPage } from './LandingPage';

// Lazy imports for heavy components
export const getLandingPage = () => import('./LandingPage').then(m => m.default);
export const getDemoLoginModal = () => import('./DemoLoginModal').then(m => m.default);