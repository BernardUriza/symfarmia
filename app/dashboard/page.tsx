import React from 'react';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';
import ActionButton from '../../components/ui/ActionButton';
import { UserPlusIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';
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
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-6 ${className}`}>
    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-none">{title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
    
    <div className="px-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
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
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white focus-visible:ring-blue-600/20 focus-visible:ring-[3px] outline-none"
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
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1">
        <h5 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    
    <Link 
      href={href}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white focus-visible:ring-green-600/20 focus-visible:ring-[3px] outline-none w-full"
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
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
      <div className={`w-8 h-8 ${getBgColor()} rounded-lg flex items-center justify-center`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
        <Clock className="h-3 w-3" />
        {time}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header siguiendo el Legacy Design */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Dashboard Médico</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sistema SYMFARMIA</span>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
            <ThemeToggle className="ml-2" />
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
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-6">
              <div className="px-6 pt-6">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Acciones Rápidas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crea nuevos registros médicos</p>
              </div>
              
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Pacientes</h4>
                  <ActionButton
                    onClick={() => window.location.href = '/dashboard/patients?action=new'}
                    text="Crear Paciente"
                    icon={UserPlusIcon}
                    color="emerald"
                    size="md"
                    variant="filled"
                    fullWidth={true}
                    ariaLabel="Create new patient record"
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Reportes</h4>
                  <ActionButton
                    onClick={() => window.location.href = '/dashboard/medicalReports?action=new'}
                    text="Crear Reporte"
                    icon={DocumentTextIcon}
                    color="blue"
                    size="md"
                    variant="filled"
                    fullWidth={true}
                    ariaLabel="Generate new medical report"
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Estudios</h4>
                  <ActionButton
                    onClick={() => window.location.href = '/dashboard/studies?action=new'}
                    text="Programar Estudio"
                    icon={ChartBarIcon}
                    color="purple"
                    size="md"
                    variant="filled"
                    fullWidth={true}
                    ariaLabel="Schedule new medical study"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-6">
              <div className="px-6 pt-6">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Actividad Reciente</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Últimas actualizaciones del sistema</p>
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
                
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link 
                    href="/dashboard/activity"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-6">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Gestión del Sistema</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administración y configuración</p>
            </div>
            
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/dashboard/categories"
                  className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Edit3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Categorías</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gestionar categorías médicas</p>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/study-types"
                  className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tipos de Estudio</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configurar tipos de estudios</p>
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