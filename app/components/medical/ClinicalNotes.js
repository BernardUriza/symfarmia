import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ChevronLeft, ChevronRight, Edit3, Check, FileText, Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../../providers/I18nProvider';

export function ClinicalNotes({ onNext, onPrevious }) {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState({
    subjective: t('clinical_notes.subjective_template'),
    objective: t('clinical_notes.objective_template'),
    assessment: t('clinical_notes.assessment_template'),
    plan: t('clinical_notes.plan_template')
  });

  const handleCopyNote = () => {
    const fullNote = `SUBJETIVO:\n${notes.subjective}\n\nOBJETIVO:\n${notes.objective}\n\nEVALUACIÓN:\n${notes.assessment}\n\nPLAN:\n${notes.plan}`;
    navigator.clipboard.writeText(fullNote);
    toast(t('clinical_notes.copied_toast'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-slate-900 mb-2">{t('clinical_notes.draft_title')}</h1>
          <p className="text-slate-600">{t('clinical_notes.draft_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('clinical_notes.generated_by_ai')}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            {editMode ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {editMode ? t('clinical_notes.save_changes') : t('clinical_notes.edit_note')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyNote}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {t('copy')}
          </Button>
        </div>
      </div>

      {/* Indicadores de Calidad de Nota */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">95%</div>
            <div className="text-sm text-slate-500">Completitud</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">A+</div>
            <div className="text-sm text-slate-500">Calificación</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">4</div>
            <div className="text-sm text-slate-500">Códigos CIE-10</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-orange-600 mb-1">2:15</div>
            <div className="text-sm text-slate-500">Tiempo Generación</div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de Nota SOAP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nota SOAP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subjective" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjective">Subjetivo</TabsTrigger>
              <TabsTrigger value="objective">Objetivo</TabsTrigger>
              <TabsTrigger value="assessment">Evaluación</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subjective" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.subjective}
                  onChange={(e) => setNotes({...notes, subjective: e.target.value})}
                  className="min-h-64 text-sm"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.subjective}
                  </pre>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="objective" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.objective}
                  onChange={(e) => setNotes({...notes, objective: e.target.value})}
                  className="min-h-64 text-sm"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.objective}
                  </pre>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assessment" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.assessment}
                  onChange={(e) => setNotes({...notes, assessment: e.target.value})}
                  className="min-h-64 text-sm"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.assessment}
                  </pre>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="plan" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.plan}
                  onChange={(e) => setNotes({...notes, plan: e.target.value})}
                  className="min-h-64 text-sm"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.plan}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sugerencias de IA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            💡 Sugerencias de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Considerar agregar documentación de signos vitales para completitud</p>
            <p>• Los hallazgos del examen físico fortalecerían la evaluación</p>
            <p>• Podría incluir recomendación de diario de cefaleas en educación al paciente</p>
            <p>• Considerar documentar alergias a medicamentos si no están ya registradas</p>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          {t('clinical_notes.back_to_dialogue')}
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          {t('clinical_notes.generate_orders')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );}