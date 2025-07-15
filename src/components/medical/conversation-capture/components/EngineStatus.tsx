'use client';

import React from 'react';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface EngineStatusProps {
  status: string;
}

export const EngineStatus: React.FC<EngineStatusProps> = ({ status }) => {
  const { t } = useI18n();

  const getStatusConfig = () => {
    switch (status) {
      case 'ready':
        return {
          classes: 'bg-green-50 border border-green-200 text-green-700',
          text: `${t('conversation.capture.engine_ready')} ✅`
        };
      case 'loading':
        return {
          classes: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
          text: t('conversation.capture.engine_loading') + '...'
        };
      case 'error':
        return {
          classes: 'bg-red-50 border border-red-200 text-red-700',
          text: `${t('conversation.capture.engine_error')} ❌`
        };
      case 'fallback':
        return {
          classes: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
          text: t('conversation.capture.engine_fallback')
        };
      default:
        return {
          classes: 'bg-gray-50 border border-gray-200 text-gray-700',
          text: status
        };
    }
  };

  const { classes, text } = getStatusConfig();

  return (
    <div className={`px-4 py-3 rounded ${classes}`}>
      <span className="text-sm">
        {t('conversation.capture.engine_status')}: {text}
      </span>
    </div>
  );
};