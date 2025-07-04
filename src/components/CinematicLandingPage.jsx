import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '../../app/providers/I18nProvider';
import {
  HeartIcon,
  SunIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
  StarIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import MedicalBrainIcon from './MedicalBrainIcon';
import LanguageToggle from '../../components/LanguageToggle';

const CinematicLandingPage = () => {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  // Parallax effects with reduced intensity
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  
  // Throttled mouse tracking to reduce re-renders
  const handleMouseMove = useCallback((e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
  }, []);
  
  useEffect(() => {
    let timeoutId;
    const throttledMouseMove = (e) => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleMouseMove(e);
        timeoutId = null;
      }, 100); // Throttle to 10fps
    };
    
    window.addEventListener('mousemove', throttledMouseMove);
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleMouseMove]);

  // Optimized floating particles with reduced count and simpler animations
  const ParticleField = ({ count = 15 }) => {
    const particles = useMemo(() => {
      return [...Array(count)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 2
      }));
    }, [count]);
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-20"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Hero Section - "EL AMANECER MÉDICO"
  const HeroSection = () => (
    <section className="relative min-h-screen overflow-hidden">
      {/* Cinematic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-600">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-slate-900/30" />
      </div>
      
      {/* Grid Layout Container */}
      <div className="relative z-10 min-h-screen grid grid-rows-[auto_1fr_auto] gap-8 p-6">
        {/* Header Row - Language Toggle */}
        <div className="flex justify-end">
          <LanguageToggle variant="prominent" />
        </div>
        
        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
          {/* Left Column - Medical Sunrise Icon */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              className="relative"
              style={{
                x: (mousePosition.x - 50) * 0.05,
                y: (mousePosition.y - 50) * 0.05,
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 120,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="relative">
                <SunIcon className="w-40 h-40 md:w-48 md:h-48 text-yellow-400 opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <HeartIcon className="w-16 h-16 text-red-400 absolute -top-4 -left-4" />
                    <MedicalBrainIcon className="w-16 h-16 text-blue-400 absolute -top-4 -right-4" />
                    <div className="w-12 h-12 bg-teal-400 rounded-full opacity-80 animate-pulse" /> joj
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Text Content */}
          <motion.div 
            className="text-center lg:text-left space-y-8"
            style={{ y: textY }}
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-white via-teal-100 to-yellow-200 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              {t('hero_title')}
            </motion.h1>
            
            <motion.p
              className="text-lg md:text-xl lg:text-2xl text-teal-100 font-light leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1 }}
            >
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center"
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
        </div>
        
        {/* Footer Row - Scroll Indicator */}
        <div className="flex justify-center">
          <motion.div
            className="text-teal-300"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex flex-col items-center">
              <div className="w-px h-12 bg-gradient-to-b from-teal-300 to-transparent mb-2" />
              <div className="text-sm font-medium">Scroll for transformation</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  // Problem Section - "LA CRISIS MÉDICA"
  const ProblemSection = () => (
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
          {[
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
          ].map((item, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: item.delay }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Healing Light Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/5 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="relative z-10">
                <item.icon className={`w-16 h-16 mb-4 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} />
                <p className="text-lg font-semibold text-white leading-relaxed">
                  {item.stat}
                </p>
              </div>
              
              {/* Hope Glow */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
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

  // Solution Section - "EL ECOSISTEMA DE ESPERANZA"
  const SolutionSection = () => (
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
          
          {[
            {
              title: t('intelligent_transcription'),
              description: t('intelligent_transcription_desc'),
              icon: DocumentTextIcon,
              color: 'from-teal-400 to-blue-500',
              delay: 0.2
            },
            {
              title: t('assisted_diagnosis'),
              description: t('assisted_diagnosis_desc'),
              icon: MedicalBrainIcon,
              color: 'from-blue-400 to-purple-500',
              delay: 0.4
            },
            {
              title: t('automated_prescriptions'),
              description: t('automated_prescriptions_desc'),
              icon: ClipboardDocumentCheckIcon,
              color: 'from-purple-400 to-pink-500',
              delay: 0.6
            },
            {
              title: t('medical_analytics'),
              description: t('medical_analytics_desc'),
              icon: ChartBarIcon,
              color: 'from-pink-400 to-teal-500',
              delay: 0.8
            }
          ].map((node, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/30 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: node.delay }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              {/* Hope Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${node.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
              
              {/* Healing Energy Flow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <motion.div
                  className={`w-16 h-16 mb-6 bg-gradient-to-r ${node.color} p-3 rounded-xl`}
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(79, 209, 197, 0.2)",
                      "0 0 25px rgba(79, 209, 197, 0.3)",
                      "0 0 15px rgba(79, 209, 197, 0.2)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <node.icon className="w-full h-full text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {node.title}
                </h3>
                
                <p className="text-teal-100 text-lg leading-relaxed">
                  {node.description}
                </p>
              </div>
              
              {/* Interactive Hotspot */}
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-teal-400 rounded-full opacity-60" />
            </motion.div>
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

  // Trust Section - "SANTUARIO SAGRADO"
  const TrustSection = () => (
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
        <ParticleField count={12} />
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
          {[
            {
              icon: LockClosedIcon,
              title: t('military_encryption'),
              description: t('military_encryption_desc'),
              color: 'from-teal-400 to-blue-500',
              delay: 0.2
            },
            {
              icon: ShieldCheckIcon,
              title: t('cofepris_compliance'),
              description: t('cofepris_compliance_desc'),
              color: 'from-blue-400 to-indigo-500',
              delay: 0.4
            },
            {
              icon: ServerIcon,
              title: t('mexican_servers'),
              description: t('mexican_servers_desc'),
              color: 'from-green-400 to-teal-500',
              delay: 0.6
            },
            {
              icon: HeartIcon,
              title: t('trust_promise'),
              description: t('trust_promise_desc'),
              color: 'from-pink-400 to-red-500',
              delay: 0.8
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/30 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Protective Aura */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
              
              {/* Security Shield Formation */}
              <motion.div
                className="absolute inset-0 border-2 border-teal-400/0 group-hover:border-teal-400/30 rounded-2xl transition-all duration-500"
                whileHover={{
                  boxShadow: "0 0 30px rgba(79, 209, 197, 0.3)"
                }}
              />
              
              <div className="relative z-10">
                <motion.div
                  className={`w-16 h-16 mb-6 bg-gradient-to-r ${feature.color} p-3 rounded-xl`}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(79, 209, 197, 0.2)",
                      "0 0 30px rgba(79, 209, 197, 0.4)",
                      "0 0 20px rgba(79, 209, 197, 0.2)"
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <feature.icon className="w-full h-full text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-teal-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Peace of Mind Indicator */}
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-teal-400 rounded-full opacity-50" />
            </motion.div>
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

  // Testimonials Section - "VOCES DE TRANSFORMACIÓN"
  const TestimonialsSection = () => (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* Transformation Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500">
        <div className="absolute inset-0 bg-gradient-to-t from-teal-800/40 via-transparent to-transparent" />
      </div>
      
      {/* Hope Threads */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
      >
        <motion.path
          d="M 10 20 Q 50 5 90 20 M 10 50 Q 50 35 90 50 M 10 80 Q 50 65 90 80"
          stroke="url(#hopeThread)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="5,3"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 3, delay: 0.5 }}
          viewport={{ once: true }}
        />
        <defs>
          <linearGradient id="hopeThread" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#96CEB4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Renewal Particles */}
      <motion.div className="absolute inset-0">
        <ParticleField count={12} />
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
            <UserCircleIcon className="w-12 h-12 text-teal-400 mr-4" />
            {t('transformation_voices')}
          </h2>
          <p className="text-xl text-teal-100 mb-4">
            {t('real_doctor_stories')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-yellow-400 mx-auto" />
        </motion.div>
        
        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: t('dr_maria_name'),
              specialty: t('dr_maria_specialty'),
              location: t('dr_maria_location'),
              quote: t('dr_maria_quote'),
              transformation: t('dr_maria_transformation'),
              hopeIndicator: t('renewed_eye_contact'),
              avatar: "👩‍⚕️",
              delay: 0.2
            },
            {
              name: t('dr_carlos_name'),
              specialty: t('dr_carlos_specialty'),
              location: t('dr_carlos_location'),
              quote: t('dr_carlos_quote'),
              transformation: t('dr_carlos_transformation'),
              hopeIndicator: t('work_life_balance'),
              avatar: "👨‍⚕️",
              delay: 0.4
            },
            {
              name: t('dr_ana_name'),
              specialty: t('dr_ana_specialty'),
              location: t('dr_ana_location'),
              quote: t('dr_ana_quote'),
              transformation: t('dr_ana_transformation'),
              hopeIndicator: t('professional_confidence'),
              avatar: "👩‍⚕️",
              delay: 0.6
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/30 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: testimonial.delay }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              {/* Transformation Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              {/* Hope Threads */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Doctor Avatar */}
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-teal-300">
                      {testimonial.specialty}
                    </p>
                    <p className="text-teal-400 text-sm">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                
                {/* Quote */}
                <blockquote className="text-white text-lg mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Transformation */}
                <p className="text-teal-200 mb-4 leading-relaxed">
                  {testimonial.transformation}
                </p>
                
                {/* Hope Indicator */}
                <div className="flex items-center bg-gradient-to-r from-teal-500/20 to-blue-500/20 px-4 py-2 rounded-full">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-white text-sm font-medium">
                    {testimonial.hopeIndicator}
                  </span>
                </div>
              </div>
              
              {/* Renewal Pulse */}
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-400 rounded-full opacity-60" />
            </motion.div>
          ))}
        </div>
        
        {/* Collective Transformation */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-xl text-teal-200 font-light italic mb-4">
            "{t('collective_transformation')}"
          </p>
          <div className="inline-flex items-center bg-gradient-to-r from-teal-500/20 to-yellow-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-teal-400/30">
            <UserGroupIcon className="w-5 h-5 text-teal-400 mr-2" />
            <span className="text-white font-medium">
              {t('join_transformation')}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Revolutionary Vision Section - "EL RENACIMIENTO MÉDICO"
  const RevolutionaryVisionSection = () => (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* Renaissance Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-500 to-slate-400">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/30 via-teal-800/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-800/10 to-transparent" />
      </div>
      
      {/* Rising Sun Culmination */}
      <motion.div
        className="absolute top-10 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <SunIcon className="w-24 h-24 text-yellow-400 opacity-80" />
        <div className="absolute inset-0 animate-spin-slow">
          <div className="w-full h-full border-2 border-yellow-400/30 rounded-full" />
        </div>
      </motion.div>
      
      {/* Global Hope Network */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="url(#globalHope)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="20,10"
          initial={{ pathLength: 0, rotate: 0 }}
          whileInView={{ pathLength: 1, rotate: 360 }}
          transition={{ duration: 6, delay: 0.5 }}
          viewport={{ once: true }}
        />
        <defs>
          <linearGradient id="globalHope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#4ECDC4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Renaissance Particles */}
      <motion.div className="absolute inset-0">
        <ParticleField count={18} />
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
            <ArrowTrendingUpIcon className="w-12 h-12 text-yellow-400 mr-4" />
            {t('medical_renaissance')}
          </h2>
          <p className="text-xl md:text-2xl text-yellow-100 mb-4">
            {t('hopeful_future_tagline')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-teal-400 mx-auto" />
        </motion.div>
        
        {/* Vision Trilogy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Personal Transformation */}
          <motion.div
            className="group relative bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm p-8 rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl">
                <EyeIcon className="w-full h-full text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('personal_transformation')}
              </h3>
              
              <p className="text-yellow-100 mb-4 leading-relaxed">
                {t('reclaim_life_days')}
              </p>
              
              <p className="text-teal-200 leading-relaxed">
                {t('restore_human_contact')}
              </p>
            </div>
            
            {/* Transformation Visualization */}
            <div className="absolute bottom-4 right-4 flex space-x-1 opacity-50">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
            </div>
          </motion.div>
          
          {/* Professional Renaissance */}
          <motion.div
            className="group relative bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/30 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 bg-gradient-to-r from-teal-400 to-blue-500 p-3 rounded-xl">
                <MedicalBrainIcon className="w-full h-full text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('professional_renaissance')}
              </h3>
              
              <p className="text-teal-100 mb-4 leading-relaxed">
                {t('admin_to_artistry')}
              </p>
              
              <p className="text-blue-200 leading-relaxed">
                {t('fatigue_to_brilliance')}
              </p>
            </div>
            
            {/* Renaissance Glow */}
            <div className="absolute bottom-4 right-4 w-4 h-4 bg-teal-400 rounded-full opacity-60" />
          </motion.div>
          
          {/* Global Leadership */}
          <motion.div
            className="group relative bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm p-8 rounded-2xl border border-green-500/30 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 bg-gradient-to-r from-green-400 to-yellow-500 p-3 rounded-xl">
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  🇲🇽
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('mexican_leadership')}
              </h3>
              
              <p className="text-green-100 mb-4 leading-relaxed">
                {t('mexico_ai_revolution')}
              </p>
              
              <p className="text-yellow-200 leading-relaxed">
                {t('guadalajara_to_world')}
              </p>
            </div>
            
            {/* Global Pulse */}
            <div className="absolute bottom-4 right-4 w-4 h-4 bg-yellow-400 rounded-full opacity-50" />
          </motion.div>
        </div>
        
        {/* Ultimate Vision */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-yellow-500/20 via-teal-500/20 to-blue-500/20 backdrop-blur-sm p-8 rounded-3xl border border-yellow-400/30 max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('future_is_bright')}
            </h3>
            
            <p className="text-xl text-yellow-100 mb-8 leading-relaxed">
              {t('transformation_within_reach')}
            </p>
            
            <motion.button
              className="group relative px-12 py-4 bg-gradient-to-r from-yellow-500 to-teal-500 text-white font-bold rounded-full text-xl shadow-2xl border-2 border-yellow-400/50 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(245, 158, 11, 0.2)",
                  "0 0 40px rgba(245, 158, 11, 0.3)",
                  "0 0 20px rgba(245, 158, 11, 0.2)"
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <span className="relative z-10">{t('join_renaissance')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Pricing Section - "PLANES DE TRANSFORMACIÓN"
  const PricingSection = () => {
    
    const plans = [
      {
        name: t('plan_free'),
        price: 'GRATUITO',
        period: '',
        features: [
          t('feature_5_consultations'),
          t('feature_basic_transcription'),
          t('feature_email_support'),
          t('feature_basic_reports')
        ],
        color: 'from-slate-600 to-slate-700',
        borderColor: 'border-slate-500/50',
        ctaText: t('start_free'),
        ctaStyle: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600',
        popular: false
      },
      {
        name: t('plan_professional'),
        price: '$299',
        period: 'MXN/mes',
        features: [
          t('feature_unlimited_consultations'),
          t('feature_ai_diagnosis'),
          t('feature_automated_prescriptions'),
          t('feature_priority_support'),
          t('feature_advanced_analytics'),
          t('feature_pdf_merger'),
          t('feature_custom_templates')
        ],
        color: 'from-teal-500 to-blue-600',
        borderColor: 'border-teal-500',
        ctaText: t('transform_now'),
        ctaStyle: 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500',
        popular: true
      },
      {
        name: t('plan_clinic'),
        price: t('custom_pricing'),
        period: '',
        features: [
          t('feature_multi_doctor'),
          t('feature_clinic_management'),
          t('feature_dedicated_support'),
          t('feature_custom_integration'),
          t('feature_training_included'),
          t('feature_white_label')
        ],
        color: 'from-purple-600 to-pink-600',
        borderColor: 'border-purple-500/50',
        ctaText: t('contact_sales'),
        ctaStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
        popular: false
      }
    ];

    return (
      <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
        {/* Transformation Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600">
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 via-transparent to-transparent" />
        </div>
        
        {/* Pricing Energy Particles */}
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
              <CurrencyDollarIcon className="w-12 h-12 text-teal-400 mr-4" />
              {t('transformation_plans')}
            </h2>
            <p className="text-xl text-teal-100 mb-4">
              {t('choose_transformation_level')}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto" />
          </motion.div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border ${plan.borderColor} shadow-2xl overflow-hidden ${plan.popular ? 'ring-2 ring-teal-500 transform scale-105' : ''}`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: plan.popular ? 1.05 : 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: plan.popular ? 1.08 : 1.02, y: -5 }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      {t('most_popular')}
                    </div>
                  </div>
                )}
                
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
                
                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-5xl font-black text-teal-400">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-teal-200 ml-2">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-base text-white">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <motion.button
                    className={`w-full py-4 ${plan.ctaStyle} text-white font-semibold rounded-full text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {plan.ctaText}
                  </motion.button>
                </div>
                
                {/* Pulse Animation */}
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-teal-400 rounded-full opacity-50" />
              </motion.div>
            ))}
          </div>
          
          {/* Trust Guarantee */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm px-8 py-4 rounded-full border border-teal-400/30">
              <ShieldCheckIcon className="w-6 h-6 text-teal-400 mr-3" />
              <span className="text-white font-medium text-lg">
                {t('money_back_guarantee')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Final CTA Section - "ÚNETE A LA REVOLUCIÓN"
  const FinalCTASection = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      specialty: '',
      phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      setIsSubmitting(false);
      
      // Reset form after success
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', specialty: '', phone: '' });
      }, 3000);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
        {/* Revolutionary Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900">
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-teal-500/10 to-transparent" />
        </div>
        
        {/* Revolution Particles */}
        <motion.div className="absolute inset-0">
          <ParticleField count={20} />
        </motion.div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6">
              {t('join_revolution')}
            </h2>
            <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-4xl mx-auto">
              {t('revolution_subtitle')}
            </p>
          </motion.div>
          
          {/* Demo Form */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-teal-500/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                {t('start_transformation')}
              </h3>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder={t('full_name')}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder={t('email_address')}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <select
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                      >
                        <option value="" className="text-slate-800">{t('select_specialty')}</option>
                        <option value="general" className="text-slate-800">{t('general_medicine')}</option>
                        <option value="cardiology" className="text-slate-800">{t('cardiology')}</option>
                        <option value="dermatology" className="text-slate-800">{t('dermatology')}</option>
                        <option value="pediatrics" className="text-slate-800">{t('pediatrics')}</option>
                        <option value="other" className="text-slate-800">{t('other_specialty')}</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t('phone_number')}
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-lg text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        {t('transforming')}
                      </div>
                    ) : (
                      t('start_free_trial')
                    )}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {t('transformation_initiated')}
                  </h3>
                  <p className="text-teal-100">
                    {t('check_email_next_steps')}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Social Proof */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400 mb-2">1,247+</div>
                <div className="text-white">{t('doctors_transformed')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400 mb-2">89%</div>
                <div className="text-white">{t('time_savings')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400 mb-2">4.9/5</div>
                <div className="text-white">{t('satisfaction_rating')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Footer Section
  const FooterSection = () => (
    <footer className="relative bg-slate-900 border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              SYMFARMIA
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">
              {t('footer_description')}
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <ServerIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('product')}</h4>
            <div className="space-y-2">
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">{t('features')}</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">{t('pricing')}</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">{t('security')}</a>
            </div>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('support')}</h4>
            <div className="space-y-2">
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">{t('documentation')}</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">{t('contact')}</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">{t('privacy')}</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-400">
            © 2024 SYMFARMIA. {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden">
      <HeroSection />
    </div>
  );
};

export default CinematicLandingPage;