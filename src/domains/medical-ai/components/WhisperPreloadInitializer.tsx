'use client';

import { useEffect, useRef } from 'react';
import { useWhisperPreload } from '../hooks/useWhisperPreload';
import Swal from 'sweetalert2';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface WhisperPreloadInitializerProps {
  priority?: 'high' | 'low' | 'auto';
  delay?: number;
  showProgress?: boolean;
  showToasts?: boolean;
}

export function WhisperPreloadInitializer({ 
  priority = 'auto',
  delay = 3000,
  showProgress = true,
  showToasts = true
}: WhisperPreloadInitializerProps) {
  const { t } = useI18n();
  const { status, progress, isLoading, isLoaded, isFailed, error } = useWhisperPreload({
    autoInit: true,
    priority,
    delay,
  });
  
  const toastRef = useRef<any>(null);
  const hasShownSuccess = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WhisperPreload] Status: ${status}, Progress: ${progress}%`);
    }
  }, [status, progress]);

  // Show loading toast
  useEffect(() => {
    if (!showToasts) return;

    if (isLoading && !toastRef.current) {
      toastRef.current = Swal.fire({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: undefined,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        html: `
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-semibold">${progress}%</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="font-medium text-sm">${t('conversation.capture.loading_ai')}</p>
              <p class="text-xs text-gray-500">${t('conversation.capture.whisper_ai')} ${progress}%</p>
            </div>
          </div>
        `,
        customClass: {
          popup: 'bg-white dark:bg-gray-800 shadow-lg',
          htmlContainer: 'text-gray-900 dark:text-gray-100'
        },
        backdrop: false,
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });
    }

    // Update progress in existing toast
    if (isLoading && toastRef.current && progress > 0) {
      const progressElement = toastRef.current.popup.querySelector('.text-xs.font-semibold');
      const progressText = toastRef.current.popup.querySelector('.text-xs.text-gray-500');
      if (progressElement) progressElement.textContent = `${progress}%`;
      if (progressText) progressText.textContent = `${t('conversation.capture.whisper_ai')} ${progress}%`;
    }
  }, [isLoading, progress, showToasts, t]);

  // Show success toast
  useEffect(() => {
    if (!showToasts) return;

    if (isLoaded && !hasShownSuccess.current) {
      hasShownSuccess.current = true;
      
      // Close loading toast
      if (toastRef.current) {
        Swal.close();
        toastRef.current = null;
      }

      // Show success toast
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: t('conversation.capture.ai_ready'),
        text: t('conversation.capture.ai_loaded_successfully'),
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-white dark:bg-gray-800 shadow-lg',
          title: 'text-gray-900 dark:text-gray-100',
          htmlContainer: 'text-gray-700 dark:text-gray-300'
        },
        backdrop: false,
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });
    }
  }, [isLoaded, showToasts, t]);

  // Show error toast
  useEffect(() => {
    if (!showToasts) return;

    if (isFailed && error) {
      // Close loading toast
      if (toastRef.current) {
        Swal.close();
        toastRef.current = null;
      }

      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: t('conversation.capture.error_loading_ai'),
        text: t('conversation.capture.could_not_load_whisper'),
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-white dark:bg-gray-800 shadow-lg',
          title: 'text-gray-900 dark:text-gray-100',
          htmlContainer: 'text-gray-700 dark:text-gray-300'
        },
        backdrop: false
      });
    }
  }, [isFailed, error, showToasts, t]);

  // Optional inline progress indicator (original style)
  if (showProgress && !showToasts && isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span>{t('conversation.capture.preparing_ai')}... {progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}