import React from 'react';
import { motion } from 'framer-motion';

const SectionCard = React.memo(
  ({
    icon: Icon,
    title,
    description,
    color,
    delay = 0,
    children,
    className = '',
  }) => (
    <motion.div
      className={`group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/30 shadow-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}
      />

      {/* Content */}
      <div className="relative z-10">
        {Icon && (
          <motion.div
            className={`w-16 h-16 mb-6 bg-gradient-to-r ${color} p-3 rounded-xl`}
            animate={{
              boxShadow: [
                '0 0 15px rgba(79, 209, 197, 0.15)',
                '0 0 25px rgba(79, 209, 197, 0.25)',
                '0 0 15px rgba(79, 209, 197, 0.15)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <Icon className="w-full h-full text-white" />
          </motion.div>
        )}

        {title && (
          <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        )}

        {description && (
          <p className="text-teal-100 leading-relaxed">{description}</p>
        )}

        {children}
      </div>

      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4 w-3 h-3 bg-teal-400 rounded-full opacity-50" />
    </motion.div>
  ),
);

SectionCard.displayName = 'SectionCard';

export default SectionCard;
