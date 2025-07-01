// StudieCard.js
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DocumentAddIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver'; // Importing file-saver

// Add this function outside of the StudieCard component

const StudieCard = ({ clickFileLink, actionLink, studieData, newCard, document, openNewStudyForm }) => {
  if (newCard) {
    return (
      <div className="rounded-lg p-4 shadow-md mb-3 mr-3" style={{ height: '110px' }} key={999999999999}>
        <p className="text-lg font-semibold flex items-center justify-center h-full">
          <a href={"/"} onClick={openNewStudyForm} rel="noopener noreferrer" className='text-green-500 flex' >
            <div className="bg-green-100 items-center justify-center rounded-full p-2 mr-2" style={{ height: '43x' }}>
              <DocumentAddIcon className="w-6 h-6" />
            </div>
            <div className='p-2'>Agregar Estudio</div>
          </a>
        </p>
      </div>
    );
  }
  if (studieData) {
    var { type, createdAt, title } = studieData;
    var { category, name } = type;
    // Function to handle opening the study link
    const handleOpenStudyForm = (e) => {
      e.preventDefault();
      if (actionLink && studieData) {
        actionLink(studieData);
      }
    };

    // Formatea la fecha
    const formattedDate = format(new Date(createdAt), 'dd MMMM yyyy', { locale: es });

    // Function to handle file download
    const handleFileDownload = (e) => {
      e.preventDefault();
      saveAs(clickFileLink, title); // Using file-saver to download with a custom name
    };
    // Function to handle file open
    const handleFileInNewTab = () => {
      window.open(clickFileLink, '_blank');
    };  

    if (document) {
      return (
        <div className="rounded-lg p-4 shadow-md mb-3" style={{ height: '110px' }}>
          <p className="text-sm flex items-center justify-between h-full">
            <a href='./' onClick={handleFileDownload} rel="noopener noreferrer" className='flex' >
              <div className='p-2' style={{maxWidth: 180}}>
                <div className='text-gray-500'>Documento</div>
                <div className='font-bold onhoverunderline'>{title}</div>
              </div>
            </a>

            <div onClick={handleFileInNewTab} className="text-green-500 line-clamp-1" style={{ cursor: "pointer", fontSize: '13px', width: "140px !important" }}>
              <div className="bg-green-100 items-center justify-center rounded-full p-2 mx-auto" style={{ width: "35px" }}>
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <span>Ver documento</span>
            </div>
          </p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg p-4 shadow-md mb-3 mr-3" key={studieData.id} style={{ height: '110px' }}>
        <div className="flex justify-between items-center mb-2">
          <div className='w-auto'>
            <div style={{ height: '15px', position: 'relative' }}>
              <p className="text-gray-600 text-sm overflow-hidden whitespace-nowrap truncate" style={{ position: 'absolute', bottom: 0 }} title={category.name}>{category.name}</p>
            </div>
            <div style={{ height: '55px', position: 'relative', overflow: 'hidden', width: '200px' }}>
              <a href='./' onClick={handleOpenStudyForm} className="text-lg font-bold onhoverunderline" style={{ maxHeight: '40px', maxWidth: '240px' }}>
                {name}
              </a>
            </div>
            <p className="text-gray-600 text-sm line-clamp-1">Fecha: {formattedDate}</p>
          </div>
          <div onClick={handleFileInNewTab} className="text-green-500 line-clamp-1" style={{ cursor: "pointer", fontSize: '13px', width: "140px !important" }}>
            <div className="bg-green-100 items-center justify-center rounded-full p-2 mx-auto" style={{ width: "35px" }}>
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <span>Ver documento</span>
          </div>
        </div>
      </div>
    );
  }
};

export default StudieCard;
