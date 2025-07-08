/**
 * Shared UI Components Library
 * 
 * Medical-focused design system components
 */

// Themes
export { medicalTheme, getMedicalColor, getSemanticColor, getSpecialtyColor, getUrgencyColor, getConfidenceColor } from './themes/medical.theme';

// Atoms
export { Button, type ButtonProps } from './atoms/Button';
export { Badge, type BadgeProps } from './atoms/Badge';

// Molecules
// export { FormField, type FormFieldProps } from './molecules/FormField';
// export { SearchBar, type SearchBarProps } from './molecules/SearchBar';
// export { DataTable, type DataTableProps } from './molecules/DataTable';
// export { NotificationToast, type NotificationToastProps } from './molecules/NotificationToast';

// Organisms
// export { NavigationBar, type NavigationBarProps } from './organisms/NavigationBar';
// export { Sidebar, type SidebarProps } from './organisms/Sidebar';
// export { Footer, type FooterProps } from './organisms/Footer';
// export { ErrorBoundary, type ErrorBoundaryProps } from './organisms/ErrorBoundary';

// Templates
// export { DashboardLayout, type DashboardLayoutProps } from './templates/DashboardLayout';
// export { ConsultationLayout, type ConsultationLayoutProps } from './templates/ConsultationLayout';
// export { LandingPageLayout, type LandingPageLayoutProps } from './templates/LandingPageLayout';

// Re-export for convenience
export * from './themes/medical.theme';