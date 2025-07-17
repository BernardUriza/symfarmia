import React, { useState } from 'react';
import { mockMedicalReports } from '../data/mockMedicalReports';
import { useTranslation } from '../providers/I18nProvider';

const MedicalReportsPreview = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [medicalReports] = useState(mockMedicalReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Borrador':
        return 'bg-gray-100 text-gray-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudyStatusColor = (status) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setActiveTab('details');
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setActiveTab('list');
  };

  const renderReportsList = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-600">Total Reportes</h4>
          <p className="text-2xl font-bold text-blue-900">{medicalReports.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-600">Activos</h4>
          <p className="text-2xl font-bold text-green-900">
            {medicalReports.filter(r => r.status === 'Activo').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-600">Pendientes</h4>
          <p className="text-2xl font-bold text-yellow-900">
            {medicalReports.filter(r => r.status === 'Pendiente').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-600">Estudios Totales</h4>
          <p className="text-2xl font-bold text-purple-900">
            {medicalReports.reduce((acc, report) => acc + report.studies.length, 0)}
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reportes Médicos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Diagnóstico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estudios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {medicalReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {report.patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {report.patient.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateAge(report.patient.dateOfBirth)} años • {report.patient.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(report.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {report.diagnosis}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {report.studies.length}
                      </span>
                      <div className="ml-2 flex space-x-1">
                        {report.studies.slice(0, 3).map((study, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${getStudyStatusColor(study.status).split(' ')[0]}`}
                          />
                        ))}
                        {report.studies.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{report.studies.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReportClick(report)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Ver
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                        Editar
                      </button>
                      <button className="text-green-600 hover:text-green-900 transition-colors">
                        Enviar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportDetails = () => (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToList}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la lista
        </button>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Imprimir
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Enviar por Email
          </button>
        </div>
      </div>

      {/* Report Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reporte Médico #{selectedReport.id}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Fecha: {formatDate(selectedReport.date)} • Vence: {formatDate(selectedReport.expirationDate)}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
              {selectedReport.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Información del Paciente</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {selectedReport.patient.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">{selectedReport.patient.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {calculateAge(selectedReport.patient.dateOfBirth)} años • {selectedReport.patient.gender}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedReport.patient.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedReport.patient.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fecha de Nacimiento:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{formatDate(selectedReport.patient.dateOfBirth)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Diagnóstico</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-800">{selectedReport.diagnosis}</p>
              </div>
            </div>
          </div>

          {/* Studies */}
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Estudios Realizados</h4>
            <div className="space-y-4">
              {selectedReport.studies.map((study) => (
                <div key={study.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{study.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {study.type.category.name} • {study.type.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStudyStatusColor(study.status)}`}>
                        {study.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(study.date)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('result')}:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{study.result}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('normal_range')}:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{study.normalRange}</p>
                    </div>
                  </div>
                  
                  {study.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{study.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {activeTab === 'list' ? t('medical_reports_management') : t('report_details')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {activeTab === 'list' 
                ? t('medical_reports_desc') 
                : `${t('report_details')} #${selectedReport?.id}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Bar */}
        {activeTab === 'list' && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {t('new_report')}
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {t('import_studies')}
                </button>
              </div>
              <div className="flex gap-2">
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {t('filters')}
                </button>
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {t('export')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-6">
            {activeTab === 'list' ? renderReportsList() : renderReportDetails()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'list' 
                ? 'Vista previa del sistema de gestión de reportes médicos' 
                : 'Vista detallada del reporte médico'
              }
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalReportsPreview;