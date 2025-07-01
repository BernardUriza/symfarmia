// ClinicalResultForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Button, TextInput, DatePicker } from '@tremor/react';
import CustomModal from '../controls/CustomModal/CustomModal';
import TableCellButtonIcon from '../controls/TableCellButtonIcon';
import { PencilIcon } from '@heroicons/react/24/outline';
import PatientForm from './PatientForm';
import CustomStatus from '../controls/CustomStatus';
import StudieCard from '../controls/StudieCard';
import { es } from 'date-fns/locale';
import StudyForm from './StudyForm';
import toast from 'react-hot-toast';
import { useConfirmationContext } from '../providers/ConfirmationContext';

const ClinicalResultForm = ({ report, categories, refresh, onClose, onSave, onRemoveStudy, onSaveStudy, onSavePatient, onSend, disableSave }) => {
  const [isPatientEditorOpen, setPatientEditorOpen] = useState(false);
  const { confirm } = useConfirmationContext();
  const [isStudyFormOpen, setStudyFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [disableSavePatient, setDisableSavePatient] = useState(false);
  const [disableSaveStudy, setDisableSaveStudy] = useState(false);
  let sliderRef = useRef(null);
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  useEffect(() => {
    setEditedReport(report || getDefaultReport());
  }, [report]);

  const getDefaultReport = () => {
    const parseISODate = (isoDateString) => isoDateString ? new Date(isoDateString) : new Date();

    return {
      id: report?.id ?? '0',
      date: parseISODate(report?.date),
      name: report?.name ?? '',
      status: report?.status ?? 'Pendiente',
      patient: {
        name: report?.patient?.name ?? '',
        email: report?.patient?.email ?? '',
        phone: '33',
        information: 'information',
        dateOfBirth: parseISODate(report?.patient?.dateOfBirth),
        gender: report?.patient?.gender ?? 'NA',
        status: report?.patient?.status ?? 'Activo',
      },
      studies: report?.studies ?? [],
    };
  };

  const [editedReport, setEditedReport] = useState(getDefaultReport());

  const editPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientEditorOpen(true);
  };

  const closePatientEditor = () => {
    setPatientEditorOpen(false);
  };

  const handlePatientSave = async (editedPatientData) => {
    setDisableSavePatient(true);
    try {
      await onSavePatient(editedPatientData);
      setDisableSavePatient(false);
      setPatientEditorOpen(false);
      toast.success(`Cambios guardados, paciente ${editedPatientData.name} modificado.`);
      setEditedReport((prevReport) => ({
        ...prevReport,
        status: 'Pendiente'
      }));
      await onSave(editedReport, false)
      await refresh()
    } catch (err) {
      setDisableSavePatient(false);
      toast.error(`Error ha sucedido: ${err.toString()}`);
    }
  };

  const clickToOpenStudyForm = (selected) => {
    setSelectedStudy(selected);
    setStudyFormOpen(true);
  };

  const closeStudyForm = () => {
    setStudyFormOpen(false);
  };

  const handleStudySave = async (editedStudy) => {
    try {
      setDisableSaveStudy(true); // Disable the save button immediately to prevent multiple submissions

      setEditedReport((prevReport) => ({
        ...prevReport,
        status: 'Pendiente',
        studies: [...prevReport.studies, editedStudy],
      }));
      sliderRef.slickGoTo(0);
      
      if (editedReport.id > 0) {
        editedStudy.medicalReportId = editedReport.id;
        await onSaveStudy(editedStudy);
        await onSave(editedReport, false)
        toast.success('Cambios guardados con éxito, estudio modificado en el reporte.');
      } else {
        toast.success('Cambios guardados con éxito, estudio creado para el nuevo reporte.');
      }

      // Operations after successful save
      setStudyFormOpen(false);
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      toast.error(`Error ha sucedido: ${err.toString()}`);
    } finally {
      setDisableSaveStudy(false); // Re-enable the save button after operation completion
    }
  };

  const handleStudyRemove = async (studyToRemove) => {
    try {
      await confirm("¿Estás seguro de que quieres eliminar este registro?");

      setDisableSaveStudy(true);
      // If the report has a valid ID, assume it's already saved and handle the removal accordingly
      if (editedReport.id && editedReport.id > 0) {
        await onRemoveStudy(studyToRemove.id);
        toast.success('Estudio removido exitosamente');

        // Operations after successful remove
        setStudyFormOpen(false);


        // Update the local state to reflect the removal of the study
        setEditedReport(prevReport => ({
          ...prevReport,
          studies: prevReport.studies.filter(study => study.id !== studyToRemove.id),
        }));

        editedReport.status = 'Pendiente';
        await onSave(editedReport, false);
      }
    } catch (err) {
      if (err)
        toast.error(`Error occurred: ${err?.toString()}`);
    } finally {
      setDisableSaveStudy(false); // Optional: Manage loading state
    }
  };

  const isSaveEnabled = !editedReport.patient.name &&  !editedReport.patient.id;

  return (
    <>
      <CustomModal
        title={report ? 'Resultados Clinicos' : 'Nuevo Reporte'}
        visible={true}
        onClose={onClose}
        widthPercentage="80"
        titleClassName="text-blue-500"
        modalClassName="p-8"
        footerElement={
          <div className="flex justify-end">
            <Button variant="light" className="ml-3" onClose={onClose} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              className="ml-3" disabled={disableSave}
              onClose={onClose}
              onClick={async () => {
                if(report){
                  onSend(editedReport);
                }
                else{
                  onSend(await onSave(editedReport, false), true).then(refresh)
                }
              }}
            >
              {report ? 'Enviar al cliente' : 'Guardar y enviar al cliente'}
            </Button>

            <Button disabled={disableSave && isSaveEnabled} type="primary" className="ml-3" onClick={() => {onSave(editedReport).then(refresh)}}>
              Guardar
            </Button>
          </div>
        }
      >

        <form>
          <div className="flex">
            <div className="flex-1 flex">
              <div className="flex-1 pr-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Folio / ID</label>
                  <TextInput
                    type="text"
                    name="id"
                    disabled={true}
                    placeholder="ID"
                    value={editedReport.id}
                    onChange={(e) => setEditedReport({ ...editedReport, id: e.target.value })}
                    className="mt-1 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex-1 pr-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <DatePicker
                    name="date"
                    value={new Date(editedReport.date)}
                    enableClear={false}
                    onValueChange={(e) => setEditedReport({ ...editedReport, date: e, status: 'Pendiente' })}
                    className="mt-1 rounded-md"
                    locale={esLocale}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 w-48">
                <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                <CustomStatus status={editedReport.status} />
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 mb-4">
              <label className="block text-sm font-medium text-gray-700">Nombre{!editedReport.patient.name && <span style={{ color: 'red' }}>*</span>}</label>
              <div className="flex">
                <TextInput
                  type="text"
                  name="name"
                  readOnly={!!report}
                  placeholder="Escribe el nombre del paciente."
                  value={editedReport.patient.name}
                  onValueChange={(value) => setEditedReport({ ...editedReport, patient: { ...editedReport.patient, name: value } })}
                  className="mt-1 border rounded-md flex-1"
                />
                <TableCellButtonIcon visible={report} text="Editar" icon={<PencilIcon className="w-6 h-6" />} onClick={() => editPatient(editedReport.patient)} />
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-4 mr-2">
                <label className="block text-sm font-medium text-gray-700">Email{!editedReport.patient.email && <span style={{ color: 'red' }}>*</span>}</label>
                <TextInput
                  type="text"
                  name="id"
                  readOnly={!!report}
                  placeholder="Escribe el mail del paciente."
                  value={editedReport.patient.email}
                  onValueChange={(value) => setEditedReport({ ...editedReport, patient: { ...editedReport.patient, email: value } })}
                  className="mt-1 border rounded-md"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <TextInput
                  type="text"
                  name="id"
                  readOnly={!!report}
                  placeholder="Escribe el teléfono del paciente."
                  value={editedReport.patient.phone}
                  onValueChange={(value) => setEditedReport({ ...editedReport, patient: { ...editedReport.patient, phone: value } })}
                  className="mt-1 border rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="mb-4 max-w-full ml-3">
            <label className="block text-sm font-medium text-gray-700">Estudios</label>
            <Slider 
              ref={slider => {
                sliderRef = slider;
              }} {...sliderSettings}>{
                editedReport.studies
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Ordena de más reciente a más antiguo
                  .map((study, index) => (
                    <StudieCard key={index} actionLink={clickToOpenStudyForm} clickFileLink={study.name} studieData={study} />
                  ))
              }
              <StudieCard
                newCard={true}
                openNewStudyForm={(e) => {
                  e.preventDefault();
                  clickToOpenStudyForm(null);
                }}
              />
            </Slider>
          </div>
        </form>
      </CustomModal>
      {isPatientEditorOpen && (
        <PatientForm
          patient={selectedPatient}
          onClose={closePatientEditor}
          onSave={handlePatientSave}
          disableSave={disableSavePatient}
        />
      )}
      {isStudyFormOpen && (
        <StudyForm
          categories={categories}
          study={selectedStudy}
          onClose={closeStudyForm}
          onSave={handleStudySave}
          onRemove={handleStudyRemove}
          disabledSave={disableSaveStudy}
        />
      )}
    </>
  );
};

export default ClinicalResultForm;
