import React from 'react';
import { Heading, Text } from '../atoms/Typography';
import FeatureCard from '../molecules/FeatureCard';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const TrustSection = ({ t }) => {
  const trustFeatures = [
    {
      icon: LockClosedIcon,
      title: t('military_encryption'),
      description: t('military_encryption_desc'),
      iconColor: 'text-teal-500',
    },
    {
      icon: ShieldCheckIcon,
      title: t('cofepris_compliance'),
      description: t('cofepris_compliance_desc'),
      iconColor: 'text-blue-500',
    },
    {
      icon: ServerIcon,
      title: t('mexican_servers'),
      description: t('mexican_servers_desc'),
      iconColor: 'text-green-500',
    },
    {
      icon: HeartIcon,
      title: t('trust_promise'),
      description: t('trust_promise_desc'),
      iconColor: 'text-pink-500',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-700">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ShieldCheckIcon className="w-12 h-12 text-teal-400 mr-4" />
            <Heading level={2} color="white">
              {t('sanctuary_title')}
            </Heading>
          </div>

          <Text size="xl" color="light" className="mb-4 max-w-2xl mx-auto">
            {t('sanctuary_subtitle')}
          </Text>

          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto"></div>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
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

        {/* Trust Promise */}
        <div className="text-center">
          <div className="inline-flex items-center bg-teal-500/20 backdrop-blur-sm px-8 py-4 rounded-full border border-teal-400/30">
            <ShieldCheckIcon className="w-6 h-6 text-teal-400 mr-3" />
            <Text color="white" weight="medium" size="lg">
              {t('peace_of_mind_restored')}
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
