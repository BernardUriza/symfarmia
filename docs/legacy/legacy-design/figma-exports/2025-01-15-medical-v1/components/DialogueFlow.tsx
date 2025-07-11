import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ChevronLeft, ChevronRight, User, UserCheck, Clock, Tag } from 'lucide-react';

interface DialogueFlowProps {
  onNext: () => void;
  onPrevious: () => void;
}

const dialogueStructure = [
  {
    section: 'Motivo de Consulta',
    timestamp: '00:00:15',
    content: [
      { speaker: 'Doctor', text: 'Buenos días, María. ¿Cómo se siente hoy?' },
      { speaker: 'Paciente', text: 'He tenido este dolor de cabeza persistente durante los últimos tres días.' }
    ],
    tags: ['Síntoma Principal', 'Duración']
  },
  {
    section: 'Historia de la Enfermedad Actual',
    timestamp: '00:00:35',
    content: [
      { speaker: 'Doctor', text: '¿Puede describir el dolor? ¿Es pulsátil, punzante o sordo?' },
      { speaker: 'Paciente', text: 'Es más bien un dolor sordo y constante, especialmente en el lado derecho de mi cabeza.' },
      { speaker: 'Doctor', text: 'En una escala del 1 al 10, ¿cómo calificaría el dolor?' },
      { speaker: 'Paciente', text: 'Diría que es un 6 o 7. Definitivamente está afectando mis actividades diarias.' }
    ],
    tags: ['Calidad del Dolor', 'Localización', 'Severidad', 'Impacto Funcional']
  },
  {
    section: 'Síntomas Asociados',
    timestamp: '00:02:15',
    content: [
      { speaker: 'Doctor', text: '¿Ha experimentado náuseas, vómitos o sensibilidad a la luz?' },
      { speaker: 'Paciente', text: 'Sí, de hecho. Me siento un poco nauseosa, y las luces brillantes parecen empeorar el dolor.' }
    ],
    tags: ['Síntomas Asociados', 'Fotofobia', 'Náuseas']
  },
  {
    section: 'Revisión por Sistemas',
    timestamp: '00:03:45',
    content: [
      { speaker: 'Doctor', text: '¿Alguna fiebre, rigidez de cuello o cambios en la visión?' },
      { speaker: 'Paciente', text: 'No hay fiebre, pero mi cuello se siente un poco rígido. No tengo problemas de visión.' }
    ],
    tags: ['RPS', 'Rigidez de Cuello', 'Visión']
  }
];

export function DialogueFlow({ onNext, onPrevious }: DialogueFlowProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">Análisis del Flujo de Diálogo</h1>
        <p className="text-slate-600">La IA ha estructurado su conversación en secciones clínicas</p>
      </div>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">4</div>
            <div className="text-sm text-slate-500">Secciones Clínicas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">8</div>
            <div className="text-sm text-slate-500">Intercambios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">12</div>
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
                  <Badge key={tagIndex} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
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
          Volver a Grabación
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Generar Notas Clínicas
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}