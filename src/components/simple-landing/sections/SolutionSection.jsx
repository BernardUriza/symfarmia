import React from 'react';
import { Heading, Text } from '../atoms/Typography';
import FeatureCard from '../molecules/FeatureCard';
import {
  SunIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import MedicalBrainIcon from '../../MedicalBrainIcon';

const SolutionSection = ({ t }) => {
  const features = [
    {
      title: t('intelligent_transcription'),
      description: t('intelligent_transcription_desc'),
      icon: DocumentTextIcon,
      iconColor: 'text-teal-500',
    },
    {
      title: t('assisted_diagnosis'),
      description: t('assisted_diagnosis_desc'),
      icon: MedicalBrainIcon,
      iconColor: 'text-blue-500',
    },
    {
      title: t('automated_prescriptions'),
      description: t('automated_prescriptions_desc'),
      icon: ClipboardDocumentCheckIcon,
      iconColor: 'text-purple-500',
    },
    {
      title: t('medical_analytics'),
      description: t('medical_analytics_desc'),
      icon: ChartBarIcon,
      iconColor: 'text-pink-500',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-teal-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <SunIcon className="w-12 h-12 text-yellow-400 mr-4" />
            <Heading level={2} color="white">
              {t('hope_ecosystem')}
            </Heading>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
              variant="dark"
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center bg-teal-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-teal-400/30">
            <ArrowTrendingUpIcon className="w-5 h-5 text-teal-400 mr-2" />
            <Text color="white" weight="medium">
              {t('journey_progress')}
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
