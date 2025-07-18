"use client"
import React, { useState } from 'react';
import { useTranslation } from '../providers/I18nProvider';
import { useAppMode } from '../providers/AppModeProvider';
import ThemeToggle from './layout/ThemeToggle';
import MedicalKPICards from './MedicalKPICards';
import MedicalCharts from './MedicalCharts';
import AIChat from './AIChat';
import { 
  ChartBarIcon, 
  HeartIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  SparklesIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { isDemoMode } = useAppMode();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: t('overview'), icon: ChartBarIcon },
    { id: 'patients', name: t('patient_analytics'), icon: UserGroupIcon },
    { id: 'clinical', name: t('clinical_metrics'), icon: HeartIcon },
    { id: 'reports', name: t('reports_analysis'), icon: DocumentTextIcon },
    { id: 'ai-insights', name: t('ai_insights'), icon: SparklesIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <HomeIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Back to Home</span>
              </a>
              <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="ml-6 text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">SYMFARMIA</span>
                <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">Analytics</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {isDemoMode && (
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  Demo Mode
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('medical_analytics_overview')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('comprehensive_medical_insights')}</p>
              </div>
              <div className="flex items-center gap-4">
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 12 months</option>
                  <option>All time</option>
                </select>
              </div>
            </div>
            <MedicalKPICards />
            <MedicalCharts />
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('patient_analytics')}</h2>
            <MedicalKPICards section="patients" />
            <MedicalCharts section="patients" />
          </div>
        )}

        {activeTab === 'clinical' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('clinical_metrics')}</h2>
            <MedicalKPICards section="clinical" />
            <MedicalCharts section="clinical" />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports_analysis')}</h2>
            <MedicalKPICards section="reports" />
            <MedicalCharts section="reports" />
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('ai_medical_insights')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('ai_powered_clinical_analysis')}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                <SparklesIcon className="w-5 h-5" />
                <span className="text-sm font-medium">AI Powered</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AIChat />
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quick_insights')}</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-200">{t('diabetes_trend_up')}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-900 dark:text-green-200">{t('treatment_adherence_improved')}</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-sm text-amber-900 dark:text-amber-200">{t('follow_up_required')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('suggested_actions')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('schedule_preventive_care')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('review_medication_protocols')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('update_treatment_plans')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;