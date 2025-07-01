import React, { useState } from 'react';
import { Button, TextInput, DatePicker } from '@tremor/react';
import CustomModal from '../controls/CustomModal/CustomModal';

const CategoryForm = ({ category, onClose, onSave, disableSave }) => {
    // Set initial state based on whether category is null
    const initialEditedCategory = category || {
        id: '',
        name: '',
        email: '',
        phone: '',
        information: '',
        dateOfBirth: new Date(),
        gender: '',
        status: '',
    };

    const [editedCategory, setEditedCategory] = useState(initialEditedCategory);

    return (
        <CustomModal
            title={category ? 'Administrar Categoría' : 'Nueva Categoría'}
            visible={!!category}
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
                                value={editedCategory.id}
                                onChange={(e) => setEditedCategory({ ...editedCategory, id: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <label>Nombre</label>
                    <TextInput
                        type="text"
                        name="name"
                        value={editedCategory.name}
                        onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                    />
                </div>
            </form>
            <div className="flex">
                <Button type="primary" disabled={disableSave} className='ml-auto' onClick={() => onSave(editedCategory)}>
                    Guardar
                </Button>
            </div>
        </CustomModal>
    );
};

export default CategoryForm;
