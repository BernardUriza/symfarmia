"use client";

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FileText, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown,
  Info,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { useI18n } from '@/domains/core';
import { calculateMexicanPrivatePracticeKPIs } from '../../lib/utils/metrics/MedicalKPICalculator';
import { generateCompleteMockData } from '../../data/mockMedicalData';

/**
 * Individual Metric Card Component
 */
const MetricCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  target, 
  icon: Icon, 
  color = 'blue',
  description,
  isEconomic = false
}) => {
  const { t } = useI18n();
  
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  };
  
  const formatValue = (val) => {
    if (isEconomic && unit === 'MXN') {
      return val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }
    return val;
  };
  
  const getTrendIcon = () => {
    if (!trend || trend === 0) return null;
    return trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };
  
  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };
  
  const getTargetStatus = () => {
    if (!target) return null;
    const percentage = (value / target) * 100;
    if (percentage >= 100) return { icon: Award, color: 'text-green-600', text: t('productivity.target_achieved') };
    if (percentage >= 80) return { icon: Target, color: 'text-orange-600', text: t('productivity.near_target') };
    return { icon: TrendingUp, color: 'text-blue-600', text: t('productivity.improving') };
  };
  
  const targetStatus = getTargetStatus();
  
  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            {description && (
              <p className="text-xs opacity-75">{description}</p>
            )}
          </div>
        </div>
        {targetStatus && (
          <div className="flex items-center space-x-1">
            <targetStatus.icon className={`h-4 w-4 ${targetStatus.color}`} />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold">{formatValue(value)}</span>
            {unit && !isEconomic && <span className="text-sm opacity-75">{unit}</span>}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend)}{unit && !isEconomic ? unit : ''}</span>
              <span className="opacity-75">vs {t('productivity.previous_period')}</span>
            </div>
          )}
        </div>
        
        {target && (
          <div className="text-right">
            <div className="text-xs opacity-75">{t('productivity.target')}</div>
            <div className="text-sm font-medium">{target}{unit && !isEconomic ? unit : ''}</div>
          </div>
        )}
      </div>
    </div>
  );
};


/**
 * Economic Impact Section
 */
const EconomicImpact = ({ metrics }) => {
  const { t } = useI18n();
  
  const formatCurrency = (value) => {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };
  
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
              {t('productivity.economic_impact')}
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {t('productivity.economic_impact_description')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {t('productivity.roi_boost')}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('productivity.daily_additional_revenue')}</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(metrics.economicImpact.dailyAdditionalRevenue)}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('productivity.monthly_additional_revenue')}</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(metrics.economicImpact.monthlyAdditionalRevenue)}
              </p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('productivity.additional_consultations')}</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {metrics.coreMetrics.additionalConsultations}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('productivity.per_day')}</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-emerald-600" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            <strong>{t('productivity.key_insight')}</strong> {t('productivity.time_saved_message', { hours: metrics.coreMetrics.timeSaved.hours })}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Medical Productivity Metrics Component
 */
const MedicalProductivityMetrics = ({ timeRange = 'today', showEconomicMetrics = true }) => {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Generate mock data for demonstration
        const mockData = generateCompleteMockData();
        
        // Calculate KPIs
        const kpis = calculateMexicanPrivatePracticeKPIs({
          consultations: mockData.consultations,
          notes: mockData.notes,
          targetDate: new Date(),
          previousPeriodData: mockData.comparisonData.previousMonth
        });
        
        setMetrics(kpis);
      } catch (err) {
        console.error('Error loading medical metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
  }, [timeRange]);
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center space-x-2">
          <div className="text-red-600 dark:text-red-400">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              {t('productivity.error_loading_metrics')}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!metrics) {
    return null;
  }
  
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('productivity.medical_productivity_metrics')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('productivity.medical_productivity_description')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('productivity.live_metrics')}
            </span>
          </div>
        </div>
        
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t('productivity.avg_consultation_time')}
            value={metrics.coreMetrics.avgConsultationTime}
            unit="min"
            trend={metrics.trends.comparisons?.avgConsultationTime}
            target={15}
            icon={Clock}
            color="blue"
            description={t('productivity.avg_consultation_time_desc')}
          />
          
          <MetricCard
            title={t('productivity.automatic_notes_ratio')}
            value={metrics.coreMetrics.automaticNotesRatio}
            unit="%"
            trend={metrics.trends.comparisons?.automaticNotesRatio}
            target={80}
            icon={FileText}
            color="green"
            description={t('productivity.automatic_notes_ratio_desc')}
          />
          
          <MetricCard
            title={t('productivity.daily_patient_count')}
            value={metrics.coreMetrics.dailyPatientCount}
            unit="pacientes"
            trend={metrics.trends.comparisons?.dailyPatientCount}
            target={25}
            icon={Users}
            color="purple"
            description={t('productivity.daily_patient_count_desc')}
          />
          
          <MetricCard
            title={t('productivity.time_saved')}
            value={metrics.coreMetrics.timeSaved.hours}
            unit="hrs"
            trend={metrics.trends.comparisons?.timeSavedHours}
            target={2}
            icon={Zap}
            color="orange"
            description={t('productivity.time_saved_desc')}
          />
        </div>
      </div>
      
      {/* Economic Impact Section */}
      {showEconomicMetrics && (
        <EconomicImpact metrics={metrics} />
      )}
      
      {/* Insights & Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('productivity.key_insights')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {t('productivity.productivity_gain')}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('productivity.productivity_gain_message', { percentage: metrics.insights.productivityGain })}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                {t('productivity.capacity_increase')}
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {t('productivity.capacity_increase_message', { percentage: metrics.insights.capacityIncrease })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalProductivityMetrics;