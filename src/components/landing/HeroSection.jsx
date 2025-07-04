import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, SunIcon } from '@heroicons/react/24/outline';
import MedicalBrainIcon from '../MedicalBrainIcon';
import LanguageToggle from '../../../components/LanguageToggle';
import ParticleField from './ParticleField';

const HeroSection = React.memo(({ t, textY, particleY, mousePosition }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Cinematic Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-600">
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-slate-900/30" />
    </div>
    
    {/* Floating Particles */}
    <motion.div style={{ y: particleY }}>
      <ParticleField count={20} />
    </motion.div>
    
    {/* Medical Sunrise Icon */}
    <motion.div
      className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        x: (mousePosition.x - 50) * 0.05,
        y: (mousePosition.y - 50) * 0.05,
      }}
      animate={{ rotate: [0, 360] }}
      transition={{
        duration: 120,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="relative">
        <SunIcon className="w-32 h-32 text-yellow-400 opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <HeartIcon className="w-16 h-16 text-red-400 absolute -top-4 -left-4" />
            <MedicalBrainIcon className="w-16 h-16 text-blue-400 absolute -top-4 -right-4" />
            <div className="w-12 h-12 bg-teal-400 rounded-full opacity-80 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
    
    {/* Main Content */}
    <motion.div 
      className="relative z-10 text-center px-4 max-w-6xl mx-auto"
      style={{ y: textY }}
    >
      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-teal-100 to-yellow-200 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        {t('hero_title')}
      </motion.h1>
      
      <motion.p
        className="text-xl md:text-2xl lg:text-3xl text-teal-100 mb-12 max-w-4xl mx-auto font-light"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1 }}
      >
        {t('hero_subtitle')}
      </motion.p>
      
      <motion.div
        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.button
          className="group relative px-12 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-full text-lg shadow-2xl border-2 border-teal-400/50 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(79, 209, 197, 0.2)",
              "0 0 30px rgba(79, 209, 197, 0.3)",
              "0 0 20px rgba(79, 209, 197, 0.2)",
            ],
          }}
          transition={{
            boxShadow: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <span className="relative z-10">{t('hero_cta')}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </motion.button>
        
        <div className="text-teal-200 text-sm font-medium flex items-center">
          <div className="w-3 h-3 bg-teal-400 rounded-full mr-2 animate-pulse" />
          {t('journey_progress')}
        </div>
      </motion.div>
    </motion.div>
    
    {/* Language Toggle */}
    <div className="absolute top-6 right-6 z-20">
      <LanguageToggle variant="prominent" />
    </div>
    
    {/* Scroll Indicator */}
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-teal-300"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="flex flex-col items-center">
        <div className="w-px h-12 bg-gradient-to-b from-teal-300 to-transparent mb-2" />
        <div className="text-sm font-medium">Scroll for transformation</div>
      </div>
    </motion.div>
  </section>
));

HeroSection.displayName = 'HeroSection';

export default HeroSection;