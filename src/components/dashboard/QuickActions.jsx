"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileText, 
  Heart,
  Stethoscope,
  Activity,
  Search,
  UserPlus,
  Phone,
  ArrowRight
} from 'lucide-react';

const QuickActionButton = ({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  color = "blue",
  priority = "normal",
  badge = null,
  onClick = null
}) => {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white"
  };

  const priorityRings = {
    high: "ring-2 ring-red-400 ring-offset-2",
    medium: "ring-1 ring-yellow-400 ring-offset-1",
    normal: ""
  };

  const ButtonContent = () => (
    <div className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${colorClasses[color]} ${priorityRings[priority]} hover:shadow-lg transform hover:scale-105`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs opacity-90">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {badge && (
          <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
            {badge}
          </span>
        )}
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full">
        <ButtonContent />
      </button>
    );
  }

  return (
    <Link href={href} className="w-full">
      <ButtonContent />
    </Link>
  );
};

const QuickActions = ({ onStartWorkflow }) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [pendingCount] = useState(23);
  const [urgentCount] = useState(5);

  const handleEmergencyProtocol = () => {
    setShowEmergencyModal(true);
  };

  const EmergencyModal = () => {
    if (!showEmergencyModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Protocolo de Emergencia</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activación inmediata</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <Link 
              href="/dashboard/patients?filter=emergency"
              className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              onClick={() => setShowEmergencyModal(false)}
            >
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Ver Pacientes Críticos</span>
              </div>
              <ArrowRight className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Link>
            
            <Link 
              href="/dashboard/patients?action=emergency-new"
              className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              onClick={() => setShowEmergencyModal(false)}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Nuevo Paciente Urgente</span>
              </div>
              <ArrowRight className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Link>
            
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Emergencias: 911</span>
              </div>
              <button className="text-xs bg-red-600 text-white px-2 py-1 rounded">LLAMAR</button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowEmergencyModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <Link 
              href="/consultation?mode=emergency"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
              onClick={() => setShowEmergencyModal(false)}
            >
              Consulta Urgente
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="@container bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6
                      backdrop-blur-sm relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Sistema activo</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <QuickActionButton
            onClick={onStartWorkflow}
            icon={Plus}
            title="Nueva Consulta"
            description="Iniciar flujo de trabajo"
            color="blue"
            priority="normal"
          />
          
          <QuickActionButton
            onClick={handleEmergencyProtocol}
            icon={AlertTriangle}
            title="Paciente Urgente"
            description="Protocolo de emergencia"
            color="red"
            priority="high"
            badge={urgentCount > 0 ? urgentCount : null}
          />
          
          <QuickActionButton
            href="/dashboard/patients?filter=pending"
            icon={Clock}
            title="Revisar Pendientes"
            description="Consultas por atender"
            color="yellow"
            priority="medium"
            badge={pendingCount > 0 ? pendingCount : null}
          />
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gestión de Pacientes</h3>
        
        <div className="space-y-3">
          <QuickActionButton
            href="/dashboard/patients?action=new"
            icon={UserPlus}
            title="Registrar Paciente"
            description="Nuevo ingreso al sistema"
            color="green"
          />
          
          <QuickActionButton
            href="/dashboard/patients?action=search"
            icon={Search}
            title="Buscar Paciente"
            description="Localizar historial médico"
            color="purple"
          />
          
          <QuickActionButton
            href="/dashboard/medicalReports?action=new"
            icon={FileText}
            title="Nuevo Reporte"
            description="Generar reporte médico"
            color="blue"
          />
        </div>
      </div>

      {/* Clinical Workflow */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flujo Clínico</h3>
        
        <div className="space-y-3">
          <QuickActionButton
            href="/dashboard/studies?action=schedule"
            icon={Calendar}
            title="Programar Estudios"
            description="Agendar procedimientos"
            color="purple"
          />
          
          <QuickActionButton
            href="/dashboard/studies?filter=today"
            icon={Activity}
            title="Estudios del Día"
            description="Procedimientos programados"
            color="green"
          />
          
          <QuickActionButton
            href="/consultation?mode=follow-up"
            icon={Stethoscope}
            title="Seguimiento"
            description="Revisión de pacientes"
            color="blue"
          />
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal />
    </div>
  );
};

export default QuickActions;