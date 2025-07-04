import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import ParticleField from './ParticleField';
import SectionCard from './SectionCard';

const ProblemSection = React.memo(({ t }) => {
  const problemData = useMemo(() => [
    {
      icon: ClockIcon,
      stat: t('medical_time_lost'),
      color: 'from-red-500 to-orange-500',
      delay: 0.2
    },
    {
      icon: ExclamationTriangleIcon,
      stat: t('burnout_rate'),
      color: 'from-orange-500 to-yellow-500',
      delay: 0.4
    },
    {
      icon: CurrencyDollarIcon,
      stat: t('annual_inefficiency'),
      color: 'from-yellow-500 to-red-500',
      delay: 0.6
    },
    {
      icon: UserGroupIcon,
      stat: t('human_contact_crisis'),
      color: 'from-red-500 to-pink-500',
      delay: 0.8
    }
  ], [t]);

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* Dark to Light Transition Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700">
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-900/20 to-transparent" />
      </div>
      
      {/* Healing Particles */}
      <motion.div className="absolute inset-0">
        <ParticleField count={10} />
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
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mr-4" />
            {t('medical_crisis')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto" />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problemData.map((item, index) => (
            <SectionCard
              key={index}
              icon={item.icon}
              color={item.color}
              delay={item.delay}
              description={item.stat}
              className="border-slate-700"
            />
          ))}
        </div>
        
        {/* Transition to Hope */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-xl text-teal-200 font-light italic">
            "{t('finding_hope_again')}"
          </p>
          <div className="mt-4 w-32 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent mx-auto" />
        </motion.div>
      </div>
    </section>
  );
});

ProblemSection.displayName = 'ProblemSection';

export default ProblemSection;