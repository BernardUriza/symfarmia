import React from "react";
import { Card } from '@tremor/react';
import { DocumentTextIcon } from '@heroicons/react/outline';

export const CardEstudio = ({ tipoEstudio, nombreEstudio, fechaEstudio, url }) => {
    // Función para extraer la extensión del archivo del URL
    const obtenerExtension = (url) => {
      const partes = url.split('.');
      return partes[partes.length - 1];
    };
  
    // Crear el nombre del archivo
    const nombreArchivo = `${nombreEstudio.replace(/\s/g, '_')}.${obtenerExtension(url)}`;
  
  return (
    <Card>
      <div className="flex gap-2 items-center w-full">
        <div className="flex flex-col flex-1 gap-2 justify-center">
          <div className="text-sm leading-5">{tipoEstudio}</div>
          <div className="text-base font-semibold leading-6">{nombreEstudio}</div>
          <div className="text-xs leading-5">{fechaEstudio}</div>
        </div>
        <a href={url} target="_blank" className="inline-flex flex-col gap-2 items-center">
          <div className="rounded-full p-2 mx-auto" style={{ width: "35px", backgroundColor: "#D1FAE5", color: "#10B981" }}>
            <DocumentTextIcon className="w-5 h-5" />
          </div>
          <div className="font-semibold text-xs leading-6" style={{ color: "#10B981" }}>
            Ver documento
          </div>
        </a>
      </div>
    </Card>
  );
};

export default CardEstudio;
