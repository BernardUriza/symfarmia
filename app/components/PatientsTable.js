import React, { useState, useEffect } from 'react';
import { Card, Title, Badge } from "@tremor/react";
import PatientForm from './PatientForm';
import FilterControls from '../controls/FilterControls';
import Pagination from '../controls/Pagination';
import CoreTable from '../controls/CoreTable';
import toast from 'react-hot-toast';
import { useConfirmationContext } from '../providers/ConfirmationContext';
import { removePatient } from '../useCases/removePatient';
import { formatDateHandler } from '../providers/formatDateHandler';

const PatientsTable = ({ patients, savePatient, key, refresh }) => {
  const { confirm } = useConfirmationContext();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [disableSave, setDisableSave] = useState(false);
  const [lengthFiltered, setLengthFiltered] = useState(patients.length);
  const itemsPerPage = 11;

  useEffect(() => {
    setFilteredPatients(patients);
  }, [patients]);

  const openForm = (item) => {
    setSelectedPatient(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedPatient(null);
    setIsFormOpen(false);
  };

  const handleSavePatient = (patient) => {
    if (selectedPatient) {
      setSelectedPatient({
        ...selectedPatient,
        name: patient.name, // Update the patient name
        // Add other properties to update here
      });
    }
    setDisableSave(true)
    var myPromise = savePatient(patient);
    toast.promise(
      myPromise,
      {
        loading: 'Cargando',
        success: () => {
          setDisableSave(false)
          closeForm();
          return `Cambios guardados con éxito "${patient.name}"`
        },
        error: (err) => {
          setDisableSave(false)
          return `Error ha sucedido: ${err.toString()}`
        },
      }
    );
  };

  const renderCell = (columnKey, item) => {
    if (columnKey === 'name') {
      return item.name;
    } else if (columnKey === 'email') {
      return item.email;
    } else if (columnKey === 'phone') {
      return item.phone;
    } else if (columnKey === 'dateOfBirth') {
      const formattedDate = formatDateHandler(item.dateOfBirth, { month: 'short' });
      return formattedDate;
    } else {
      return item[columnKey];
    }
  };
  const removeItem = async (item) => {
    try {
      await confirm("¿Estás seguro de que quieres eliminar este registro?");
      const result =  removePatient(item.id);
  
      toast.promise(
        result,
        {
          loading: 'Cargando',
          success: () => {
            refresh(false);
            return `Registro removido con éxito.`;
          },
          error: (err) => {
            return `Error ha sucedido: ${err.toString()}`;
          },
        }
      );
    } catch {
      console.log("Cancelado");
    }
  };
  const columns = [
    { isFilterColumn: true, value: 'name', key: 'name', title: 'Nombre', width: '30%' },
    { isFilterColumn: true, value: 'email', key: 'email', title: 'Correo Electrónico', width: '20%' },
    { isFilterColumn: true, value: 'phone', key: 'phone', title: 'Teléfono', width: '15%' },
    { isFilterColumn: true, value: 'dateOfBirth', key: 'dateOfBirth', title: 'Fecha de Nacimiento', width: '15%' },
  ];
  return (
    <Card style={{ "padding": "0px" }}>
      <div className="md:flex justify-between items-center p-4">
        <Title className='my-2'>Lista de Pacientes
          <Badge className='mx-3' color="green" size="sm">
            {lengthFiltered} pacientes
          </Badge>
        </Title>
        <FilterControls
          columns={columns}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          filterText={filterText}
          setFilterText={setFilterText}
          setIsFormOpen={setIsFormOpen}
        />
      </div>
      <CoreTable
        key={key}
        data={filteredPatients}
        columns={columns}
        filterText={filterText}
        selectedFilter={selectedFilter}
        itemsPerPage={itemsPerPage}
        pageNumber={pageNumber}
        openForm={openForm}
        renderCell={renderCell}
        removeItem={removeItem}
        onFiltered={(e) => { setLengthFiltered(e) }}
      />
      <Pagination
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        totalPageCount={Math.ceil(lengthFiltered / itemsPerPage)}
      />
      {isFormOpen && <PatientForm patient={selectedPatient} disableSave={disableSave} onClose={closeForm} onSave={handleSavePatient} />}
    </Card>
  );
};

export default PatientsTable;
