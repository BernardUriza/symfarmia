'use client';
/**
 * CLIENT-ONLY RENDERER FOR MEDICAL HYDRATION SAFETY
 * =================================================
 *
 * 🏥 MEDICAL-GRADE HYDRATION SAFETY
 * 🛡️ PREVENTS SERVER/CLIENT MISMATCH ERRORS
 * ⚡ OPTIMIZED FOR MEDICAL WORKFLOWS
 * 🔄 AUTOMATIC FALLBACK MECHANISMS
 */

import { useMedicalHydrationSafe } from '../../src/hooks/useMedicalHydrationSafe';

/**
 * MEDICAL-GRADE CLIENT-ONLY RENDERER
 *
 * Renders children only on client-side to prevent hydration mismatches
 * Perfect for dates, user preferences, and dynamic content
 */
function ClientOnlyRenderer({
  children,
  fallback = null,
  className = '',
  style = {},
  componentName = 'ClientOnlyRenderer',
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe(componentName);

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    fallback,
  );
}

/**
 * MEDICAL-GRADE DATE RENDERER
 *
 * Specifically designed for date elements that cause hydration mismatches
 * Handles timezone differences between server and client
 */
function ClientOnlyDate({
  date,
  format = 'full',
  className = '',
  fallback = 'Cargando fecha...',
  locale = 'es-ES',
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe('ClientOnlyDate');

  const formatDate = (date, format, locale) => {
    const dateObj = new Date(date);

    const options = {
      full: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
      datetime: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    };

    return dateObj.toLocaleDateString(locale, options[format] || options.full);
  };

  return renderWhenSafe(
    <span className={className}>{formatDate(date, format, locale)}</span>,
    <span className={className} style={{ color: '#9ca3af' }}>
      {fallback}
    </span>,
  );
}

/**
 * MEDICAL-GRADE USER PREFERENCE RENDERER
 *
 * Renders user-specific content that varies between server and client
 */
function ClientOnlyUserContent({
  children,
  fallback = 'Cargando preferencias...',
  className = '',
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe('ClientOnlyUserContent');

  return renderWhenSafe(
    <div className={className}>{children}</div>,
    <div className={className} style={{ color: '#9ca3af' }}>
      {fallback}
    </div>,
  );
}

/**
 * MEDICAL-GRADE DYNAMIC CONTENT RENDERER
 *
 * For content that changes based on client-side state
 */
function ClientOnlyDynamic({
  children,
  fallback = 'Cargando contenido...',
  className = '',
  skeleton = false,
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe('ClientOnlyDynamic');

  const skeletonFallback = skeleton ? (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  ) : (
    <div className={className} style={{ color: '#9ca3af' }}>
      {fallback}
    </div>
  );

  return renderWhenSafe(
    <div className={className}>{children}</div>,
    skeletonFallback,
  );
}

export default ClientOnlyRenderer;
export { ClientOnlyDate, ClientOnlyUserContent, ClientOnlyDynamic };
