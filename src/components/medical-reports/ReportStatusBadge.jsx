import React from 'react';
import { useTranslation } from '../../providers/I18nProvider';

const statusClasses = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
};

const statusKeyMap = {
  Borrador: 'draft',
  Pendiente: 'pending',
  Activo: 'active',
  Enviado: 'sent',
  Inactivo: 'inactive',
};

export default function ReportStatusBadge({ status }) {
  const { t } = useTranslation();
  const key = statusKeyMap[status] || status;
  const cls = statusClasses[key] || 'bg-gray-100 text-gray-800';
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cls}`}
    >
      {t(key)}
    </span>
  );
}
