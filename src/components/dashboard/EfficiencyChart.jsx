"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { 
 
  BarChart3, 
  Activity, 
  DollarSign,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import { useI18n } from '@/domains/core';
import { generateCompleteMockData } from '../../data/mockMedicalData';
import { calculateWeeklyTrend } from '../../lib/utils/metrics/MedicalKPICalculator';

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.unit && ` ${entry.unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Chart Type Selector
 */
const ChartTypeSelector = ({ activeType, onTypeChange }) => {
  const { t } = useI18n();
  
  const chartTypes = [
    { id: 'consultations', label: t('charts.consultations_trend'), icon: Users },
    { id: 'time', label: t('charts.time_efficiency'), icon: Clock },
    { id: 'income', label: t('charts.revenue_trend'), icon: DollarSign },
    { id: 'automation', label: t('charts.automation_progress'), icon: FileText }
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {chartTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeType === type.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <type.icon className="h-4 w-4" />
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Consultations Trend Chart
 */
const ConsultationsTrendChart = ({ data }) => {
  const { t } = useI18n();
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="week" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Legend />
        <Bar 
          dataKey="consultations" 
          fill="#3B82F6" 
          name={t('charts.weekly_consultations')}
          radius={[4, 4, 0, 0]}
        />
        <Line 
          type="monotone" 
          dataKey="avgPerDay" 
          stroke="#10B981" 
          strokeWidth={3}
          name={t('charts.daily_average')}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/**
 * Time Efficiency Chart
 */
const TimeEfficiencyChart = ({ data }) => {
  const { t } = useI18n();
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="week" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="timeSavedHours" 
          stroke="#F59E0B" 
          fill="#FEF3C7" 
          name={t('charts.time_saved_hours')}
        />
        <Line 
          type="monotone" 
          dataKey="avgConsultationTime" 
          stroke="#DC2626" 
          strokeWidth={2}
          name={t('charts.avg_consultation_time')}
          dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * Revenue Trend Chart
 */
const RevenueTrendChart = ({ data }) => {
  const { t } = useI18n();
  
  const formatCurrency = (value) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="week" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={formatCurrency}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
          formatter={[(value) => [`$${value.toLocaleString('es-MX')} MXN`, '']]}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10B981" 
          fill="#D1FAE5" 
          name={t('charts.weekly_revenue')}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * Automation Progress Chart
 */
const AutomationProgressChart = ({ data }) => {
  const { t } = useI18n();
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="week" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="automationRatio" 
          stroke="#8B5CF6" 
          strokeWidth={3}
          name={t('charts.automation_percentage')}
          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="efficiency" 
          stroke="#06B6D4" 
          strokeWidth={2}
          name={t('charts.efficiency_score')}
          dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Chart Statistics Summary
 */
const ChartStatistics = ({ data, chartType }) => {
  const { t } = useI18n();
  
  const getStatistics = () => {
    switch (chartType) {
      case 'consultations':
        const totalConsultations = data.reduce((sum, week) => sum + week.consultations, 0);
        const avgPerWeek = totalConsultations / data.length;
        const trend = data[data.length - 1].consultations - data[0].consultations;
        return {
          title: t('charts.consultations_stats'),
          stats: [
            { label: t('charts.total_consultations'), value: totalConsultations },
            { label: t('charts.avg_per_week'), value: Math.round(avgPerWeek) },
            { label: t('charts.trend'), value: trend > 0 ? `+${trend}` : trend }
          ]
        };
      
      case 'time':
        const totalTimeSaved = data.reduce((sum, week) => sum + (week.timeSavedHours || 0), 0);
        const avgTimeSaved = totalTimeSaved / data.length;
        return {
          title: t('charts.time_stats'),
          stats: [
            { label: t('charts.total_time_saved'), value: `${totalTimeSaved.toFixed(1)} hrs` },
            { label: t('charts.avg_time_saved'), value: `${avgTimeSaved.toFixed(1)} hrs` },
            { label: t('charts.time_trend'), value: t('charts.improving') }
          ]
        };
      
      case 'income':
        const totalRevenue = data.reduce((sum, week) => sum + week.revenue, 0);
        const avgRevenue = totalRevenue / data.length;
        return {
          title: t('charts.revenue_stats'),
          stats: [
            { label: t('charts.total_revenue'), value: `$${totalRevenue.toLocaleString('es-MX')}` },
            { label: t('charts.avg_weekly_revenue'), value: `$${avgRevenue.toLocaleString('es-MX')}` },
            { label: t('charts.growth_potential'), value: t('charts.high') }
          ]
        };
      
      case 'automation':
        const currentAutomation = data[data.length - 1]?.automationRatio || 0;
        const initialAutomation = data[0]?.automationRatio || 0;
        const improvement = currentAutomation - initialAutomation;
        return {
          title: t('charts.automation_stats'),
          stats: [
            { label: t('charts.current_automation'), value: `${currentAutomation}%` },
            { label: t('charts.improvement'), value: `+${improvement}%` },
            { label: t('charts.efficiency_level'), value: t('charts.excellent') }
          ]
        };
      
      default:
        return { title: '', stats: [] };
    }
  };
  
  const statistics = getStatistics();
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{statistics.title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statistics.stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Efficiency Chart Component
 */
function EfficiencyChart({ 
  dataType = 'consultations', 
  timeRange = 'month', 
  showStatistics = true 
}) {
  const { t } = useI18n();
  const [chartType, setChartType] = useState(dataType);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Generate mock data
        const mockData = generateCompleteMockData();
        
        // Calculate weekly trend
        const weeklyTrend = calculateWeeklyTrend(mockData.consultations);
        
        // Add additional data for charts
        const enhancedData = weeklyTrend.map((week, index) => ({
          ...week,
          timeSavedHours: 1.5 + (index * 0.3), // Progressive improvement
          automationRatio: 45 + (index * 10),  // Automation growth
          avgConsultationTime: 18 - (index * 1.2) // Efficiency improvement
        }));
        
        setChartData(enhancedData);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [timeRange]);
  
  const renderChart = () => {
    switch (chartType) {
      case 'consultations':
        return <ConsultationsTrendChart data={chartData} />;
      case 'time':
        return <TimeEfficiencyChart data={chartData} />;
      case 'income':
        return <RevenueTrendChart data={chartData} />;
      case 'automation':
        return <AutomationProgressChart data={chartData} />;
      default:
        return <ConsultationsTrendChart data={chartData} />;
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              {t('charts.error_loading_chart')}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('charts.efficiency_trends')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('charts.weekly_performance_analysis')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600 dark:text-green-400">
            {t('charts.live_data')}
          </span>
        </div>
      </div>
      
      {/* Chart Type Selector */}
      <div className="mb-6">
        <ChartTypeSelector 
          activeType={chartType} 
          onTypeChange={setChartType} 
        />
      </div>
      
      {/* Chart */}
      <div className="mb-6">
        {renderChart()}
      </div>
      
      {/* Statistics */}
      {showStatistics && (
        <ChartStatistics data={chartData} chartType={chartType} />
      )}
    </div>
  );
}

export { EfficiencyChart };