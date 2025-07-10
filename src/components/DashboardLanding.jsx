"use client";
import React from 'react';
import Link from 'next/link';
// Codex: cleaned demo artifacts and removed test header
import { 
  Users, 
  FileText, 
  Stethoscope, 
  Activity, 
  Calendar, 
  Plus,
  Eye,
  Edit3,
  TrendingUp,
  Clock,
  Mic,
  Play,
  Pause
} from 'lucide-react';

// Simplified dashboard component for demo landing page
const DashboardCard = ({ 
  title, 
  description, 
  icon: Icon, 
  value, 
  href, 
  buttonText = "Ver todos",
  trend,
  className = "" 
}) => (
  <div className={`bg-white border border-slate-200 rounded-xl flex flex-col gap-6 ${className}`}>
    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          title === 'Transcripción IA' 
            ? 'bg-emerald-100' 
            : 'bg-blue-100'
        }`}>
          <Icon className={`h-5 w-5 ${
            title === 'Transcripción IA' 
              ? 'text-emerald-600' 
              : 'text-blue-600'
          }`} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold tracking-tight text-slate-900 leading-none">{title}</h4>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
    
    <div className="px-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-slate-900">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center px-6 pb-6">
      <Link 
        href={href}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 gap-1.5 px-3 text-white outline-none ${
          title === 'Transcripción IA' 
            ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600/20' 
            : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600/20'
        } focus-visible:ring-[3px]`}
      >
        <Eye className="h-4 w-4" />
        {buttonText}
      </Link>
    </div>
  </div>
);

const DashboardLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard Médico - Demo</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Sistema SYMFARMIA</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Demo Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">🧪 Modo Demo</span>
            <span className="text-blue-700">- Explora las funcionalidades del sistema médico</span>
          </div>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Pacientes"
            description="Gestión de pacientes registrados"
            icon={Users}
            value="2,543"
            href="/dashboard/patients"
            buttonText="Ver Pacientes"
            trend="+12% este mes"
          />
          
          <DashboardCard
            title="Reportes Médicos"
            description="Informes y resultados médicos"
            icon={FileText}
            value="1,847"
            href="/dashboard/medicalReports"
            buttonText="Ver Reportes"
            trend="+8% esta semana"
          />
          
          <DashboardCard
            title="Transcripción IA"
            description="Workflow médico completo"
            icon={Mic}
            value="47"
            href="/medical-ai-demo"
            buttonText="Iniciar Workflow"
            trend="3.2h ahorradas hoy"
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          />
          
          <DashboardCard
            title="Estudios"
            description="Estudios médicos realizados"
            icon={Activity}
            value="3,629"
            href="/dashboard/studies"
            buttonText="Ver Estudios"
            trend="+15% este mes"
          />
          
          <DashboardCard
            title="Tipos de Estudio"
            description="Categorías de estudios médicos"
            icon={Stethoscope}
            value="24"
            href="/dashboard/study-types"
            buttonText="Gestionar Tipos"
          />
        </div>

        {/* Demo Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-amber-600 mt-0.5">ℹ️</div>
            <div>
              <h3 className="text-amber-800 font-semibold">Vista de Demostración</h3>
              <p className="text-amber-700 text-sm mt-1">
                Esta es una vista previa del sistema médico SYMFARMIA. En la versión completa, podrás gestionar pacientes, 
                generar reportes médicos, programar estudios y mucho más.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLanding;
