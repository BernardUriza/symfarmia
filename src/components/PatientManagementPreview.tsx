'use client'

import React, { useState } from 'react'
import { mockPatients } from '../data/mockPatients'
import { useTranslation } from '../../app/providers/I18nProvider'

interface PatientManagementPreviewProps {
  isOpen: boolean
  onClose: () => void
}

const PatientManagementPreview = ({ isOpen, onClose }: PatientManagementPreviewProps) => {
  const [patients] = useState(mockPatients)
  const { t } = useTranslation()

  if (!isOpen) return null

  const getStatusColor = (status: string) =>
    status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

  const calculateAge = (dob: string) => {
    const today = new Date()
    const birth = new Date(dob)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('patient_management')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t('patient_management_preview_description')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('patient_list')}</h3>
              <div className="flex gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {t('new_patient')}
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {t('export')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('total_patients')}</h4>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{patients.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/40 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400">{t('active_patients')}</h4>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {patients.filter(p => p.status === 'Activo').length}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/40 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400">{t('inactive_patients')}</h4>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                  {patients.filter(p => p.status === 'Inactivo').length}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      {['patient', 'contact', 'age', 'gender', 'status', 'actions'].map((label) => (
                        <th key={label} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t(label)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {patients.map(patient => (
                      <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patient.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                              {patient.information}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{patient.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{patient.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {calculateAge(patient.dateOfBirth)} {t('years')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors">{t('view')}</button>
                            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors">{t('edit')}</button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors">{t('delete')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">{t('preview_footer')}</div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientManagementPreview
