"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Volume2, Mic, Trash2 } from 'lucide-react';
import { TranscriptionSegment } from './TranscriptionSegment';

export function TranscriptionDisplay({
  segments,
  currentTranscript,
  isRecording,
  isTranscribing,
  onClearAll,
  t
}) {
  const hasContent = segments.length > 0 || currentTranscript || isRecording;

  return (
    <Card className="min-h-[400px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {t("conversation.capture.live_transcription")}
            {isRecording && <LiveBadge />}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {t("conversation.capture.powered_by_ai")}
            </Badge>
            
            {segments.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-8 px-2 text-xs"
                aria-label={t("common.clear")}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {t("common.clear")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <TranscriptionContent
          segments={segments}
          currentTranscript={currentTranscript}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          hasContent={hasContent}
          t={t}
        />
      </CardContent>
    </Card>
  );
}

function LiveBadge() {
  return (
    <Badge
      variant="destructive"
      className="animate-pulse text-xs px-2 py-0.5"
    >
      LIVE
    </Badge>
  );
}

function TranscriptionContent({
  segments,
  currentTranscript,
  isRecording,
  isTranscribing,
  hasContent,
  t
}) {
  return (
    <div
      className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar"
      role="log"
      aria-live="polite"
      aria-label={t("conversation.capture.medical_conversation_transcript")}
    >
      {/* Segmentos completados */}
      {segments.map((segment, index) => (
        <TranscriptionSegment
          key={segment.id}
          segment={segment}
          index={index}
        />
      ))}
      
      {/* Transcripción en vivo */}
      {currentTranscript && isRecording && (
        <LiveTranscript text={currentTranscript} />
      )}
      
      {/* Estado de procesamiento */}
      {isTranscribing && !isRecording && (
        <ProcessingStatus t={t} />
      )}
      
      {/* Estado vacío */}
      {!hasContent && (
        <EmptyState t={t} />
      )}
    </div>
  );
}

function LiveTranscript({ text }) {
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 animate-fadeIn">
      <div className="flex flex-col items-center min-w-[80px]">
        <Badge variant="outline" className="text-xs mb-1 animate-pulse">
          LIVE
        </Badge>
      </div>
      <p className="flex-1 text-slate-700 dark:text-gray-300 font-medium">
        {text}
        <span className="animate-pulse ml-1">|</span>
      </p>
    </div>
  );
}

function ProcessingStatus({ t }) {
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
      <div className="flex flex-col items-center min-w-[80px]">
        <Badge variant="secondary" className="text-xs mb-1">
          AI
        </Badge>
        <span className="text-xs text-slate-500 dark:text-gray-400">
          {t("conversation.processing.processing_status")}
        </span>
      </div>
      <p className="flex-1 text-slate-700 dark:text-gray-300">
        {t("conversation.processing.ai_processing")}
        <span className="animate-pulse ml-1">...</span>
      </p>
    </div>
  );
}

function EmptyState({ t }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <Mic className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="text-sm">{t("transcription.no_content_yet")}</p>
      <p className="text-xs mt-1 text-gray-400">
        {t("transcription.press_record_to_start")}
      </p>
    </div>
  );
}

// CSS personalizado para el scrollbar
const style = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('transcription-display-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'transcription-display-styles';
  styleSheet.textContent = style;
  document.head.appendChild(styleSheet);
}