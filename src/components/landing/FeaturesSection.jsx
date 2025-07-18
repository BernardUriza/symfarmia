'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: HeartIcon,
    title: 'Diagnóstico Inteligente',
    description: 'IA médica avanzada que asiste en el diagnóstico diferencial',
  },
  {
    icon: DocumentTextIcon,
    title: 'Documentación Automática',
    description:
      'Generación automática de reportes médicos y historias clínicas',
  },
  {
    icon: ChartBarIcon,
    title: 'Análisis de Datos',
    description: 'Análisis predictivo y patrones de salud poblacional',
  },
  {
    icon: ClockIcon,
    title: 'Ahorro de Tiempo',
    description: 'Reduce el tiempo de consulta hasta en un 40%',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Seguridad Total',
    description: 'Cumple con todas las normativas de privacidad médica',
  },
  {
    icon: UserGroupIcon,
    title: 'Colaboración',
    description: 'Facilita la colaboración entre profesionales médicos',
  },
];

export default function FeaturesSection() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Funcionalidades Avanzadas
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Descubre cómo SYMFARMIA revoluciona la práctica médica
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
