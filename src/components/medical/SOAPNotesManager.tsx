'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Alert } from '@material-tailwind/react';
import { 
  FileText, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Edit3,
  Save
} from 'lucide-react';
import { medicalAIService } from '@/src/domains/medical-ai/services/medicalAIService';
import type { SOAPNotes, SOAPConfig } from '@/src/types/medical';

interface SOAPNotesManagerProps {
  transcription?: string;
  initialNotes?: SOAPNotes;
  onNotesGenerated?: (notes: SOAPNotes) => void;
  onNotesUpdated?: (notes: SOAPNotes) => void;
  config?: SOAPConfig;
  className?: string;
  showActions?: boolean;
  editable?: boolean;
}

export const SOAPNotesManager: React.FC<SOAPNotesManagerProps> = ({
  transcription,
  initialNotes,
  onNotesGenerated,
  onNotesUpdated,
  config = {
    autoGenerate: false,
    style: 'detailed',
    includeTimestamps: true,
    includeConfidence: true,
    medicalTerminology: 'mixed'
  },
  className = '',
  showActions = true,
  editable = false
}) => {
  const [notes, setNotes] = useState<SOAPNotes | null>(initialNotes || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState<SOAPNotes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate SOAP notes from transcription
  const generateNotes = useCallback(async () => {
    if (!transcription) {
      setError('No transcription available to generate SOAP notes');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await medicalAIService.generateSOAPNotes(transcription, {
        style: config.style,
        includeTimestamps: config.includeTimestamps,
        medicalTerminology: config.medicalTerminology
      });

      if (response.success && response.data) {
        setNotes(response.data);
        if (onNotesGenerated) {
          onNotesGenerated(response.data);
        }
      } else {
        throw new Error(response.error || 'Failed to generate SOAP notes');
      }
    } catch (err) {
      console.error('Error generating SOAP notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate SOAP notes');
    } finally {
      setIsGenerating(false);
    }
  }, [transcription, config, onNotesGenerated]);

  // Toggle edit mode
  const toggleEdit = useCallback(() => {
    if (isEditing) {
      // Cancel editing
      setEditedNotes(null);
      setIsEditing(false);
    } else {
      // Start editing
      setEditedNotes(notes);
      setIsEditing(true);
    }
  }, [isEditing, notes]);

  // Save edited notes
  const saveEditedNotes = useCallback(() => {
    if (editedNotes) {
      setNotes(editedNotes);
      if (onNotesUpdated) {
        onNotesUpdated(editedNotes);
      }
      setIsEditing(false);
      setEditedNotes(null);
    }
  }, [editedNotes, onNotesUpdated]);

  // Copy notes to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!notes) return;

    const formattedNotes = `SOAP Notes
${notes.timestamp ? `Generated: ${new Date(notes.timestamp).toLocaleString()}` : ''}
${notes.confidence ? `Confidence: ${(notes.confidence * 100).toFixed(0)}%` : ''}

SUBJECTIVE:
${notes.subjective}

OBJECTIVE:
${notes.objective}

ASSESSMENT:
${notes.assessment}

PLAN:
${notes.plan}`;

    try {
      await navigator.clipboard.writeText(formattedNotes);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  }, [notes]);

  // Download notes as text file
  const downloadNotes = useCallback(() => {
    if (!notes) return;

    const formattedNotes = `SOAP Notes
${notes.timestamp ? `Generated: ${new Date(notes.timestamp).toLocaleString()}` : ''}
${notes.confidence ? `Confidence: ${(notes.confidence * 100).toFixed(0)}%` : ''}

SUBJECTIVE:
${notes.subjective}

OBJECTIVE:
${notes.objective}

ASSESSMENT:
${notes.assessment}

PLAN:
${notes.plan}`;

    const blob = new Blob([formattedNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_Notes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  }, [notes]);

  // Render editable field
  const renderEditableField = (
    label: string,
    value: string,
    field: keyof SOAPNotes
  ) => {
    if (isEditing && editedNotes) {
      return (
        <div className="space-y-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">
            {label}:
          </label>
          <textarea
            value={editedNotes[field] as string}
            onChange={(e) => setEditedNotes({
              ...editedNotes,
              [field]: e.target.value
            })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      );
    }

    return (
      <div>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {label}:
        </span>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{value}</p>
      </div>
    );
  };

  // Auto-generate on mount if configured
  React.useEffect(() => {
    if (config.autoGenerate && transcription && !notes && !isGenerating) {
      generateNotes();
    }
  }, [config.autoGenerate, transcription, notes, isGenerating, generateNotes]);

  if (!notes && !isGenerating && !transcription) {
    return (
      <Alert color="blue" className={className}>
        <AlertCircle className="h-4 w-4" />
        <span>No SOAP notes available. Provide a transcription to generate notes.</span>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">SOAP Notes</h3>
            {notes && (
              <div className="flex items-center gap-2">
                {notes.generatedBy && (
                  <Badge variant="outline" className="text-xs">
                    {notes.generatedBy === 'ai' ? 'AI Generated' : 
                     notes.generatedBy === 'manual' ? 'Manual' : 'Hybrid'}
                  </Badge>
                )}
                {notes.confidence && config.includeConfidence && (
                  <Badge variant="secondary" className="text-xs">
                    {(notes.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!notes && transcription && (
              <Button
                onClick={generateNotes}
                disabled={isGenerating}
                size="sm"
                variant="default"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate SOAP
                  </>
                )}
              </Button>
            )}

            {notes && (
              <>
                {editable && (
                  <Button
                    onClick={isEditing ? saveEditedNotes : toggleEdit}
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                )}

                {isEditing && (
                  <Button
                    onClick={toggleEdit}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}

                {!isEditing && (
                  <>
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      variant="outline"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={downloadNotes}
                      size="sm"
                      variant="outline"
                    >
                      {downloadSuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>

                    {transcription && (
                      <Button
                        onClick={generateNotes}
                        disabled={isGenerating}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <Alert color="red">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* SOAP Notes display */}
      {notes && (
        <Card>
          <CardContent className="space-y-4 p-6">
            {config.includeTimestamps && notes.timestamp && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Generated: {new Date(notes.timestamp).toLocaleString()}
              </div>
            )}

            <div className="space-y-3">
              {renderEditableField('Subjective', notes.subjective, 'subjective')}
              {renderEditableField('Objective', notes.objective, 'objective')}
              {renderEditableField('Assessment', notes.assessment, 'assessment')}
              {renderEditableField('Plan', notes.plan, 'plan')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generating state */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">
                Generating SOAP notes from transcription...
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SOAPNotesManager;