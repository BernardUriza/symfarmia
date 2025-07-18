'use client';
import { useMedicalHydrationSafe } from '@/domains/ui'; /** * HYDRATION-SAFE DATE DISPLAY COMPONENT * * Prevents server/client date mismatches by only rendering dates after hydration */
const HydrationSafeDateDisplay = ({
  locale = 'es-ES',
  showTime = false,
  dateOptions = {},
  timeOptions = {},
  className = '',
  fallback = 'Cargando fecha...',
}) => {
  const { renderWhenSafe } = useMedicalHydrationSafe('DateDisplay');

  const dateDisplayFallback = (
    <div className={`text-sm text-gray-500 ${className}`}> {fallback} </div>
  );

  const dateContent = () => {
    const now = new Date();

    const defaultDateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...dateOptions,
    };
    const defaultTimeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...timeOptions,
    };
    return (
      <div className={className}>
        {' '}
        <div className="text-sm text-gray-900 font-medium">
          {' '}
          {now.toLocaleDateString(locale, defaultDateOptions)}{' '}
        </div>{' '}
        {showTime && (
          <div className="text-xs text-gray-500 ">
            {' '}
            {now.toLocaleTimeString(locale, defaultTimeOptions)}{' '}
          </div>
        )}{' '}
      </div>
    );
  };
  return renderWhenSafe(dateContent(), dateDisplayFallback);
};

export default HydrationSafeDateDisplay;
