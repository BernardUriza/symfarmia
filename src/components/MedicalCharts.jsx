'use client';
import React, { useState } from 'react';
import { useTranslation } from '../providers/I18nProvider';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  UsersIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const MedicalCharts = ({ section = 'overview' }
  ) =>
    {
  const { t } = useTranslation();

  const [selectedChart, setSelectedChart] = useState('diagnoses');

  const chartOptions = {
    overview: [
      { id: 'diagnoses', name: t('common_diagnoses'), icon: ChartPieIcon },
      {
        id: 'outcomes',
        name: t('treatment_outcomes'),
        icon: ArrowTrendingUpIcon,
      },
      { id: 'demographics', name: t('patient_demographics'), icon: UsersIcon },
      { id: 'trends', name: t('seasonal_trends'), icon: CalendarDaysIcon },
    ],
    patients: [
      { id: 'demographics', name: t('patient_demographics'), icon: UsersIcon },
      { id: 'satisfaction', name: t('patient_satisfaction'), icon: HeartIcon },
      { id: 'trends', name: t('seasonal_trends'), icon: CalendarDaysIcon },
    ],
    clinical: [
      { id: 'diagnoses', name: t('common_diagnoses'), icon: ChartPieIcon },
      {
        id: 'outcomes',
        name: t('treatment_outcomes'),
        icon: ArrowTrendingUpIcon,
      },
      { id: 'adherence', name: t('medication_adherence'), icon: ChartBarIcon },
    ],
    reports: [
      { id: 'revenue', name: t('revenue_this_month'), icon: ChartBarIcon },
      { id: 'costs', name: t('cost_per_patient'), icon: ArrowTrendingUpIcon },
      {
        id: 'efficiency',
        name: t('operational_efficiency'),
        icon: ChartPieIcon,
      },
    ],
  };
  const currentOptions = chartOptions[section] || chartOptions.overview;

  const getMockChartData = () =>
    {
    switch (selectedChart) {
      case 'diagnoses':
        return {
          title: t('common_diagnoses'),
          type: 'pie',
          data: [
            { name: 'Hypertension', value: 28, color: '#3B82F6' },
            { name: 'Diabetes Type 2', value: 22, color: '#10B981' },
            { name: 'Respiratory Infections', value: 18, color: '#F59E0B' },
            { name: 'Arthritis', value: 15, color: '#EF4444' },
            { name: 'Cardiovascular Disease', value: 12, color: '#8B5CF6' },
            { name: 'Others', value: 5, color: '#6B7280' },
          ],
        };
      case 'outcomes':
        return {
          title: t('treatment_outcomes'),
          type: 'bar',
          data: [
            { name: 'Excellent', value: 45, color: '#10B981' },
            { name: 'Good', value: 32, color: '#3B82F6' },
            { name: 'Fair', value: 18, color: '#F59E0B' },
            { name: 'Poor', value: 5, color: '#EF4444' },
          ],
        };
      case 'demographics':
        return {
          title: t('patient_demographics'),
          type: 'bar',
          data: [
            { name: '0-18 years', value: 15, color: '#8B5CF6' },
            { name: '19-30 years', value: 25, color: '#3B82F6' },
            { name: '31-50 years', value: 35, color: '#10B981' },
            { name: '51-70 years', value: 45, color: '#F59E0B' },
            { name: '70+ years', value: 20, color: '#EF4444' },
          ],
        };
      case 'trends':
        return {
          title: t('seasonal_trends'),
          type: 'line',
          data: [
            { month: 'Jan', patients: 120, revenue: 45000 },
            { month: 'Feb', patients: 135, revenue: 48000 },
            { month: 'Mar', patients: 150, revenue: 52000 },
            { month: 'Apr', patients: 142, revenue: 49000 },
            { month: 'May', patients: 168, revenue: 58000 },
            { month: 'Jun', patients: 185, revenue: 62000 },
          ],
        };
      default:
        return {
          title: t('common_diagnoses'),
          type: 'pie',
          data: [
            { name: 'Hypertension', value: 28, color: '#3B82F6' },
            { name: 'Diabetes Type 2', value: 22, color: '#10B981' },
            { name: 'Respiratory Infections', value: 18, color: '#F59E0B' },
            { name: 'Others', value: 32, color: '#6B7280' },
          ],
        };
    }
  };
  const chartData = getMockChartData();

  const renderPieChart = (data) => (
    <div className="flex items-center justify-center h-64">
    {' '}
    <div className="relative">
    {' '}
    <svg width="200" height="200" viewBox="0 0 200 200">
    {' '}
          {data.data.map((item, index) =>
    {
            const total = data.data.reduce((sum, d) => sum + d.value, 0);
            //

            const percentage = (item.value / total) * 100;

            const angle = (item.value / total) * 360;

            const previousAngles = data.data
              .slice(0, index)
              .reduce((sum, d) => sum + (d.value / total) * 360, 0);

            const startAngle = previousAngles - 90;

            const endAngle = startAngle + angle;

            const largeArcFlag = angle > 180 ? 1 : 0;

            const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);

            const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);

            const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);

            const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

            const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            return (
  
              <path
                key={index}
                d={pathData}
                fill={item.color}
                className="hover:opacity-80 transition-opacity"
              />
            );
          }
  )}{' '}
    </svg>
    {' '}
    </div>
    {' '}
    <div className="ml-8 space-y-2">
    {' '}
        {data.data.map((item, index) => (
          <div key={index} className="flex items-center">
    {' '}
    <div
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            >
    </div>
    {' '}
    <span className="text-sm text-gray-700 ">
    {item.name}
    </span>
    {' '}
    <span className="ml-auto text-sm font-medium text-gray-900 ">
    {item.value}%
            </span>
    {' '}
    </div>
        ))}{' '}
    </div>
    {' '}
    </div>
  );

  const renderBarChart = (data) => (
    <div className="h-64 flex items-end justify-center space-x-4 p-4">
    {' '}
      {data.data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
    {' '}
    <div
            className="w-16 rounded-t-lg transition-all duration-300 hover:opacity-80"
            style={{
              height: `${(item.value / Math.max(...data.data.map((d) => d.value))) * 200}px`,
              backgroundColor: item.color,
            }}
          >
    </div>
    {' '}
    <span className="text-xs text-gray-600 mt-2 text-center">
    {item.name}
    </span>
    {' '}
    <span className="text-xs font-medium text-gray-900 ">
    {item.value}%
          </span>
    {' '}
    </div>
      ))}{' '}
    </div>
  );

  const renderLineChart = (data) => (
    <div className="h-64 flex items-end justify-center p-4">
    {' '}
    <div className="relative w-full h-full">
    {' '}
    <svg width="100%" height="100%" viewBox="0 0 400 200">
    {' '}
          {/* Grid lines */}{' '}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={40 * i}
              x2="400"
              y2={40 * i}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}{' '}
          {/* Data line */}{' '}
    <polyline
            points={data.data
              .map(
                (d, i) =>
                  `${(i * 400) / (data.data.length - 1)},${200 - (d.patients / 200) * 180}`,
              )
              .join(' ')}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
          />
    {' '}
          {/* Data points */}{' '}
          {data.data.map((d, i) => (
            <circle
              key={i}
              cx={(i * 400) / (data.data.length - 1)}
              cy={200 - (d.patients / 200) * 180}
              r="4"
              fill="#3B82F6"
            />
          ))}{' '}
    </svg>
    {' '}
        {/* X-axis labels */}{' '}
    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 ">
    {' '}
          {data.data.map((d, i) => (
            <span key={i}>
    {d.month}
    </span>
          ))}{' '}
    </div>
    {' '}
    </div>
    {' '}
    </div>
  );

  const renderChart = () =>
    {
    switch (chartData.type) {
      case 'pie':
        return renderPieChart(chartData);
      case 'bar':
        return renderBarChart(chartData);
      case 'line':
        return renderLineChart(chartData);
      default:
        return renderPieChart(chartData);
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {' '}
      {/* Chart Selection */}{' '}
    <div className="lg:col-span-1">
    {' '}
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 ">
    {' '}
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chart Selection
          </h3>
    {' '}
    <div className="space-y-2">
    {' '}
            {currentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedChart(option.id)}
                          className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${selectedChart === option.id ? 'bg-blue-50 text-blue-700 border border-blue-200 ' : 'text-gray-700 hover:bg-gray-50 '}`}
              >
    {' '}
    <option.icon className="w-5 h-5 mr-3" />
    {option.name}{' '}
    </button>
            ))}{' '}
    </div>
    {' '}
    </div>
    {' '}
    </div>
    {' '}
      {/* Chart Display */}{' '}
    <div className="lg:col-span-2">
    {' '}
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 ">
    {' '}
    <div className="flex items-center justify-between mb-6">
    {' '}
    <h3 className="text-lg font-semibold text-gray-900 ">
    {chartData.title}
    </h3>
    {' '}
    <div className="flex items-center text-sm text-gray-500 ">
    {' '}
    <CalendarDaysIcon className="w-4 h-4 mr-1" /> Last 30 days{' '}
    </div>
    {' '}
    </div>
    {' '}
          {renderChart()}{' '}
    </div>
    {' '}
    </div>
    {' '}
    </div>
  );
};

export default MedicalCharts;
