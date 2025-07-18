'use client';
import React from 'react';
import { useTranslation } from '../providers/I18nProvider';
import {
  UserGroupIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  FaceSmileIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const MedicalKPICards = ({ section = 'overview' }) => {
  const { t } = useTranslation();

  const getKPIData = () => {
    switch (section) {
      case 'patients':
        return [
          {
            title: t('total_patients_treated'),
            value: '1,247',
            change: '+8.2%',
            changeType: 'increase',
            icon: UserGroupIcon,
            color: 'blue',
            description: 'Total patients treated this month',
          },
          {
            title: t('active_treatments'),
            value: '342',
            change: '+12.5%',
            changeType: 'increase',
            icon: HeartIcon,
            color: 'green',
            description: 'Currently active treatment plans',
          },
          {
            title: t('patient_satisfaction'),
            value: '94.2%',
            change: '+2.1%',
            changeType: 'increase',
            icon: FaceSmileIcon,
            color: 'purple',
            description: 'Patient satisfaction rating',
          },
          {
            title: t('avg_treatment_time'),
            value: '24.5',
            change: '-5.3%',
            changeType: 'decrease',
            icon: ClockIcon,
            color: 'orange',
            description: 'Average treatment time in days',
          },
        ];
      case 'clinical':
        return [
          {
            title: t('diagnosis_accuracy'),
            value: '96.8%',
            change: '+1.2%',
            changeType: 'increase',
            icon: ClipboardDocumentCheckIcon,
            color: 'green',
            description: 'Diagnostic accuracy rate',
          },
          {
            title: t('recovery_rate'),
            value: '87.3%',
            change: '+3.4%',
            changeType: 'increase',
            icon: ArrowTrendingUpIcon,
            color: 'blue',
            description: 'Patient recovery rate',
          },
          {
            title: t('medication_adherence'),
            value: '82.1%',
            change: '+6.7%',
            changeType: 'increase',
            icon: ShieldCheckIcon,
            color: 'purple',
            description: 'Medication adherence rate',
          },
          {
            title: t('readmission_rate'),
            value: '4.2%',
            change: '-1.8%',
            changeType: 'decrease',
            icon: ArrowTrendingDownIcon,
            color: 'red',
            description: '30-day readmission rate',
          },
        ];
      case 'reports':
        return [
          {
            title: t('revenue_this_month'),
            value: '$124,500',
            change: '+15.3%',
            changeType: 'increase',
            icon: CurrencyDollarIcon,
            color: 'green',
            description: 'Monthly revenue generated',
          },
          {
            title: t('cost_per_patient'),
            value: '$385',
            change: '-2.7%',
            changeType: 'decrease',
            icon: ChartBarIcon,
            color: 'blue',
            description: 'Average cost per patient',
          },
          {
            title: t('insurance_claims'),
            value: '892',
            change: '+9.1%',
            changeType: 'increase',
            icon: ClipboardDocumentCheckIcon,
            color: 'purple',
            description: 'Insurance claims processed',
          },
          {
            title: t('operational_efficiency'),
            value: '91.5%',
            change: '+4.2%',
            changeType: 'increase',
            icon: CalendarDaysIcon,
            color: 'orange',
            description: 'Operational efficiency score',
          },
        ];
      default:
        return [
          {
            title: t('total_patients_treated'),
            value: '1,247',
            change: '+8.2%',
            changeType: 'increase',
            icon: UserGroupIcon,
            color: 'blue',
            description: 'Total patients treated this month',
          },
          {
            title: t('active_treatments'),
            value: '342',
            change: '+12.5%',
            changeType: 'increase',
            icon: HeartIcon,
            color: 'green',
            description: 'Currently active treatment plans',
          },
          {
            title: t('diagnosis_accuracy'),
            value: '96.8%',
            change: '+1.2%',
            changeType: 'increase',
            icon: ClipboardDocumentCheckIcon,
            color: 'purple',
            description: 'Diagnostic accuracy rate',
          },
          {
            title: t('patient_satisfaction'),
            value: '94.2%',
            change: '+2.1%',
            changeType: 'increase',
            icon: FaceSmileIcon,
            color: 'orange',
            description: 'Patient satisfaction rating',
          },
        ];
    }
  };
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-700 ',
      green: 'bg-green-500 text-green-700 ',
      purple: 'bg-purple-500 text-purple-700 ',
      orange: 'bg-orange-500 text-orange-700 ',
      red: 'bg-red-500 text-red-700 ',
    };
    return colors[color] || colors.blue;
  };
  const kpiData = getKPIData();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {' '}
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          {' '}
          <div className="flex items-center justify-between mb-4">
            {' '}
            <div
              className={`p-3 rounded-lg ${getColorClasses(kpi.color).replace('text-', 'bg-').replace('', '').replace('-700', '-100').replace('-300', '-900/20')}`}
            >
              {' '}
              <kpi.icon
                className={`w-6 h-6 ${getColorClasses(kpi.color).split(' ')[1]} ${getColorClasses(kpi.color).split(' ')[2]}`}
              />{' '}
            </div>{' '}
            <div
              className={`flex items-center text-sm font-medium ${kpi.changeType === 'increase' ? 'text-green-600 ' : 'text-red-600 '}`}
            >
              {' '}
              {kpi.changeType === 'increase' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}{' '}
              {kpi.change}{' '}
            </div>{' '}
          </div>{' '}
          <div>
            {' '}
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {kpi.title}
            </h3>{' '}
            <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>{' '}
            <p className="text-xs text-gray-500 ">{kpi.description}</p>{' '}
          </div>{' '}
        </div>
      ))}{' '}
    </div>
  );
};

export default MedicalKPICards;
