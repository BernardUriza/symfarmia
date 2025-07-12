"use client";

import React from 'react';
import { Button } from '../../ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export function NavigationControls({ onNext, onPrevious, showPrevious = false, t }) {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
      {showPrevious ? (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
          aria-label={t("common.previous")}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common.previous")}
        </Button>
      ) : (
        <div />
      )}
      
      <Button
        onClick={onNext}
        className="flex items-center gap-2"
        aria-label={t("conversation.capture.review_dialog_flow")}
      >
        {t("conversation.capture.review_dialog_flow")}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}