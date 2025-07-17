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
import dynamic from 'next/dynamic';

// Lazy load the WhisperPreloader to avoid loading it on initial render
const WhisperPreloaderGlobal = dynamic(
  () => import('@/src/domains/medical-ai/components/WhisperPreloaderGlobal'),
  { ssr: false }
);

const DashboardLanding = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState('workflow');

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Medical-Grade Header with Modern Glassmorphism */}
      <header className="sticky top-0 z-50 glass border-b border-border 
                         backdrop-blur-xl shadow-sm animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 @container">
          <div className="flex justify-between items-center py-4 @lg:py-6">
            <div className="group perspective-1000">
              <div className="transform transition-smooth hover:scale-105">
                <h1 className="text-2xl @md:text-3xl font-bold text-gradient animate-float">
                  {t('medical_panel') || 'Panel Médico'}
                </h1>
                <p className="text-foreground/60 mt-1 @sm:text-sm @md:text-base">
                  {t('efficient_clinical_management') || 'Sistema de gestión clínica eficiente'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="badge-modern badge-success glass">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
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
                    <div className="text-sm text-gray-500">
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

                {/* Dashboard Metrics - Modern Card with Glassmorphism */}
                <div className="group animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="stat-card glass hover:shadow-glow 
                                  transition-smooth transform hover:scale-[1.02]">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent
                                    translate-x-[-100%] group-hover:translate-x-[100%] 
                                    transition-transform duration-[2s] ease-out pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-secondary/20 to-accent/20 
                                       rounded-xl shadow-inner backdrop-blur-sm">
                        <Activity className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {t('operational_metrics') || 'Métricas Operacionales en Tiempo Real'}
                        </h2>
                        <p className="text-sm text-foreground/60">
                          {t('operational_metrics_description') || 'Estado operacional y alertas críticas del sistema médico'}
                        </p>
                      </div>
                    </div>
                    <div className="badge-modern badge-success animate-fade-in">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold">
                        {t('live_metrics') || 'EN VIVO'}
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
      
      {/* Preload Whisper model globally */}
      <WhisperPreloaderGlobal />
    </div>
  );
};

export default DashboardLanding;