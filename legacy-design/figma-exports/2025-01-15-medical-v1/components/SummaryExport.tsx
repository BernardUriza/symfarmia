import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  ChevronLeft,
  Download,
  Share,
  Printer,
  Check,
  FileText,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SummaryExportProps {
  onPrevious: () => void;
}

export function SummaryExport({
  onPrevious,
}: SummaryExportProps) {
  const [exportFormat, setExportFormat] = useState("pdf");

  const handleExport = (format: string) => {
    toast(
      `Exportando documentación como ${format.toUpperCase()}...`,
    );
    // Simulate export process
    setTimeout(() => {
      toast(
        `Documentación exportada exitosamente como ${format.toUpperCase()}`,
      );
    }, 2000);
  };

  const handleShare = () => {
    toast(
      "Enlace de compartir seguro generado y copiado al portapapeles",
    );
  };

  const encounterSummary = {
    patient: {
      name: "María García",
      dob: "15/03/1985",
      mrn: "HCL-2024-001234",
    },
    encounter: {
      date: "7 de enero, 2025",
      type: "Consulta Virtual",
      duration: "00:08:23",
      provider: "Dr. Rodríguez",
    },
    diagnosis: {
      primary: "Cefalea, no especificada (R51)",
      secondary: ["Fotofobia", "Náuseas"],
    },
    orders: [
      {
        type: "Medicamento",
        item: "Ibuprofeno 400mg",
        status: "Activa",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">
          Resumen de Documentación
        </h1>
        <p className="text-slate-600">
          Documentación clínica completa lista para exportar
        </p>
      </div>

      {/* Acciones de Exportación */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => handleExport("pdf")}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport("docx")}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Exportar Word
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport("print")}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          Compartir Seguro
        </Button>
      </div>

      {/* Resumen del Encuentro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumen del Encuentro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-slate-600 mb-2">
                Información del Paciente
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900">
                    {encounterSummary.patient.name}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  FN: {encounterSummary.patient.dob}
                </p>
                <p className="text-sm text-slate-600">
                  HCL: {encounterSummary.patient.mrn}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm text-slate-600 mb-2">
                Detalles del Encuentro
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900">
                    {encounterSummary.encounter.date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900">
                    Duración:{" "}
                    {encounterSummary.encounter.duration}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Médico: {encounterSummary.encounter.provider}
                </p>
                <p className="text-sm text-slate-600">
                  Tipo: {encounterSummary.encounter.type}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa de Documentación */}
      <Card>
        <CardHeader>
          <CardTitle>Documentación Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="notes">
                Notas SOAP
              </TabsTrigger>
              <TabsTrigger value="orders">Órdenes</TabsTrigger>
              <TabsTrigger value="quality">Calidad</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-slate-600 mb-2">
                    Diagnóstico Principal
                  </h4>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700"
                  >
                    {encounterSummary.diagnosis.primary}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm text-slate-600 mb-2">
                    Síntomas Clave
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {encounterSummary.diagnosis.secondary.map(
                      (symptom, index) => (
                        <Badge key={index} variant="secondary">
                          {symptom}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-slate-600 mb-2">
                    Plan de Tratamiento
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700">
                      Paciente prescrita con AINEs para alivio
                      sintomático con seguimiento en 1 semana si
                      los síntomas persisten. Se discutieron
                      modificaciones del estilo de vida y
                      evitación de desencadenantes.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-slate-900 mb-2">
                      SUBJETIVO:
                    </h4>
                    <p className="text-slate-600">
                      Motivo de Consulta: Paciente presenta
                      dolor de cabeza persistente durante 3
                      días...
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-slate-900 mb-2">
                      OBJETIVO:
                    </h4>
                    <p className="text-slate-600">
                      Signos Vitales: No documentados en este
                      encuentro...
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-slate-900 mb-2">
                      EVALUACIÓN:
                    </h4>
                    <p className="text-slate-600">
                      Diagnóstico Principal: Cefalea, no
                      especificada (R51)...
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-slate-900 mb-2">
                      PLAN:
                    </h4>
                    <p className="text-slate-600">
                      1. Manejo Farmacológico: Prueba con
                      AINEs...
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="space-y-3">
                {encounterSummary.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {order.type}
                      </Badge>
                      <span className="text-sm text-slate-900">
                        {order.item}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quality" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl text-green-600 mb-1">
                        95%
                      </div>
                      <div className="text-sm text-slate-500">
                        Completitud Documentación
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl text-blue-600 mb-1">
                        A+
                      </div>
                      <div className="text-sm text-slate-500">
                        Puntaje de Calidad
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl text-purple-600 mb-1">
                        100%
                      </div>
                      <div className="text-sm text-slate-500">
                        Precisión de Codificación
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl text-orange-600 mb-1">
                        ✓
                      </div>
                      <div className="text-sm text-slate-500">
                        Verificación Cumplimiento
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Métricas de Rendimiento de IA */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            🎯 Resumen de Rendimiento de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="text-green-800 mb-2">
                Tiempo Ahorrado
              </h4>
              <p className="text-green-700">
                Se estima un ahorro de 45 minutos de tiempo de
                documentación comparado con entrada manual
              </p>
            </div>
            <div>
              <h4 className="text-green-800 mb-2">Precisión</h4>
              <p className="text-green-700">
                98.5% de precisión en reconocimiento de términos
                clínicos y codificación médica
              </p>
            </div>
            <div>
              <h4 className="text-green-800 mb-2">
                Completitud
              </h4>
              <p className="text-green-700">
                Todas las secciones de documentación requeridas
                generadas con detalle apropiado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Finales */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg text-slate-900">
              Documentación Completa
            </h3>
            <p className="text-slate-600">
              Su documentación clínica ha sido generada y está
              lista para usar
            </p>
            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                onClick={() => handleExport("pdf")}
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Documentación Final
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Iniciar Nuevo Encuentro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a Órdenes
        </Button>
        <div />
      </div>
    </div>
  );
}