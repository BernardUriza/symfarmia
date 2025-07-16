'use client';
import React, { memo } from 'react';
import { ConversationCapture } from './ConversationCapture';

interface ConversationCaptureWrapperProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  className?: string;
}

// Memoize the component to prevent unnecessary re-renders
export const ConversationCaptureWrapper = memo(({ 
  onNext, 
  onTranscriptionComplete,
  className 
}: ConversationCaptureWrapperProps) => {
  console.log('[ConversationCaptureWrapper] Rendering once');
  
  return (
    <ConversationCapture
      onNext={onNext}
      onTranscriptionComplete={onTranscriptionComplete}
      className={className}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if props actually change
  return (
    prevProps.onNext === nextProps.onNext &&
    prevProps.onTranscriptionComplete === nextProps.onTranscriptionComplete &&
    prevProps.className === nextProps.className
  );
});

ConversationCaptureWrapper.displayName = 'ConversationCaptureWrapper';