import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ChevronLeft, ChevronRight, Edit3, Check, FileText, Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function ClinicalNotes({ onNext, onPrevious }) {
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState({
    subjective: `Motivo de Consulta: Paciente presenta dolor de cabeza persistente durante 3 días.

Historia de la Enfermedad Actual: Mujer de 32 años refiere inicio de cefalea unilateral hace 3 días, descrita como dolor sordo y constante que afecta principalmente el lado derecho de la cabeza. Intensidad del dolor calificada 6-7/10. Paciente refiere náuseas asociadas y fotofobia. Los síntomas están afectando las actividades diarias. No refiere fiebre. Paciente nota rigidez cervical leve. Sin cambios visuales.

Revisión por Sistemas: Positivo para cefalea, náuseas, fotofobia, rigidez cervical. Negativo para fiebre, cambios visuales, vómitos.`,
    
    objective: `Signos Vitales: No documentados en este encuentro
Examen Físico: No realizado en este encuentro
    
Nota: Esta fue una consulta virtual/telefónica enfocada en la toma de historia clínica.`,
    
    assessment: `Diagnóstico Principal: Cefalea, no especificada (R51)

Diagnóstico Diferencial:
1. Migraña - apoyado por localización unilateral, intensidad moderada, náuseas y fotofobia asociadas
2. Cefalea tensional - rigidez cervical puede sugerir componente muscular
3. Cefalea secundaria - requeriría evaluación adicional si los síntomas persisten

Impresión Clínica: Paciente presenta características clínicas compatibles con trastorno de cefalea primaria, muy probablemente migraña vs cefalea tensional. No se identifican síntomas de alarma.`,
    
    plan: `1. Manejo Farmacológico:
   - Prueba con AINEs (ibuprofeno 400mg c/6h PRN) para alivio sintomático
   - Considerar terapia con triptanes si se confirma diagnóstico de migraña

2. Medidas no farmacológicas:
   - Reposo en ambiente oscuro y silencioso
   - Hidratación adecuada
   - Compresas frías en área afectada

3. Seguimiento:
   - Cita de control en 1 semana si síntomas persisten o empeoran
   - Atención médica inmediata si desarrolla fiebre, rigidez cervical severa o síntomas neurológicos

4. Educación al Paciente:
   - Se discutieron desencadenantes de cefalea y modificaciones del estilo de vida
   - Se proporcionó información sobre cuándo buscar atención urgente`
  });

  const handleCopyNote = () => {
    const fullNote = `SUBJETIVO:\n${notes.subjective}\n\nOBJETIVO:\n${notes.objective}\n\nEVALUACIÓN:\n${notes.assessment}\n\nPLAN:\n${notes.plan}`;
    navigator.clipboard.writeText(fullNote);
    toast("Nota clínica copiada al portapapeles");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-slate-900 mb-2">Borrador de Nota Clínica</h1>
          <p className="text-slate-600">Nota SOAP generada por IA lista para revisión</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Generado por IA
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            {editMode ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {editMode ? 'Guardar Cambios' : 'Editar Nota'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyNote}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar
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
          Volver a Revisión de Flujo
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Generar Órdenes
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}