import React from 'react';
import { Select, SelectItem } from '@tremor/react';
import { ClockIcon, UploadIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const StatusSelect = ({ value, onValueChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return '!bg-amber-100';
      case 'Enviando':
        return '!bg-blue-100'; 
      case 'No entregado':
        return '!bg-red-100'; 
      case 'Activo':
        return '!bg-green-100'; 
      default:
        return '!bg-gray-100'; 
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectItem value="Pendiente" style={{"cursor":"pointer"}} icon={ClockIcon} color='red' className={"hover:text-gray-600 "+getStatusColor('Pendiente')}>
        Pendiente
      </SelectItem>
      <SelectItem value="Enviando" style={{"cursor":"pointer"}} icon={UploadIcon} className={"hover:text-gray-600 "+getStatusColor('Enviando')}>
        Enviando
      </SelectItem>
      <SelectItem value="No entregado" style={{"cursor":"pointer"}} icon={NoSymbolIcon} className={"hover:text-gray-600 "+getStatusColor('No entregado')}>
        No entregado
      </SelectItem>
      <SelectItem value="Activo" style={{"cursor":"pointer"}} icon={CheckCircleIcon} className={"hover:text-gray-600 "+getStatusColor('Activo')}>
        Activo
      </SelectItem>
    </Select>
  );
};

export default StatusSelect;
