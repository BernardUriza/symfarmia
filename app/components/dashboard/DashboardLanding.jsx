"use client";

import React, { useState } from 'react';
import MedicalProductivityMetrics from './MedicalProductivityMetrics';
import DashboardMetrics from './DashboardMetrics';
import EfficiencyChart from './EfficiencyChart';
import QuickActions from './QuickActions';
import PatientWorkflow from '../patient/PatientWorkflow';
import { useI18n } from '@/domains/core/hooks/useI18n';
import { Activity } from 'lucide-react';
import HydrationSafeDateDisplay from '../../../src/components/HydrationSafeDateDisplay';

const DashboardLanding = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState('workflow');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Simplified Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.medical_panel') || 'Panel Médico'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('dashboard.efficient_clinical_management') || 'Sistema de gestión clínica eficiente'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('dashboard.system_active') || 'Sistema Activo'}
                </span>
              </div>
              <HydrationSafeDateDisplay 
                locale="es-ES"
                showTime={true}
                className="text-right"
                fallback={
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Cargando fecha...
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'workflow' ? (
          <PatientWorkflow />
        ) : (
          <>
            {/* Simplified Layout - Medical Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Primary Content - Medical Metrics */}
              <div className="lg:col-span-3 space-y-6">
                {/* Medical Productivity Metrics - PRINCIPAL */}
                <MedicalProductivityMetrics />

                {/* Dashboard Metrics - SECUNDARIA PROMINENTE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {t('dashboard.operational_metrics') || 'Métricas Operacionales en Tiempo Real'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('dashboard.operational_metrics_description') || 'Estado operacional y alertas críticas del sistema médico'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {t('dashboard.live_metrics') || 'En Vivo'}
                      </span>
                    </div>
                  </div>
                  <DashboardMetrics />
                </div>

                {/* Efficiency Chart - TERCIARIA */}
                <EfficiencyChart />
              </div>

              {/* Sidebar - Quick Actions */}
              <div className="lg:col-span-1">
                <QuickActions onStartWorkflow={() => setActiveView('workflow')} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardLanding;