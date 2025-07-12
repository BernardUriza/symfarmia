"use client";

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export function ErrorDisplay({ error, onDismiss, t }) {
  if (!error) return null;

  return (
    <div
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative animate-fadeIn"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <strong className="font-semibold">{t("common.error")}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded transition-colors"
          onClick={onDismiss}
          aria-label={t("common.dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}