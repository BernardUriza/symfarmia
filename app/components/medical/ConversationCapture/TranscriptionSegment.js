"use client";

import React from 'react';
import { Badge } from '../../ui/badge';
import { formatTimestamp } from './utils';
import { SPEAKER_TYPES } from './constants';

export function TranscriptionSegment({ segment, index }) {
  const getSpeakerVariant = (speaker) => {
    switch (speaker) {
      case SPEAKER_TYPES.DOCTOR:
        return 'default';
      case SPEAKER_TYPES.AI:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div
      className="flex gap-4 p-3 rounded-lg bg-slate-50 dark:bg-gray-700 shadow-sm border-2 border-gray-200 dark:border-gray-600 leading-relaxed transition-all duration-200 hover:shadow-md"
      role="article"
      aria-labelledby={`speaker-${index}`}
    >
      <div className="flex flex-col items-center min-w-[80px]">
        <Badge
          variant={getSpeakerVariant(segment.speaker)}
          className="text-xs mb-1 font-semibold"
          id={`speaker-${index}`}
        >
          {segment.speaker}
        </Badge>
        <span
          className="text-xs text-slate-500 dark:text-gray-400"
          aria-label={`Time: ${formatTimestamp(segment.startTime)}`}
        >
          {formatTimestamp(segment.startTime)}
        </span>
        {segment.confidence && (
          <span className="text-xs text-slate-400 dark:text-gray-500 mt-1">
            {Math.round(segment.confidence * 100)}%
          </span>
        )}
      </div>
      <p
        className="flex-1 text-slate-700 dark:text-gray-300 font-medium"
        aria-label={`${segment.speaker} says: ${segment.text}`}
      >
        {segment.text}
      </p>
    </div>
  );
}