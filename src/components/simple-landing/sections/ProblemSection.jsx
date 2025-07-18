import React from 'react';
import { Heading, Text } from '../atoms/Typography';
import StatCard from '../molecules/StatCard';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const ProblemSection = ({ t }) => {
  const problems = [
    {
      icon: ClockIcon,
      stat: t('medical_time_lost'),
      description: 'Tiempo perdido en tareas administrativas',
    },
    {
      icon: ExclamationTriangleIcon,
      stat: t('burnout_rate'),
      description: 'Médicos reportan agotamiento profesional',
    },
    {
      icon: CurrencyDollarIcon,
      stat: t('annual_inefficiency'),
      description: 'Pérdidas anuales por ineficiencia',
    },
    {
      icon: UserGroupIcon,
      stat: t('human_contact_crisis'),
      description: 'Reducción en tiempo con pacientes',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mr-4" />
            <Heading level={2} color="white">
              {t('medical_crisis')}
            </Heading>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto"></div>
        </div>

        {/* Problem Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {problems.map((problem, index) => (
            <StatCard
              key={index}
              icon={problem.icon}
              number={problem.stat}
              description={problem.description}
              variant="dark"
            />
          ))}
        </div>

        {/* Transition Message */}
        <div className="text-center">
          <Text size="xl" color="light" className="italic">
            "{t('finding_hope_again')}"
          </Text>
          <div className="mt-4 w-32 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent mx-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
