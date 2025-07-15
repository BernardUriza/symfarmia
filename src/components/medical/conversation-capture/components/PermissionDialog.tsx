'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2">
          {t('conversation.capture.permission_title')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('conversation.capture.permission_message')}
        </p>
        <Button 
          onClick={onClose} 
          variant="default"
          size="md"
        >
          {t('conversation.capture.close')}
        </Button>
      </div>
    </div>
  );
};