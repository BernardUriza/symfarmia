"use client";
import React, { useState } from 'react';
import { useTranslation } from '../../../app/providers/I18nProvider';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DemoSection() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('demo.medical_transcription_title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('demo.see_it_working')}
          </p>
        </div>

        <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          {/* Demo Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative mb-8 lg:mb-0"
          >
            <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-12 w-12 text-white" />
                  ) : (
                    <PlayIcon className="h-12 w-12 text-white ml-1" />
                  )}
                </button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm">Demo de Consulta Médica con IA</p>
              </div>
            </div>
          </motion.div>

          {/* Demo Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              ¿Qué verás en el demo?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-500 rounded-full p-1 mr-3 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('demo.start_medical_demo')}</h4>
                  <p className="text-gray-600">{t('demo.experience_ai_doctor')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-500 rounded-full p-1 mr-3 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Asistencia Diagnóstica</h4>
                  <p className="text-gray-600">IA que sugiere diagnósticos diferenciales basados en síntomas</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-500 rounded-full p-1 mr-3 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Generación de Reportes</h4>
                  <p className="text-gray-600">Crea automáticamente reportes médicos profesionales</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link
                href="/medical-ai-demo"
                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('demo.start_medical_demo')}
              </Link>
              
              <Link
                href="/dashboard"
                className="block w-full border border-blue-600 text-blue-600 text-center px-6 py-3 rounded-md hover:bg-blue-50 transition-colors"
              >
                {t('demo.continue_to_dashboard')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Demo Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2 min</div>
            <p className="text-gray-600">Tiempo promedio de consulta</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">95%</div>
            <p className="text-gray-600">Precisión diagnóstica</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">40%</div>
            <p className="text-gray-600">Reducción de tiempo</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}