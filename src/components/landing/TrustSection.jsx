import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import ParticleField from './ParticleField';
import SectionCard from './SectionCard';
import { PARTICLE_CONFIGS, ANIMATION_DELAYS } from './constants/animations';

const TrustSection = React.memo(({ t }) => {
  const trustFeatures = useMemo(
    () => [
      {
        icon: LockClosedIcon,
        title: t('military_encryption'),
        description: t('military_encryption_desc'),
        color: 'from-teal-400 to-blue-500',
        delay: ANIMATION_DELAYS.SHORT,
      },
      {
        icon: ShieldCheckIcon,
        title: t('cofepris_compliance'),
        description: t('cofepris_compliance_desc'),
        color: 'from-blue-400 to-indigo-500',
        delay: ANIMATION_DELAYS.MEDIUM,
      },
      {
        icon: ServerIcon,
        title: t('mexican_servers'),
        description: t('mexican_servers_desc'),
        color: 'from-green-400 to-teal-500',
        delay: 0.6,
      },
      {
        icon: HeartIcon,
        title: t('trust_promise'),
        description: t('trust_promise_desc'),
        color: 'from-pink-400 to-red-500',
        delay: 0.8,
      },
    ],
    [t],
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* Sanctuary Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600">
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/20 to-transparent" />
      </div>

      {/* Protective Light Emanation */}
      <div className="absolute inset-0 bg-gradient-radial from-teal-500/10 via-transparent to-transparent opacity-60" />

      {/* Security Particles */}
      <motion.div className="absolute inset-0">
        <ParticleField {...PARTICLE_CONFIGS.LOW} />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center">
            <ShieldCheckIcon className="w-12 h-12 text-teal-400 mr-4" />
            {t('sanctuary_title')}
          </h2>
          <p className="text-xl md:text-2xl text-teal-100 mb-4">
            {t('sanctuary_subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto" />
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <SectionCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              delay={feature.delay}
            />
          ))}
        </div>

        {/* Trust Restoration Promise */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm px-8 py-4 rounded-full border border-teal-400/30">
            <ShieldCheckIcon className="w-6 h-6 text-teal-400 mr-3" />
            <span className="text-white font-medium text-lg">
              {t('peace_of_mind_restored')}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

TrustSection.displayName = 'TrustSection';

export default TrustSection;
