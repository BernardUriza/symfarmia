/**
 * Confirmation hook for user interactions
 * Provides a Promise-based confirmation dialog system
 */

import { useState, useCallback } from 'react';
import { ConfirmationState } from '@/types';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface UseConfirmationReturn {
  confirm: (options: ConfirmationOptions | string) => Promise<void>;
  confirmation: ConfirmationState | null;
  isOpen: boolean;
  closeConfirmation: () => void;
}

export function useConfirmation(): UseConfirmationReturn {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const confirm = useCallback((options: ConfirmationOptions | string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const confirmationOptions: ConfirmationOptions = 
        typeof options === 'string' 
          ? { message: options }
          : options;

      setConfirmation({
        isOpen: true,
        title: confirmationOptions.title || 'Confirm Action',
        message: confirmationOptions.message,
        confirmText: confirmationOptions.confirmText || 'Confirm',
        cancelText: confirmationOptions.cancelText || 'Cancel',
        variant: confirmationOptions.variant || 'info',
        onConfirm: () => {
          resolve();
          setConfirmation(null);
        },
        onCancel: () => {
          reject(new Error('User cancelled'));
          setConfirmation(null);
        },
      });
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  return {
    confirm,
    confirmation,
    isOpen: confirmation?.isOpen ?? false,
    closeConfirmation,
  };
}