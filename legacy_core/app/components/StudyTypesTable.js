// Import necessary dependencies and components
import React, { useState, useEffect } from 'react';
import { Card, Title, Badge } from "@tremor/react";
import FilterControls from '../controls/FilterControls';
import Pagination from '../controls/Pagination';
import CoreTable from '../controls/CoreTable';
import toast from 'react-hot-toast';
import StudyTypeForm from './StudyTypeForm'; // Import the StudyTypeForm component

const StudyTypesTable = ({ studyTypes, categories, saveStudyType, key, refresh }) => {
  const [selectedStudyType, setSelectedStudyType] = useState(null);
  const [filteredStudyTypes, setFilteredStudyTypes] = useState(studyTypes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [lengthFiltered, setLengthFiltered] = useState(studyTypes.length);
  const [disableSave, setDisableSave] = useState(false);
  const itemsPerPage = 11;

  useEffect(() => {
    setFilteredStudyTypes(studyTypes);
  }, [studyTypes]);

  const openForm = (item) => {
    setSelectedStudyType(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedStudyType(null);
    setIsFormOpen(false);
  };

  const handleSaveStudyType = (studyType) => {
    if (selectedStudyType) {
      setSelectedStudyType({
        ...selectedStudyType,
        name: studyType.name, // Update the studyType name
        // Add other properties to update here
      });
    }
    setDisableSave(true);
    var myPromise = saveStudyType(studyType);
    toast.promise(
      myPromise,
      {
        loading: 'Cargando',
        success: () => {
          setDisableSave(false);
          refresh();
          closeForm();
          return `Cambios guardados con éxito "${studyType.name}"`;
        },
        error: (err) => {
          setDisableSave(false);
          console.log(err)
          return `Error ha sucedido: ${err.response.statusText.toString()}`;
        },
      }
    );
  };

  const renderCell = (columnKey, item) => {
    if (columnKey === 'description') {
      // Split the description into words
      const words = item[columnKey].split(' ');
  
      // Take the first 30 words and join them back into a string
      const shortenedDescription = words.slice(0, 12).join(' ');
  
      // Add ellipsis (...) if the description was truncated
      const ellipsis = words.length > 2 ? '...' : '';
  
      return shortenedDescription + ellipsis;
    }
    if (columnKey === 'category.name') {
      return item['category'].name
    }
    return item[columnKey];
  };
  
  useEffect(() => {
    setPageNumber(1); // Reset the pageNumber when filterText changes
  }, [filterText]);
  
  const columns = [
    { isFilterColumn: true, key: 'name', value: 'name', title: 'Nombre', width: '30%' },
    { isFilterColumn: true, key: 'category.name', value: 'category.name', title: 'Categoría', width: '30%' },
    { isFilterColumn: true, key: 'description', value: 'description', title: 'Descripción', width: '30%' },
    // Add other columns as needed
  ];

  return (
    <Card style={{ "padding": "0px" }}>
      <div className="md:flex justify-between items-center p-4">
        <Title className='my-2'>Lista de Tipos de Estudio
          <Badge className='mx-3' color="green" size="sm">
            {lengthFiltered} tipos de estudio
          </Badge>
        </Title>
        <FilterControls
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          filterText={filterText}
          setFilterText={setFilterText}
          setIsFormOpen={setIsFormOpen}
          columns={columns}
        />
      </div>
      <CoreTable
        key={key}
        data={filteredStudyTypes}
        columns={columns}
        filterText={filterText}
        selectedFilter={selectedFilter}
        itemsPerPage={itemsPerPage}
        pageNumber={pageNumber}
        openForm={openForm}
        renderCell={renderCell} // Modify as needed
        onFiltered={(e) => { setLengthFiltered(e) }}
      />
      <Pagination
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        totalPageCount={Math.ceil(lengthFiltered / itemsPerPage)}
      />
      {isFormOpen && <StudyTypeForm categories={categories} disableSave={disableSave} studyType={selectedStudyType} onClose={closeForm} onSave={handleSaveStudyType} />}
    </Card>
  );
};

export default StudyTypesTable;
