'use client';
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Heart,
  Timer,
} from 'lucide-react';
import { useTranslation } from '../../providers/I18nProvider';

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  description,
  priority = 'normal',
}
  ) =>
    {
  const { t } = useTranslation();

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };
  const priorityClasses = {
    high: 'ring-2 ring-red-500',
    medium: 'ring-1 ring-yellow-500',
    normal: '',
  };
  return (
  
    <div
        className={`bg-white rounded-xl shadow-sm border-2 ${colorClasses[color]} p-6 transition-all duration-300 hover:shadow-lg ${priorityClasses[priority]}`}
    >
    {' '}
    <div className="flex items-center justify-between mb-4">
    {' '}
    <div className="flex items-center space-x-3">
    {' '}
    <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
          >
    {' '}
    <Icon className="h-6 w-6" />
    {' '}
    </div>
    {' '}
    <div>
    {' '}
    <h3 className="text-lg font-semibold text-gray-900">
    {title}
    </h3>
    {' '}
            {description && (
              <p className="text-sm text-gray-600">
    {description}
    </p>
            )}{' '}
    </div>
    {' '}
    </div>
    {' '}
        {priority === 'high' && (
          <div className="flex items-center space-x-1">
    {' '}
    <AlertTriangle className="h-4 w-4 text-red-500" />
    {' '}
    <span className="text-xs text-red-600 font-medium">
    {t('metrics.priority_critical')}
    </span>
    {' '}
    </div>
        )}{' '}
    </div>
    {' '}
    <div className="flex items-center justify-between">
    {' '}
    <span className="text-3xl font-bold text-gray-900">
    {value}
    </span>
    {' '}
        {trend && (
          <div
            className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
          >
    {' '}
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}{' '}
    <span className="text-sm font-medium">
    {trendValue}
    </span>
    {' '}
    </div>
        )}{' '}
    </div>
    {' '}
    </div>
  );
};
function DashboardMetrics() {
  const { t } = useTranslation();

  const [metrics, setMetrics] = useState({
    pendingConsultations: 0,
    criticalAlerts: 0,
    averageTime: 0,
    todayConsultations: 0,
    urgentPatients: 0,
    systemEfficiency: 0,
  }
  );

  const [loading, setLoading] = useState(true);
  useEffect(() =>
    {
    const fetchMetrics = async () =>
    {
      try {
        // Simulate API call - replace with actual API endpoints

        const mockData = {
          pendingConsultations: 23,
          criticalAlerts: 5,
          averageTime: 12.4,
          todayConsultations: 47,
          urgentPatients: 8,
          systemEfficiency: 98.2,
        };
        // Simulate loading delay await new Promise(resolve => setTimeout(resolve, 1000));
        setMetrics(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    };
    fetchMetrics();
    // Set up real-time updates every 30 seconds

    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {' '}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
    {' '}
    <div className="flex items-center space-x-3 mb-4">
    {' '}
    <div className="w-12 h-12 bg-gray-200 rounded-lg">
    </div>
    {' '}
    <div className="space-y-2">
    {' '}
    <div className="h-5 bg-gray-200 rounded w-24">
    </div>
    {' '}
    <div className="h-3 bg-gray-200 rounded w-32">
    </div>
    {' '}
    </div>
    {' '}
    </div>
    {' '}
    <div className="h-8 bg-gray-200 rounded w-16">
    </div>
    {' '}
    </div>
        ))}{' '}
    </div>
    );
  }
  return (
    <div className="space-y-4">
    {' '}
      {/* Critical Metrics Row */}{' '}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {' '}
    <MetricCard
          title={t('metrics.pending_consultations')}
          value={metrics.pendingConsultations}
          icon={Calendar}
          color="yellow"
          description={t('metrics.require_immediate_attention')}
          priority={metrics.pendingConsultations > 20 ? 'high' : 'normal'}
          trend={metrics.pendingConsultations > 20 ? 'up' : 'down'}
          trendValue={`${metrics.pendingConsultations > 20 ? '+' : '-'}${Math.abs(metrics.pendingConsultations - 20)}`}
        />
    {' '}
    <MetricCard
          title={t('metrics.critical_alerts')}
          value={metrics.criticalAlerts}
          icon={AlertTriangle}
          color="red"
          description={t('metrics.patients_critical_condition')}
          priority={metrics.criticalAlerts > 0 ? 'high' : 'normal'}
          trend={metrics.criticalAlerts > 3 ? 'up' : 'down'}
          trendValue={`${metrics.criticalAlerts}`}
        />
    {' '}
    <MetricCard
          title={t('metrics.average_time')}
          value={`${metrics.averageTime} min`}
          icon={Timer}
          color="blue"
          description={t('metrics.per_medical_consultation')}
          trend={metrics.averageTime < 15 ? 'down' : 'up'}
          trendValue={`${metrics.averageTime < 15 ? '-' : '+'}${Math.abs(metrics.averageTime - 15).toFixed(1)} min`}
        />
    {' '}
    </div>
    {' '}
      {/* Operational Metrics Row */}{' '}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {' '}
    <MetricCard
          title={t('metrics.consultations_today')}
          value={metrics.todayConsultations}
          icon={Heart}
          color="green"
          description={t('metrics.completed_successfully')}
          trend="up"
          trendValue={`+${Math.floor(metrics.todayConsultations * 0.1)}`}
        />
    {' '}
    <MetricCard
          title={t('metrics.urgent_patients')}
          value={metrics.urgentPatients}
          icon={Users}
          color="purple"
          description={t('metrics.high_priority')}
          priority={metrics.urgentPatients > 10 ? 'medium' : 'normal'}
          trend={metrics.urgentPatients > 5 ? 'up' : 'down'}
          trendValue={`${metrics.urgentPatients}`}
        />
    {' '}
    <MetricCard
          title={t('metrics.system_efficiency')}
          value={`${metrics.systemEfficiency}%`}
          icon={Activity}
          color="green"
          description={t('metrics.operational_performance')}
          trend={metrics.systemEfficiency > 95 ? 'up' : 'down'}
          trendValue={`${metrics.systemEfficiency}%`}
        />
    {' '}
    </div>
    {' '}
      {/* Real-time Status Bar */}{' '}
    <div className="bg-gray-50 rounded-lg p-3">
    {' '}
    <div className="flex items-center justify-between">
    {' '}
    <div className="flex items-center space-x-3">
    {' '}
    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse">
    </div>
    {' '}
    <span className="text-sm font-medium text-gray-900 ">
    {' '}
              {t('metrics.system_active_last_update')}{' '}
              {new Date().toLocaleTimeString()}{' '}
    </span>
    {' '}
    </div>
    {' '}
    <div className="flex items-center space-x-4 text-sm text-gray-600 ">
    {' '}
    <span>
    {t('metrics.api_connected')}
    </span>
    {' '}
    <span>
    {t('metrics.db_stable')}
    </span>
    {' '}
    <span>
    {t('metrics.monitoring_active')}
    </span>
    {' '}
    </div>
    {' '}
    </div>
    {' '}
    </div>
    {' '}
    </div>
  );
}

export { DashboardMetrics };
