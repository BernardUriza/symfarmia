import React, { useState } from 'react';
import { Button, TextInput, DatePicker } from '@tremor/react';
import CustomModal from '../controls/CustomModal/CustomModal';
import { Select, SelectItem } from "@tremor/react";
import esLocale from 'date-fns/locale/es';
import { BanIcon, CheckCircleIcon } from "@heroicons/react/outline";

const PatientForm = ({ patient, onClose, onSave, disableSave}) => {
    // Set initial state based on whether patient is null
    const initialEditedPatient = patient || {
        id: '',
        name: '',
        email: '',
        phone: '',
        information: '',
        dateOfBirth: new Date(),
        gender: '',
        status: '',
    };

    const [editedPatient, setEditedPatient] = useState(initialEditedPatient);

    return (
        <CustomModal
            title={patient ? 'Administrar Paciente' : 'Nuevo Paciente'}
            visible={!!patient}
            onClose={onClose}
            widthPercentage="50"
            titleClassName="text-blue-500"
            modalClassName="p-8"
        >
            <form>
                <div className="flex">
                    <div className="w-1/2 pr-3">
                        <div className="mb-4">
                            <label>ID</label>
                            <TextInput
                                type="text"
                                name="id"
                                disabled={true}
                                value={editedPatient.id}
                                onChange={(e) => setEditedPatient({ ...editedPatient, id: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="w-1/2 mb-4">
                        <label>Status</label>
                        <Select
                            value={editedPatient.status}
                            onValueChange={(value) => setEditedPatient({ ...editedPatient, status: value })}
                        >
                            <SelectItem value="Activo" icon={CheckCircleIcon}>Activo</SelectItem>
                            <SelectItem value="Archivado" icon={BanIcon}>Archivado</SelectItem>
                        </Select>
                    </div>
                </div>
                <div className="mb-4">
                    <label>Nombre</label>
                    <TextInput
                        type="text"
                        name="name"
                        value={editedPatient.name}
                        onChange={(e) => setEditedPatient({ ...editedPatient, name: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <label>Correo Electrónico</label>
                    <TextInput
                        type="email"
                        name="email"
                        value={editedPatient.email}
                        onChange={(e) => setEditedPatient({ ...editedPatient, email: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <label>Teléfono</label>
                    <TextInput
                        type="tel"
                        name="phone"
                        value={editedPatient.phone}
                        onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <label>Información</label>
                    <TextInput
                        type="text"
                        name="information"
                        value={editedPatient.information}
                        onChange={(e) => setEditedPatient({ ...editedPatient, information: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <label>Fecha de Nacimiento</label>
                    <DatePicker
                        name="dateOfBirth"
                        value={new Date(editedPatient.dateOfBirth)}
                        onValueChange={(e) => setEditedPatient({ ...editedPatient, dateOfBirth: e })}
                        locale={esLocale}
                    />
                </div>
                <div className="mb-4">
                    <label>Género</label>
                    <Select
                        value={editedPatient.gender}
                        onValueChange={(value) => setEditedPatient({ ...editedPatient, gender: value })}
                    >
                        <SelectItem value="Male">Masculino</SelectItem>
                        <SelectItem value="Female">Femenino</SelectItem>
                        <SelectItem value="Other">Otro</SelectItem>
                    </Select>
                </div>
            </form>
            <div className="flex">
                <Button type="primary" disabled={disableSave} className='ml-auto' onClick={() => onSave(editedPatient)}>
                    Guardar
                </Button>
            </div>
        </CustomModal>
    );
};

export default PatientForm;
