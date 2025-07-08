import React from 'react';
import Link from 'next/link';
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
  Clock
} from 'lucide-react';

// Siguiendo EXACTAMENTE el estilo del Legacy Design
const DashboardCard = ({ 
  title, 
  description, 
  icon: Icon, 
  value, 
  href, 
  buttonText = "Ver todos",
  trend,
  className = "" 
}: {
  title: string;
  description: string;
  icon: any;
  value: string;
  href: string;
  buttonText?: string;
  trend?: string;
  className?: string;
}) => (
  <div className={`bg-white border border-slate-200 rounded-xl flex flex-col gap-6 ${className}`}>
    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-600" />
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
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600/20 focus-visible:ring-[3px] outline-none"
      >
        <Eye className="h-4 w-4" />
        {buttonText}
      </Link>
    </div>
  </div>
);

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  buttonText 
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  buttonText: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-green-600" />
      </div>
      <div className="flex-1">
        <h5 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h5>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    
    <Link 
      href={href}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/20 focus-visible:ring-[3px] outline-none w-full"
    >
      <Plus className="h-4 w-4" />
      {buttonText}
    </Link>
  </div>
);

const RecentActivityItem = ({ 
  title, 
  description, 
  time, 
  type 
}: {
  title: string;
  description: string;
  time: string;
  type: 'patient' | 'report' | 'study';
}) => {
  const getIcon = () => {
    switch (type) {
      case 'patient': return <Users className="h-4 w-4 text-blue-600" />;
      case 'report': return <FileText className="h-4 w-4 text-green-600" />;
      case 'study': return <Activity className="h-4 w-4 text-purple-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'patient': return 'bg-blue-100';
      case 'report': return 'bg-green-100';
      case 'study': return 'bg-purple-100';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className={`w-8 h-8 ${getBgColor()} rounded-lg flex items-center justify-center`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Clock className="h-3 w-3" />
        {time}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header siguiendo el Legacy Design */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard Médico</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Sistema SYMFARMIA</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="p-6">
        {/* Grid de Cards Principales - Siguiendo el estilo Legacy */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Acciones Rápidas */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col gap-6">
              <div className="px-6 pt-6">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Acciones Rápidas</h3>
                <p className="text-sm text-slate-500 mt-1">Crea nuevos registros médicos</p>
              </div>
              
              <div className="px-6 pb-6 space-y-4">
                <QuickActionCard
                  title="Nuevo Paciente"
                  description="Registrar un nuevo paciente"
                  icon={Users}
                  href="/dashboard/patients?action=new"
                  buttonText="Crear Paciente"
                />
                
                <QuickActionCard
                  title="Nuevo Reporte"
                  description="Generar reporte médico"
                  icon={FileText}
                  href="/dashboard/medicalReports?action=new"
                  buttonText="Crear Reporte"
                />
                
                <QuickActionCard
                  title="Programar Estudio"
                  description="Agendar nuevo estudio médico"
                  icon={Calendar}
                  href="/dashboard/studies?action=new"
                  buttonText="Programar"
                />
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col gap-6">
              <div className="px-6 pt-6">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Actividad Reciente</h3>
                <p className="text-sm text-slate-500 mt-1">Últimas actualizaciones del sistema</p>
              </div>
              
              <div className="px-6 pb-6">
                <div className="space-y-1">
                  <RecentActivityItem
                    title="Nuevo paciente registrado"
                    description="María García - ID: 2543"
                    time="hace 5 min"
                    type="patient"
                  />
                  
                  <RecentActivityItem
                    title="Reporte médico generado"
                    description="Análisis de sangre - Dr. Rodríguez"
                    time="hace 15 min"
                    type="report"
                  />
                  
                  <RecentActivityItem
                    title="Estudio completado"
                    description="Resonancia magnética - Sala 3"
                    time="hace 30 min"
                    type="study"
                  />
                  
                  <RecentActivityItem
                    title="Paciente actualizado"
                    description="Carlos Mendoza - Información médica"
                    time="hace 1 hora"
                    type="patient"
                  />
                  
                  <RecentActivityItem
                    title="Nuevo estudio programado"
                    description="Electrocardiograma - Mañana 10:00 AM"
                    time="hace 2 horas"
                    type="study"
                  />
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link 
                    href="/dashboard/activity"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 hover:bg-slate-100 text-slate-700"
                  >
                    Ver toda la actividad
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de Categorías */}
        <div className="mt-8">
          <div className="bg-white border border-slate-200 rounded-xl flex flex-col gap-6">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Gestión del Sistema</h3>
              <p className="text-sm text-slate-500 mt-1">Administración y configuración</p>
            </div>
            
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/dashboard/categories"
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Edit3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Categorías</h4>
                    <p className="text-xs text-slate-500">Gestionar categorías médicas</p>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/study-types"
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Tipos de Estudio</h4>
                    <p className="text-xs text-slate-500">Configurar tipos de estudios</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}