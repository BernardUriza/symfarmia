import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import MedicalBrainIcon from '../MedicalBrainIcon';
import ParticleField from './ParticleField';
import SectionCard from './SectionCard';

const SolutionSection = React.memo(({ t }) => {
  const solutionData = useMemo(
    () => [
      {
        title: t('intelligent_transcription'),
        description: t('intelligent_transcription_desc'),
        icon: DocumentTextIcon,
        color: 'from-teal-400 to-blue-500',
        delay: 0.2,
      },
      {
        title: t('assisted_diagnosis'),
        description: t('assisted_diagnosis_desc'),
        icon: MedicalBrainIcon,
        color: 'from-blue-400 to-purple-500',
        delay: 0.4,
      },
      {
        title: t('automated_prescriptions'),
        description: t('automated_prescriptions_desc'),
        icon: ClipboardDocumentCheckIcon,
        color: 'from-purple-400 to-pink-500',
        delay: 0.6,
      },
      {
        title: t('medical_analytics'),
        description: t('medical_analytics_desc'),
        icon: ChartBarIcon,
        color: 'from-pink-400 to-teal-500',
        delay: 0.8,
      },
    ],
    [t],
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* Hope Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-teal-900 to-blue-900">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-teal-500/10 to-transparent" />
      </div>

      {/* Healing Energy Particles */}
      <motion.div className="absolute inset-0">
        <ParticleField count={15} />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center">
            <SunIcon className="w-12 h-12 text-yellow-400 mr-4" />
            {t('hope_ecosystem')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto" />
        </motion.div>

        {/* Connected Hope Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            viewBox="0 0 100 100"
          >
            <motion.path
              d="M 25 25 Q 50 10 75 25 Q 90 50 75 75 Q 50 90 25 75 Q 10 50 25 25"
              stroke="url(#hopeLine)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10,5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 3, delay: 0.5 }}
              viewport={{ once: true }}
            />
            <defs>
              <linearGradient id="hopeLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#45B7D1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#96CEB4" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {solutionData.map((node, index) => (
            <SectionCard
              key={index}
              icon={node.icon}
              title={node.title}
              description={node.description}
              color={node.color}
              delay={node.delay}
            />
          ))}
        </div>

        {/* Transformation Promise */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-teal-400/30">
            <ArrowTrendingUpIcon className="w-5 h-5 text-teal-400 mr-2" />
            <span className="text-white font-medium">
              {t('journey_progress')}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

SolutionSection.displayName = 'SolutionSection';

export default SolutionSection;
