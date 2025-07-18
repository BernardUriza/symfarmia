'use client';
import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const MedicalFormExample = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    bloodPressure: '',
    heartRate: '',
    diagnosis: '',
  });

  const [touched, setTouched] = useState({});

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Email inválido'
          : '';
      case 'phone':
        return !/^\d{10}$/.test(value.replace(/\D/g, ''))
          ? 'Teléfono debe tener 10 dígitos'
          : '';
      case 'heartRate':
        const hr = parseInt(value);
        return hr < 40 || hr > 200
          ? 'Frecuencia cardíaca fuera de rango normal'
          : '';
      default:
        return value.trim() === '' ? 'Este campo es requerido' : '';
    }
  };
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };
  const getFieldClasses = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];

    const isValid =
      touched[fieldName] && !errors[fieldName] && formData[fieldName];
    return ` w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-300 ease-out ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 ' : isValid ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 ' : 'border-gray-200 hover:border-gray-300 focus:border-medical-primary focus:ring-4 focus:ring-medical-primary/20 '} `;
  };
  return (
    <div className="@container max-w-4xl mx-auto p-6">
      {' '}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 relative overflow-hidden">
        {' '}
        {/* Gradient overlay */}{' '}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 pointer-events-none"></div>{' '}
        <div className="relative z-10">
          {' '}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent mb-6">
            {' '}
            Evaluación Médica Completa{' '}
          </h2>{' '}
          <form className="space-y-6">
            {' '}
            {/* Patient Information Section */}{' '}
            <div className="@md:grid @md:grid-cols-2 @md:gap-6 space-y-6 @md:space-y-0">
              {' '}
              <div className="group">
                {' '}
                <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-medical-primary transition-colors duration-200">
                  {' '}
                  <User className="inline h-4 w-4 mr-1" /> Nombre del Paciente
                  *{' '}
                </label>{' '}
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  onBlur={() => handleBlur('patientName')}
                  className={getFieldClasses('patientName')}
                  placeholder="Nombre completo del paciente"
                />{' '}
                {touched.patientName && errors.patientName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center opacity-100 @starting-style:opacity-0 translate-y-0 @starting-style:-translate-y-2 transition-all duration-300">
                    {' '}
                    <AlertCircle className="h-4 w-4 mr-1" />{' '}
                    {errors.patientName}{' '}
                  </p>
                )}{' '}
                {touched.patientName &&
                  !errors.patientName &&
                  formData.patientName && (
                    <p className="mt-1 text-sm text-green-600 flex items-center opacity-100 @starting-style:opacity-0 translate-y-0 @starting-style:-translate-y-2 transition-all duration-300">
                      {' '}
                      <CheckCircle className="h-4 w-4 mr-1" /> Campo válido{' '}
                    </p>
                  )}{' '}
              </div>{' '}
              <div className="group">
                {' '}
                <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-medical-primary transition-colors duration-200">
                  {' '}
                  <Mail className="inline h-4 w-4 mr-1" /> Correo Electrónico
                  *{' '}
                </label>{' '}
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={getFieldClasses('email')}
                  placeholder="correo@ejemplo.com"
                />{' '}
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {' '}
                    <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}{' '}
                  </p>
                )}{' '}
              </div>{' '}
            </div>{' '}
            {/* Medical Measurements Section */}{' '}
            <div className="pt-6 border-t border-gray-200 ">
              {' '}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {' '}
                Signos Vitales{' '}
              </h3>{' '}
              <div className="@lg:grid @lg:grid-cols-3 @lg:gap-6 space-y-6 @lg:space-y-0">
                {' '}
                <div className="group">
                  {' '}
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-medical-primary transition-colors duration-200">
                    {' '}
                    <Activity className="inline h-4 w-4 mr-1" /> Presión
                    Arterial{' '}
                  </label>{' '}
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) =>
                      handleChange('bloodPressure', e.target.value)
                    }
                    onBlur={() => handleBlur('bloodPressure')}
                    className={getFieldClasses('bloodPressure')}
                    placeholder="120/80"
                  />{' '}
                </div>{' '}
                <div className="group">
                  {' '}
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-medical-primary transition-colors duration-200">
                    {' '}
                    <Heart className="inline h-4 w-4 mr-1" /> Frecuencia
                    Cardíaca *{' '}
                  </label>{' '}
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => handleChange('heartRate', e.target.value)}
                    onBlur={() => handleBlur('heartRate')}
                    className={getFieldClasses('heartRate')}
                    placeholder="70"
                    min="40"
                    max="200"
                  />{' '}
                  {touched.heartRate && errors.heartRate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      {' '}
                      <AlertCircle className="h-4 w-4 mr-1" />{' '}
                      {errors.heartRate}{' '}
                    </p>
                  )}{' '}
                </div>{' '}
                <div className="group">
                  {' '}
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-medical-primary transition-colors duration-200">
                    {' '}
                    <Phone className="inline h-4 w-4 mr-1" /> Teléfono *{' '}
                  </label>{' '}
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={getFieldClasses('phone')}
                    placeholder="(555) 123-4567"
                  />{' '}
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      {' '}
                      <AlertCircle className="h-4 w-4 mr-1" />{' '}
                      {errors.phone}{' '}
                    </p>
                  )}{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            {/* Submit Button */}{' '}
            <div className="pt-6 flex justify-end space-x-4">
              {' '}
              <button
                type="button"
                className="px-6 py-3 rounded-xl font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300"
              >
                {' '}
                Cancelar{' '}
              </button>{' '}
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-medical-primary to-medical-accent text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={Object.keys(errors).some((key) => errors[key])}
              >
                {' '}
                Guardar Evaluación{' '}
              </button>{' '}
            </div>{' '}
          </form>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
};

export default MedicalFormExample;
