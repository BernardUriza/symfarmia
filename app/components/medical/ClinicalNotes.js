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
    subjective: `${t('clinical.templates.chief_complaint')}

${t('clinical.templates.history_present_illness')}

${t('clinical.templates.systems_review')}`,
    
    objective: `${t('clinical.templates.vital_signs')}
${t('clinical.templates.physical_exam')}
    
${t('clinical.templates.virtual_consultation')}`,
    
    assessment: `${t('clinical.templates.primary_diagnosis')}

${t('clinical.templates.differential_diagnosis')}
${t('clinical.templates.migraine')}
${t('clinical.templates.tension_headache')}
${t('clinical.templates.secondary_headache')}

${t('clinical.templates.clinical_impression')}`,
    
    plan: `${t('clinical.templates.pharmacological_management')}
${t('clinical.templates.nsaid_trial')}
${t('clinical.templates.triptan_therapy')}

${t('clinical.templates.non_pharmacological')}
${t('clinical.templates.rest')}
${t('clinical.templates.hydration')}
${t('clinical.templates.cold_compress')}

${t('clinical.templates.followup')}
${t('clinical.templates.control_appointment')}
${t('clinical.templates.urgent_care')}

${t('clinical.templates.patient_education')}
${t('clinical.templates.triggers')}
${t('clinical.templates.urgent_signs')}`
  });

  const handleCopyNote = () => {
    const fullNote = `${t('clinical.soap_sections.subjective').toUpperCase()}:\n${notes.subjective}\n\n${t('clinical.soap_sections.objective').toUpperCase()}:\n${notes.objective}\n\n${t('clinical.soap_sections.assessment').toUpperCase()}:\n${notes.assessment}\n\n${t('clinical.soap_sections.plan').toUpperCase()}:\n${notes.plan}`;
    navigator.clipboard.writeText(fullNote);
    toast(t('clinical.notes.copied_to_clipboard'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-slate-900 mb-2">{t('clinical.notes.title')}</h1>
          <p className="text-slate-600">{t('clinical.notes.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('clinical.notes.generated_by_ai')}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
            aria-label={editMode ? t('clinical.notes.save_changes') : t('clinical.notes.edit_note')}
          >
            {editMode ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {editMode ? t('clinical.notes.save_changes') : t('clinical.notes.edit_note')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyNote}
            className="flex items-center gap-2"
            aria-label={t('clinical.notes.copy')}
          >
            <Copy className="h-4 w-4" />
            {t('clinical.notes.copy')}
          </Button>
        </div>
      </div>

      {/* Indicadores de Calidad de Nota */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">95%</div>
            <div className="text-sm text-slate-500">{t('clinical.quality_indicators.completeness')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">A+</div>
            <div className="text-sm text-slate-500">{t('clinical.quality_indicators.rating')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">4</div>
            <div className="text-sm text-slate-500">{t('clinical.quality_indicators.icd_codes')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-orange-600 mb-1">2:15</div>
            <div className="text-sm text-slate-500">{t('clinical.quality_indicators.generation_time')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de Nota SOAP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('clinical.notes.soap_note')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subjective" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjective">{t('clinical.soap_sections.subjective')}</TabsTrigger>
              <TabsTrigger value="objective">{t('clinical.soap_sections.objective')}</TabsTrigger>
              <TabsTrigger value="assessment">{t('clinical.soap_sections.assessment')}</TabsTrigger>
              <TabsTrigger value="plan">{t('clinical.soap_sections.plan')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subjective" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.subjective}
                  onChange={(e) => setNotes({...notes, subjective: e.target.value})}
                  className="min-h-64 text-sm"
                  aria-label={t('clinical.soap_sections.subjective')}
                  aria-describedby="subjective-description"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64" aria-label={t('clinical.soap_sections.subjective')} role="region">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.subjective}
                  </pre>
                </div>
              )}
              <div id="subjective-description" className="sr-only">
                {t('clinical.soap_sections.subjective')} section of the clinical note
              </div>
            </TabsContent>
            
            <TabsContent value="objective" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.objective}
                  onChange={(e) => setNotes({...notes, objective: e.target.value})}
                  className="min-h-64 text-sm"
                  aria-label={t('clinical.soap_sections.objective')}
                  aria-describedby="objective-description"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64" aria-label={t('clinical.soap_sections.objective')} role="region">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.objective}
                  </pre>
                </div>
              )}
              <div id="objective-description" className="sr-only">
                {t('clinical.soap_sections.objective')} section of the clinical note
              </div>
            </TabsContent>
            
            <TabsContent value="assessment" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.assessment}
                  onChange={(e) => setNotes({...notes, assessment: e.target.value})}
                  className="min-h-64 text-sm"
                  aria-label={t('clinical.soap_sections.assessment')}
                  aria-describedby="assessment-description"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64" aria-label={t('clinical.soap_sections.assessment')} role="region">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.assessment}
                  </pre>
                </div>
              )}
              <div id="assessment-description" className="sr-only">
                {t('clinical.soap_sections.assessment')} section of the clinical note
              </div>
            </TabsContent>
            
            <TabsContent value="plan" className="mt-4">
              {editMode ? (
                <Textarea
                  value={notes.plan}
                  onChange={(e) => setNotes({...notes, plan: e.target.value})}
                  className="min-h-64 text-sm"
                  aria-label={t('clinical.soap_sections.plan')}
                  aria-describedby="plan-description"
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 min-h-64" aria-label={t('clinical.soap_sections.plan')} role="region">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {notes.plan}
                  </pre>
                </div>
              )}
              <div id="plan-description" className="sr-only">
                {t('clinical.soap_sections.plan')} section of the clinical note
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sugerencias de IA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            {t('clinical.suggestions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>{t('clinical.suggestions.vital_signs')}</p>
            <p>{t('clinical.suggestions.physical_exam')}</p>
            <p>{t('clinical.suggestions.headache_diary')}</p>
            <p>{t('clinical.suggestions.drug_allergies')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2" aria-label={t('clinical.notes.back_to_review')}>
          <ChevronLeft className="h-4 w-4" />
          {t('clinical.notes.back_to_review')}
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2" aria-label={t('clinical.notes.generate_orders')}>
          {t('clinical.notes.generate_orders')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}