import React, { useState } from 'react';
import { Button, Select, TextInput, Textarea, SelectItem } from '@tremor/react';
import CustomModal from '../controls/CustomModal/CustomModal';

const StudyTypeForm = ({ studyType, onClose, onSave, disableSave, categories }) => {
  // Set initial state based on whether studyType is null
  const initialEditedStudyType = studyType || {
    id: '',
    name: '',
    description: '',
    categoryId: '', // Use categoryId to store the selected category id
  };

  const [editedStudyType, setEditedStudyType] = useState(initialEditedStudyType);

  return (
    <CustomModal
      title={studyType ? 'Administrar Tipo de Estudio' : 'Nuevo Tipo de Estudio'}
      visible={!!studyType}
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
                value={editedStudyType.id}
                onChange={(e) => setEditedStudyType({ ...editedStudyType, id: e.target.value })}
              />
            </div>
          </div>
          <div className="w-1/2">
            <div className="mb-4">
              <label>Categoría</label>
              <Select
                value={editedStudyType.categoryId}
                onValueChange={(e) => setEditedStudyType({ ...editedStudyType, categoryId: e.target.value })}
              >
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} style={{ "cursor": "pointer" }}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label>Nombre</label>
          <TextInput
            type="text"
            name="name"
            value={editedStudyType.name}
            onChange={(e) => setEditedStudyType({ ...editedStudyType, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label>Descripción</label>
          <Textarea
            type="text"
            name="description"
            value={editedStudyType.description}
            onChange={(e) => setEditedStudyType({ ...editedStudyType, description: e.target.value })}
          />
        </div>
      </form>
      <div className="flex">
        <Button type="primary" disabled={disableSave} className="ml-auto" onClick={() => onSave(editedStudyType)}>
          Guardar
        </Button>
      </div>
    </CustomModal>
  );
};

export default StudyTypeForm;
