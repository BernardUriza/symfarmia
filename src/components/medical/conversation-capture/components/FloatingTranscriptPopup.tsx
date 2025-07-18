'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Download, RefreshCw, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { LLMAuditResult } from '@/app/types/llm-audit';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface FloatingTranscriptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  llmResult?: LLMAuditResult | null;
  isAuditLoading?: boolean;
  auditError?: string | null;
  onReaudit?: () => void;
  className?: string;
}

export const FloatingTranscriptPopup: React.FC<FloatingTranscriptPopupProps> = ({
  isOpen,
  onClose,
  transcript,
  llmResult,
  isAuditLoading = false,
  auditError,
  onReaudit,
  className = ''
}) => {
  const { t } = useI18n();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  if (!isOpen) return null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
    } catch (err) {
      console.error('Error copying text:', err);
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayText = llmResult?.mergedTranscript || transcript;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] transition-all duration-300 ${
        isMinimized ? 'h-16' : ''
      } ${className}`}
    >
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {t('conversation.capture.transcript_popup_title', 'Transcripción')}
              {llmResult && (
                <Badge variant="outline" className="ml-2">
                  GPT Auditado
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcript">Texto Final</TabsTrigger>
                <TabsTrigger value="speakers">Speakers</TabsTrigger>
                <TabsTrigger value="logs">Log GPT</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4">
                <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {isAuditLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Revisando con ChatGPT...</span>
                    </div>
                  ) : auditError ? (
                    <div className="text-destructive dark:text-destructive/90">
                      Error: {auditError}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {displayText}
                    </pre>
                  )}
                </div>

                {llmResult?.summary && (
                  <div className="mt-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">Resumen Clínico:</h4>
                    <p className="text-sm">{llmResult.summary}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="speakers" className="mt-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {llmResult?.speakers && llmResult.speakers.length > 0 ? (
                    llmResult.speakers.map((segment, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg ${
                          segment.speaker === 'Doctor' 
                            ? 'bg-primary/5 dark:bg-primary/10' 
                            : 'bg-green-500/5 dark:bg-green-500/10'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant={segment.speaker === 'Doctor' ? 'default' : 'secondary'}>
                            {segment.speaker}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {segment.start}s - {segment.end}s
                          </span>
                        </div>
                        <p className="text-sm">{segment.text || 'N/A'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay datos de diarización disponibles
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {llmResult?.gptLogs && llmResult.gptLogs.length > 0 ? (
                    llmResult.gptLogs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-muted/30 dark:bg-muted/20 rounded text-sm">
                        <span className="text-muted-foreground">#{idx + 1}:</span> {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay logs de auditoría disponibles
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(displayText)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copySuccess ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(displayText, 'transcripcion-auditada.txt')}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
              {onReaudit && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={onReaudit}
                  disabled={isAuditLoading}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isAuditLoading ? 'animate-spin' : ''}`} />
                  Re-auditar
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};