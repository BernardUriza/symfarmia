"use client";

import React, { useState } from 'react';
import MedicalProductivityMetrics from './MedicalProductivityMetrics';
import DashboardMetrics from './DashboardMetrics';
import EfficiencyChart from './EfficiencyChart';
import QuickActions from './QuickActions';
import PatientWorkflow from '../patient/PatientWorkflow';
import { useI18n } from '@/domains/core';
import { Activity } from 'lucide-react';
import HydrationSafeDateDisplay from '../../../src/components/HydrationSafeDateDisplay';
import { LogoutButton } from '../layout';

const DashboardLanding = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState('workflow');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-medical-surface to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-950 transition-all duration-500">
      {/* Medical-Grade Header with Backdrop Blur */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 
                         border-b border-gray-200/50 dark:border-gray-700/50 
                         shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 @container">
          <div className="flex justify-between items-center py-4 @lg:py-6">
            <div className="group perspective-1000">
              <div className="transform transition-all duration-500 hover:scale-105">
                <h1 className="text-2xl @md:text-3xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent 
                               bg-clip-text text-transparent animate-gradient">
                  {t('medical_panel') || 'Panel Médico'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 @sm:text-sm @md:text-base">
                  {t('efficient_clinical_management') || 'Sistema de gestión clínica eficiente'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl 
                              bg-gradient-to-r from-green-500/10 to-emerald-500/10 
                              dark:from-green-500/20 dark:to-emerald-500/20
                              border border-green-500/20 dark:border-green-500/30">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t('system_active') || 'Sistema Activo'}
                </span>
              </div>
              <LogoutButton />
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

      {/* Main Content with Container Queries */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 @container medical-dashboard">
        {activeView === 'workflow' ? (
          <PatientWorkflow />
        ) : (
          <>
            {/* Responsive Layout with Container Queries */}
            <div className="grid @lg:grid-cols-3 @xl:grid-cols-4 gap-6">
              {/* Primary Content - Medical Metrics */}
              <div className="@lg:col-span-2 @xl:col-span-3 space-y-6">
                {/* Medical Productivity Metrics - PRINCIPAL */}
                <MedicalProductivityMetrics />

                {/* Dashboard Metrics - Advanced Card with 3D Effects */}
                <div className="group perspective-1000">
                  <div className="transform-3d rotate-x-1 hover:rotate-x-0 transition-all duration-700
                                  bg-white dark:bg-gray-800 rounded-2xl 
                                  shadow-lg hover:shadow-2xl
                                  border-2 border-blue-200/50 dark:border-blue-800/50 
                                  hover:border-medical-primary/50 dark:hover:border-medical-accent/50
                                  p-6 relative overflow-hidden">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                                    translate-x-[-100%] group-hover:translate-x-[100%] 
                                    transition-transform duration-1000 ease-out"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 
                                       dark:from-blue-900/30 dark:to-indigo-900/30 
                                       rounded-xl shadow-inner">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {t('operational_metrics') || 'Métricas Operacionales en Tiempo Real'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('operational_metrics_description') || 'Estado operacional y alertas críticas del sistema médico'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {t('live_metrics') || 'En Vivo'}
                      </span>
                    </div>
                  </div>
                    <DashboardMetrics />
                  </div>
                </div>

                {/* Efficiency Chart - TERCIARIA */}
                <EfficiencyChart />
              </div>

              {/* Sidebar - Quick Actions with Container Query */}
              <div className="@lg:col-span-1">
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