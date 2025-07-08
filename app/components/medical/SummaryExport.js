import React, { useState } from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ChevronLeft, Download, FileText, Mail, Printer, Share2, Clock, User } from 'lucide-react';

const medicalSummary = {
  patientInfo: {
    name: 'María García',
    age: 32,
    gender: 'Femenino',
    id: '12345678',
    date: new Date().toLocaleDateString('es-ES'),
    time: '10:30 AM'
  },
  chiefComplaint: 'Dolor de cabeza persistente durante 3 días',
  assessment: 'Cefalea, no especificada (R51) - Probable migraña',
  keyFindings: [
    'Dolor sordo y constante en lado derecho de la cabeza',
    'Intensidad 6-7/10',
    'Náuseas y fotofobia asociadas',
    'Rigidez cervical leve',
    'Sin fiebre ni cambios visuales'
  ],
  orders: [
    'Ibuprofeno 400mg cada 6 horas según necesidad x 5 días',
    'TAC de cráneo simple para descartar patología intracraneal',
    'Interconsulta con Neurología para evaluación especializada'
  ],
  followUp: 'Control en 1 semana si síntomas persisten o empeoran'
};

export function SummaryExport({ onPrevious }) {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert(`Reporte exportado como ${format.toUpperCase()}`);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">Resumen Final de Consulta</h1>
        <p className="text-slate-600">Reporte completo generado por IA listo para exportar</p>
      </div>

      {/* Información del Paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Nombre</p>
              <p className="font-medium text-slate-900">{medicalSummary.patientInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Edad</p>
              <p className="font-medium text-slate-900">{medicalSummary.patientInfo.age} años</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">ID Paciente</p>
              <p className="font-medium text-slate-900">{medicalSummary.patientInfo.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha de Consulta</p>
              <p className="font-medium text-slate-900">{medicalSummary.patientInfo.date} - {medicalSummary.patientInfo.time}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Clínico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumen Clínico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Motivo de Consulta</h4>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{medicalSummary.chiefComplaint}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Impresión Diagnóstica</h4>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{medicalSummary.assessment}</p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Hallazgos Clave</h4>
              <ul className="space-y-2">
                {medicalSummary.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-slate-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Órdenes Médicas</h4>
              <ul className="space-y-2">
                {medicalSummary.orders.map((order, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-slate-700">{order}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Seguimiento</h4>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{medicalSummary.followUp}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opciones de Exportación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Opciones de Exportación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={exportFormat} onValueChange={setExportFormat}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="docx">Word</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pdf" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Exportar como documento PDF para imprimir o compartir</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExport('pdf')} 
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Generando PDF...' : 'Descargar PDF'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="docx" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Exportar como documento Word para editar</p>
                <Button 
                  onClick={() => handleExport('docx')} 
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Generando Word...' : 'Descargar Word'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Enviar resumen por correo electrónico</p>
                <div className="flex gap-2">
                  <Button className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar a Paciente
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Compartir con Especialista
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Estadísticas de Consulta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">4:22</div>
            <div className="text-sm text-slate-500">Duración Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">95%</div>
            <div className="text-sm text-slate-500">Precisión IA</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">3</div>
            <div className="text-sm text-slate-500">Órdenes Generadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-orange-600 mb-1">A+</div>
            <div className="text-sm text-slate-500">Calidad Nota</div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Volver a Órdenes
        </Button>
        <Button className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Nueva Consulta
        </Button>
      </div>
    </div>
  );
}