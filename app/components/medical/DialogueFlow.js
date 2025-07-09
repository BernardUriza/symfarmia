import React from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, User, UserCheck, Clock } from 'lucide-react';

// Simple extraction of chief complaint from the dialogue structure
const extractChiefComplaint = (dialogue) => {
  const chief = dialogue.find(sec => sec.section === 'Chief Complaint' || sec.section === 'Motivo de Consulta');
  if (!chief) return '';
  const patientLine = chief.content.find(line => line.speaker === 'Paciente' || line.speaker === 'Patient');
  return patientLine ? patientLine.text : '';
};

const generateMedicalSummary = (dialogue, duration = '0:00') => {
  return {
    chiefComplaint: extractChiefComplaint(dialogue),
    historyPresentIllness: '',
    physicalExam: '',
    assessment: '',
    plan: '',
    duration,
    confidence: 0.9
  };
};

const getDialogueStructure = (t) => [
  {
    section: t('dialogue.sections.chief_complaint'),
    timestamp: '00:00:15',
    content: [
      { speaker: t('conversation.doctor_speaker'), text: 'Buenos días, María. ¿Cómo se siente hoy?' },
      { speaker: t('conversation.patient_speaker'), text: 'He tenido este dolor de cabeza persistente durante los últimos tres días.' }
    ],
    tags: [
      { term: t('dialogue.tags.main_symptom'), category: 'symptom' },
      { term: t('dialogue.tags.duration'), category: 'duration' }
    ]
  },
  {
    section: t('dialogue.sections.history_present_illness'),
    timestamp: '00:00:35',
    content: [
      { speaker: t('conversation.doctor_speaker'), text: '¿Puede describir el dolor? ¿Es pulsátil, punzante o sordo?' },
      { speaker: t('conversation.patient_speaker'), text: 'Es más bien un dolor sordo y constante, especialmente en el lado derecho de mi cabeza.' },
      { speaker: t('conversation.doctor_speaker'), text: 'En una escala del 1 al 10, ¿cómo calificaría el dolor?' },
      { speaker: t('conversation.patient_speaker'), text: 'Diría que es un 6 o 7. Definitivamente está afectando mis actividades diarias.' }
    ],
    tags: [
      { term: t('dialogue.tags.pain_quality'), category: 'symptom' },
      { term: t('dialogue.tags.location'), category: 'symptom' },
      { term: t('dialogue.tags.severity'), category: 'symptom' },
      { term: t('dialogue.tags.functional_impact'), category: 'other' }
    ]
  },
  {
    section: t('dialogue.sections.associated_symptoms'),
    timestamp: '00:02:15',
    content: [
      { speaker: t('conversation.doctor_speaker'), text: '¿Ha experimentado náuseas, vómitos o sensibilidad a la luz?' },
      { speaker: t('conversation.patient_speaker'), text: 'Sí, de hecho. Me siento un poco nauseosa, y las luces brillantes parecen empeorar el dolor.' }
    ],
    tags: [
      { term: t('dialogue.tags.associated_symptoms'), category: 'symptom' },
      { term: t('dialogue.tags.photophobia'), category: 'symptom' },
      { term: t('dialogue.tags.nausea'), category: 'symptom' }
    ]
  },
  {
    section: t('dialogue.sections.system_review'),
    timestamp: '00:03:45',
    content: [
      { speaker: t('conversation.doctor_speaker'), text: '¿Alguna fiebre, rigidez de cuello o cambios en la visión?' },
      { speaker: t('conversation.patient_speaker'), text: 'No hay fiebre, pero mi cuello se siente un poco rígido. No tengo problemas de visión.' }
    ],
    tags: [
      { term: t('dialogue.tags.rps'), category: 'other' },
      { term: t('dialogue.tags.neck_stiffness'), category: 'symptom' },
      { term: t('dialogue.tags.vision'), category: 'symptom' }
    ]
  }
];

export function DialogueFlow({ onNext, onPrevious }) {
  const { t } = useTranslation();
  const dialogueStructure = getDialogueStructure(t);

  const sectionCount = dialogueStructure.length;
  const exchangeCount = dialogueStructure.reduce((acc, sec) => acc + sec.content.length, 0);
  const tagCount = dialogueStructure.reduce((acc, sec) => acc + sec.tags.length, 0);
  const extractedChiefComplaint = extractChiefComplaint(dialogueStructure);
  const analysisInProgress = false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">{t('dialogue.title')}</h1>
        <p className="text-slate-600">{t('dialogue.subtitle')}</p>
      </div>

      {analysisInProgress && (
        <div className="analysis-status flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-xs text-gray-600">AI analizando la conversación...</span>
        </div>
      )}

      <div className="chief-complaint bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-blue-900">{t('dialogue.sections.chief_complaint')}</h3>
          <span className="text-xs text-blue-600">Auto-extracted</span>
        </div>
        <p className="text-blue-800 text-sm">
          {extractedChiefComplaint || 'Analizando conversación...'}
        </p>
      </div>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">{sectionCount}</div>
            <div className="text-sm text-slate-500">Secciones Clínicas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">{exchangeCount}</div>
            <div className="text-sm text-slate-500">Intercambios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">{tagCount}</div>
            <div className="text-sm text-slate-500">Etiquetas Clave</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-orange-600 mb-1">4:22</div>
            <div className="text-sm text-slate-500">Duración</div>
          </CardContent>
        </Card>
      </div>

      {/* Secciones de Diálogo */}
      <div className="space-y-6">
        {dialogueStructure.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">{section.section}</CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-500">{section.timestamp}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {section.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tag.category === 'symptom'
                        ? 'bg-red-100 text-red-700'
                        : tag.category === 'diagnosis'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag.term}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.content.map((exchange, exchangeIndex) => (
                  <div key={exchangeIndex} className="flex gap-3">
                    <div className="flex items-center">
                      {exchange.speaker === 'Doctor' ? (
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={exchange.speaker === 'Doctor' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {exchange.speaker}
                        </Badge>
                      </div>
                      <p className="text-slate-700 bg-slate-50 rounded-lg p-3">
                        {exchange.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Perspectivas de IA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            🤖 Perspectivas Clínicas de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Paciente presenta cefalea unilateral con fotofobia y náuseas asociadas</p>
            <p>• Duración de síntomas: 3 días, intensidad moderada a severa (6-7/10)</p>
            <p>• Se observa rigidez de cuello - considerar diferencial entre cefalea tensional vs migraña</p>
            <p>• No se reporta fiebre ni cambios visuales</p>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Volver a Captura
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Generar Notas Clínicas
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="export-options mt-6 flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Export SOAP Note</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg">Add to Patient Record</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">Generate Prescription</button>
      </div>
    </div>
  );}