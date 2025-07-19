/**
 * DIARIZED TRANSCRIPT COMPONENT - BAZAR MODE
 * 
 * ANTI-REGLAS DE CATEDRAL:
 * - NO lógica cerrada o privada
 * - NO componentes que solo "yo" pueda modificar
 * - NO dependencias en "héroes" individuales
 * - TODO esquema público, reutilizable, documentado
 * 
 * REGLAS DE BAZAR:
 * - Cualquier dev puede clonar, modificar, extender
 * - Esquemas de colores y avatares PÚBLICOS
 * - Lógica de edición TRANSPARENTE
 * - Timeline visual DOCUMENTADO
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Edit2, Play, Pause, Download, Save, Clock } from 'lucide-react';
import { DiarizationSegment } from '@/src/domains/medical-ai/services/DiarizationService';

// CONFIGURACIÓN DIARIZATION - PÚBLICA Y MODIFICABLE
export const DIARIZATION_CONFIG = {
  speakers: {
    DOCTOR: {
      label: 'Doctor',
      avatar: '👨‍⚕️',
      color: '#3B82F6'
    },
    PATIENT: {
      label: 'Paciente',
      avatar: '👤',
      color: '#10B981'
    },
    UNKNOWN: {
      label: 'Desconocido',
      avatar: '❓',
      color: '#6B7280'
    }
  }
};

// ESQUEMAS PÚBLICOS - MODIFICABLES POR CUALQUIER DEV
export const SPEAKER_SCHEMAS = {
  colors: DIARIZATION_CONFIG.speakers,
  
  // AVATARES ADICIONALES - EXTENSIBLES
  avatarVariants: {
    DOCTOR: ['👨‍⚕️', '👩‍⚕️', '🥼', '🩺'],
    PATIENT: ['👤', '👨', '👩', '🧑'],
    UNKNOWN: ['❓', '🎙️', '🗣️', '👥']
  },
  
  // ESQUEMAS DE COLOR - PÚBLICOS Y REEMPLAZABLES
  colorSchemes: {
    medical: {
      DOCTOR: '#3B82F6',
      PATIENT: '#10B981',
      UNKNOWN: '#6B7280'
    },
    accessible: {
      DOCTOR: '#1E40AF',
      PATIENT: '#059669',
      UNKNOWN: '#4B5563'
    },
    highContrast: {
      DOCTOR: '#000000',
      PATIENT: '#FFFFFF',
      UNKNOWN: '#808080'
    }
  }
};

// TIPOS PÚBLICOS - EXPORTABLES
export interface DiarizedTranscriptProps {
  segments: DiarizationSegment[];
  audioUrl?: string;
  onSegmentEdit?: (segmentIndex: number, newText: string) => void;
  onSpeakerChange?: (segmentIndex: number, newSpeaker: 'DOCTOR' | 'PATIENT' | 'UNKNOWN') => void;
  onTimelineClick?: (timestamp: number) => void;
  editable?: boolean;
  showTimeline?: boolean;
  colorScheme?: 'medical' | 'accessible' | 'highContrast';
  className?: string;
}

// COMPONENTE PÚBLICO - TOTALMENTE MODIFICABLE
export const DiarizedTranscript: React.FC<DiarizedTranscriptProps> = ({
  segments,
  audioUrl,
  onSegmentEdit,
  onSpeakerChange: _onSpeakerChange,
  onTimelineClick,
  editable = true,
  showTimeline = true,
  colorScheme = 'medical',
  className = ''
}) => {
  const [editingSegment, setEditingSegment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // ESQUEMA DE COLORES PÚBLICO
  const colors = SPEAKER_SCHEMAS.colorSchemes[colorScheme];
  
  // CONTROL DE AUDIO - LÓGICA TRANSPARENTE
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);
  
  // FUNCIÓN PÚBLICA - OBTENER CONFIGURACIÓN DE HABLANTE
  const getSpeakerConfig = (speaker: 'DOCTOR' | 'PATIENT' | 'UNKNOWN') => {
    return DIARIZATION_CONFIG.speakers[speaker];
  };
  
  // FUNCIÓN PÚBLICA - FORMATEAR TIEMPO
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // FUNCIÓN PÚBLICA - INICIAR EDICIÓN
  const startEditing = (segmentIndex: number, currentText: string) => {
    setEditingSegment(segmentIndex);
    setEditText(currentText);
  };
  
  // FUNCIÓN PÚBLICA - GUARDAR EDICIÓN
  const saveEdit = (segmentIndex: number) => {
    if (onSegmentEdit) {
      onSegmentEdit(segmentIndex, editText);
    }
    setEditingSegment(null);
    setEditText('');
  };
  
  // FUNCIÓN PÚBLICA - CANCELAR EDICIÓN
  const cancelEdit = () => {
    setEditingSegment(null);
    setEditText('');
  };
  
  // FUNCIÓN PÚBLICA - REPRODUCIR DESDE TIMESTAMP
  const playFromTimestamp = (timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
      audioRef.current.play();
    }
    if (onTimelineClick) {
      onTimelineClick(timestamp);
    }
  };
  
  // FUNCIÓN PÚBLICA - ALTERNAR REPRODUCCIÓN
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  // FUNCIÓN PÚBLICA - EXPORTAR TRANSCRIPCIÓN
  const exportTranscript = () => {
    const transcript = {
      segments: segments.map(segment => ({
        speaker: segment.speaker,
        startTime: segment.startTime,
        endTime: segment.endTime,
        text: segment.text,
        confidence: segment.confidence
      })),
      metadata: {
        totalSegments: segments.length,
        speakers: [...new Set(segments.map(s => s.speaker))],
        duration: segments.length > 0 ? segments[segments.length - 1].endTime : 0,
        exportedAt: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diarized-transcript-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // FUNCIÓN PÚBLICA - COMPONENTE DE TIMELINE
  const TimelineBar: React.FC<{ segment: DiarizationSegment; index: number }> = ({ segment, index: _index }) => {
    const speakerConfig = getSpeakerConfig(segment.speaker);
    const duration = segment.endTime - segment.startTime;
    const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
    
    return (
      <div
        className={`h-2 cursor-pointer transition-all duration-200 ${
          isActive ? 'h-3 shadow-lg' : 'hover:h-3'
        }`}
        style={{
          backgroundColor: colors[segment.speaker],
          width: `${(duration / segments[segments.length - 1].endTime) * 100}%`,
          opacity: isActive ? 1 : 0.7
        }}
        onClick={() => playFromTimestamp(segment.startTime)}
        title={`${speakerConfig.label}: ${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
      />
    );
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {/* HEADER PÚBLICO - MODIFICABLE */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transcripción Diarizada</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportTranscript}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {audioUrl && (
              <Button variant="outline" size="sm" onClick={togglePlayback}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        
        {/* AUDIO PLAYER - TRANSPARENTE */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            style={{ display: 'none' }}
            preload="metadata"
          />
        )}
        
        {/* TIMELINE VISUAL - DOCUMENTADO */}
        {showTimeline && segments.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Timeline Visual</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-2 gap-1">
              {segments.map((segment, index) => (
                <TimelineBar key={index} segment={segment} index={index} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span>{formatTime(segments[segments.length - 1]?.endTime || 0)}</span>
            </div>
          </div>
        )}
        
        {/* LEYENDA DE HABLANTES - PÚBLICA */}
        <div className="flex gap-4 mb-4">
          {[...new Set(segments.map(s => s.speaker))].map(speaker => {
            const config = getSpeakerConfig(speaker);
            return (
              <div key={speaker} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[speaker] }}
                />
                <span className="text-sm">{config.avatar} {config.label}</span>
              </div>
            );
          })}
        </div>
        
        {/* SEGMENTOS - EDITABLES Y TRANSPARENTES */}
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const speakerConfig = getSpeakerConfig(segment.speaker);
            const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
            const isEditing = editingSegment === index;
            
            return (
              <div
                key={index}
                className={`border-l-4 pl-4 py-2 transition-all duration-200 ${
                  isActive ? 'bg-blue-50 border-l-blue-500' : 'border-l-gray-300'
                }`}
                style={{
                  borderLeftColor: isActive ? colors[segment.speaker] : undefined
                }}
              >
                {/* HEADER DEL SEGMENTO */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{speakerConfig.avatar}</span>
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: colors[segment.speaker], color: 'white' }}
                    >
                      {speakerConfig.label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTime(segment.startTime)} → {formatTime(segment.endTime)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(segment.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  {/* CONTROLES DE EDICIÓN */}
                  {editable && (
                    <div className="flex gap-1">
                      {!isEditing ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(index, segment.text)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveEdit(index)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* CONTENIDO DEL SEGMENTO */}
                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <p 
                    className="text-gray-800 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => playFromTimestamp(segment.startTime)}
                  >
                    {segment.text}
                  </p>
                )}
                
                {/* PALABRAS INDIVIDUALES CON TIMESTAMPS */}
                {segment.chunks && segment.chunks.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <details>
                      <summary className="cursor-pointer hover:text-gray-700">
                        Ver palabras individuales ({segment.chunks.length})
                      </summary>
                      <div className="mt-2 space-y-1">
                        {segment.chunks.map((chunk, chunkIndex) => (
                          <span
                            key={chunkIndex}
                            className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                            onClick={() => playFromTimestamp(chunk.timestamp[0])}
                            title={`${formatTime(chunk.timestamp[0])} - ${formatTime(chunk.timestamp[1])}`}
                          >
                            {chunk.text}
                          </span>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* METADATA PÚBLICO */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Metadatos de Transcripción</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Segmentos:</span> {segments.length}
            </div>
            <div>
              <span className="font-medium">Hablantes:</span> {[...new Set(segments.map(s => s.speaker))].length}
            </div>
            <div>
              <span className="font-medium">Duración:</span> {formatTime(segments[segments.length - 1]?.endTime || 0)}
            </div>
            <div>
              <span className="font-medium">Esquema:</span> {colorScheme}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// DOCUMENTACIÓN PÚBLICA - SIEMPRE ACTUALIZADA
export const DIARIZED_TRANSCRIPT_DOCS = {
  component: 'DiarizedTranscript',
  version: '1.0.0',
  description: 'Componente modular para mostrar transcripciones diarizadas con timeline visual',
  
  props: {
    segments: 'Array de segmentos diarizados',
    audioUrl: 'URL del audio para reproducción sincronizada',
    onSegmentEdit: 'Callback para editar texto de segmento',
    onSpeakerChange: 'Callback para cambiar hablante de segmento',
    onTimelineClick: 'Callback para clicks en timeline',
    editable: 'Habilitar edición manual',
    showTimeline: 'Mostrar timeline visual',
    colorScheme: 'Esquema de colores (medical, accessible, highContrast)',
    className: 'Clases CSS adicionales'
  },
  
  schemas: {
    speakers: 'SPEAKER_SCHEMAS - completamente público y modificable',
    colors: 'Esquemas de color intercambiables',
    avatars: 'Avatares extensibles por hablante'
  },
  
  features: [
    'Timeline visual interactivo',
    'Edición manual transparente',
    'Reproducción sincronizada con audio',
    'Exportación de transcripción',
    'Esquemas de color accesibles',
    'Metadatos públicos'
  ],
  
  customization: {
    colors: 'Modificar SPEAKER_SCHEMAS.colorSchemes',
    avatars: 'Extender SPEAKER_SCHEMAS.avatarVariants',
    layout: 'Componente completamente modular y re-estilizable',
    logic: 'Todas las funciones son públicas y auditables'
  }
};

export default DiarizedTranscript;