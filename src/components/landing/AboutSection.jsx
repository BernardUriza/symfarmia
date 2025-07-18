'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Sobre SYMFARMIA
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Revolucionamos la medicina con inteligencia artificial avanzada,
                mejorando la precisión diagnóstica y optimizando el tiempo de
                consulta.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Nuestra Misión
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Empoderar a los profesionales de la salud con tecnología de
                    vanguardia para brindar atención médica más precisa y
                    eficiente.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Nuestra Visión
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Ser la plataforma líder mundial en asistencia médica
                    inteligente, transformando la manera en que se practica la
                    medicina.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Nuestros Valores
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Precisión, innovación, confidencialidad y compromiso con la
                    excelencia en el cuidado de la salud.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Precisión Diagnóstica:</span>
                  <span className="font-bold">95.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Reducción de Tiempo:</span>
                  <span className="font-bold">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Médicos Registrados:</span>
                  <span className="font-bold">10,000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Consultas Procesadas:</span>
                  <span className="font-bold">1M+</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
