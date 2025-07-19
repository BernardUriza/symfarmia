import { ReactNode, HTMLAttributes, CSSProperties } from 'react';

// Alert Component Types
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface ConfirmAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: ReactNode;
}

export interface LoadingAlertProps {
  isOpen: boolean;
  message?: string;
  progress?: number;
  variant?: 'primary' | 'secondary';
}

// UI Atom Types
export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  ripple?: boolean;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  transform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  gutterBottom?: boolean;
  noWrap?: boolean;
  component?: keyof JSX.IntrinsicElements;
}

// Layout Component Types
export interface DemoModeBannerProps {
  onClose?: () => void;
  position?: 'top' | 'bottom';
  variant?: 'warning' | 'info';
}

export interface GlobalLanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'buttons' | 'menu';
}

export interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  confirmLogout?: boolean;
  redirectUrl?: string;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: Error) => void;
}

export interface VersionInfoProps {
  showFullVersion?: boolean;
  position?: 'fixed' | 'static';
  className?: string;
}

// Medical Domain Component Types
export interface MedicalReportCardProps {
  report: {
    id: number;
    name: string;
    status: string;
    diagnosis: string | null;
    date: Date | string;
    expirationDate: Date | string | null;
    patient?: {
      name: string;
      email: string;
    };
    studies?: Array<{
      id: number;
      name: string;
      title: string;
    }>;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface PatientQuickSearchProps {
  onPatientSelect: (patient: { id: number; name: string; email: string }) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
  minSearchLength?: number;
  debounceMs?: number;
}

export interface ReportStatusBadgeProps {
  status: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'ghost';
  className?: string;
}

// Provider Types
export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
}

export interface PatientContextProviderProps {
  children: ReactNode;
  initialPatient?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: string;
  fallbackLocale?: string;
  messages?: Record<string, Record<string, string>>;
}

// Landing Page Component Types
export interface ParticleFieldProps {
  particleCount?: number;
  color?: string;
  connectDistance?: number;
  speed?: number;
  interactive?: boolean;
  className?: string;
}

export interface SectionCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  highlight?: boolean;
}

// Animation Types
export interface AnimatedWrapperProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  duration?: number;
  delay?: number;
  triggerOnce?: boolean;
  threshold?: number;
  className?: string;
}

// Hook Types
export interface UseAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export interface UseMouseTrackingResult {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  isHovering: boolean;
}

// Common Props Types
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children?: ReactNode;
}

export interface WithStyle {
  style?: CSSProperties;
}

export interface WithRef<T = HTMLElement> {
  ref?: React.Ref<T>;
}

// Utility Component Types
export type PropsWithClassName<P = {}> = P & WithClassName;
export type PropsWithChildren<P = {}> = P & WithChildren;
export type PropsWithStyle<P = {}> = P & WithStyle;
export type PropsWithRef<P = {}, T = HTMLElement> = P & WithRef<T>;

// Feature Card Types
export interface FeatureCardProps extends CardProps {
  icon: ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Error Boundary Types
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: React.ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}