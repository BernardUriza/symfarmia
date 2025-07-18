"use client";
import React from 'react';
import { usePatientContext } from '../providers/PatientContextProvider';
import { motion } from 'framer-motion';

const MedicalBrainIcon = ({ className = '' }) => {
  const { toggleAssistant, assistantOpen, clinicalAlerts, activePatient } = usePatientContext();
  
  const hasHighPriorityAlerts = clinicalAlerts.some(alert => alert.priority === 'high');
  
  return (
    <motion.button
      onClick={toggleAssistant}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-2 rounded-lg transition-all duration-200 ${
        assistantOpen 
          ? 'bg-blue-100 text-blue-600 shadow-md' 
          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
      } ${className}`}
      title="Medical AI Assistant (Ctrl+Shift+A)"
    >
      {/* Brain Icon */}
      <svg 
        className="w-6 h-6" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M12 3C8.5 3 6 5.5 6 8c0 1.5.5 2.5 1 3.5-.5 1-1 2-1 3.5 0 2.5 2.5 5 6 5s6-2.5 6-5c0-1.5-.5-2.5-1-3.5.5-1 1-2 1-3.5 0-2.5-2.5-5-6-5z"
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M8 12c1-1 2-1 3-1s2 0 3 1"
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M9 8.5c.5-.5 1.5-.5 2 0s1.5.5 2 0"
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M10 15.5c.5.5 1.5.5 2 0"
        />
        <circle cx="9" cy="10" r="0.5" fill="currentColor" />
        <circle cx="15" cy="10" r="0.5" fill="currentColor" />
      </svg>
      
      {/* Activity indicator */}
      {activePatient && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"
        />
      )}
      
      {/* Alert indicator */}
      {hasHighPriorityAlerts && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"
        />
      )}
      
      {/* Pulse animation when active */}
      {assistantOpen && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-400"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </motion.button>
  );
};

export default MedicalBrainIcon;