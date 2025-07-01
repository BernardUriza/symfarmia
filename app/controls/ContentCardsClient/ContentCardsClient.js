"use client";
import React, {useState} from "react";
import "./style.css";
import { CardEstudio } from "../CardEstudio";
import { Button, Card } from '@tremor/react';
import { formatDateHandler } from "../../providers/formatDateHandler";
import { Watch } from 'react-loader-spinner'

export const ContentCardsClient = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Destructuring patient and studies information from data
  const { patient, studies } = data;
  const handleDownloadAll = async () => {
    setIsLoading(true); // Show the loader
    // Assuming loadingState is managed elsewhere or similarly toggled
    const pdfUrls = studies.map(study => study.name);

    try {
      const response = await fetch('/api/mergePdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrls }),
      });

      if (!response.ok) {
        throw new Error('Failed to download the file');
      }

      // Receive the combined PDF and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Studies of '+patient.name+'.pdf'; // Name of the resulting PDF file
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading the combined file:', error);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };


  return (
    <Card>
    {/* Your loader */}
    {isLoading && (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
        <Watch
          height="80"
          width="80"
          radius="48"
          color="#4fa94d"
          ariaLabel="watch-loading"
          wrapperStyle={{}}
          wrapperClassName=""
          visible={true}
        />
      </div>
    )}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="header flex flex-col relative w-full">
            <p className="p">
              <span className="text-wrapper font-semibold">Nombre<br /></span>
              <span className="span">{patient.name}</span>
            </p>
          </div>
          <div className="header flex flex-col relative w-full">
            <p className="p">
              <span className="text-wrapper font-semibold">Fecha de realización<br /></span>
              <span className="span">{formatDateHandler(data.date)}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleDownloadAll} style={{height: 50}}>Descargar todo</Button>
        </div>
      </div>
      <div className="text-wrapper font-semibold my-3">Resultados</div>
      <div className="lista-de-estudios flex flex-col gap-4 relative w-full">
        {studies.map(study => (
          <CardEstudio
            key={study.id}
            tipoEstudio={study.type.category.name}
            nombreEstudio={study.type.name}
            url={study.name}
            fechaEstudio={`Fecha. ${formatDateHandler(study.createdAt, { separator: ' ' })}`}
          />
        ))}
      </div>
    </Card>
  );
};
