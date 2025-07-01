import React, { useState, useEffect } from 'react';
import { fetchCategories } from './useCases/fetchCategories';
import { saveCategory } from './useCases/saveCategory';
import { fetchStudyTypes } from './useCases/fetchStudyTypes';
import { saveStudyType } from './useCases/saveStudyType';
import CategoriesTable from './components/CategoriesTable';
import StudyTypesTable from './components/StudyTypesTable';

const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [error, setError] = useState('');
  const [key, setKey] = useState(1);

  const getCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    }
    setKey((prevKey) => prevKey + 1);
  };

  const getStudyTypes = async () => {
    try {
      const data = await fetchStudyTypes();
      setStudyTypes(data);
    } catch (error) {
      setError(error.message);
    }
    setKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    getCategories();
    getStudyTypes();
  }, []);

  const handleSaveCategory = async (editedCategory) => {
    try {
      const result = await saveCategory(editedCategory);
      if (result.success) {
        getCategories(); // Refresh the list of categories
      } else {
        setError('Error while saving category data in the API.');
      }
    } catch (error) {
      setError('Error while saving category data: ' + error.message);
    }
  };
  
  const handleSaveStudyType = (editedStudyType) => {
    return new Promise((resolve, reject) => {
      saveStudyType(editedStudyType)
        .then((result) => {
          if (result.success) {
            getStudyTypes(); // Refresh the list of study types
            resolve(result);
          } else {
            const errorMessage = 'Error while saving StudyType data in the API.';
            setError(errorMessage);
            reject(new Error(errorMessage));
          }
        })
        .catch((error) => {
          setError('Error while saving StudyType data: ' + error.message);
          reject(error);
        });
    });
  };
  
  

  return (
    <div className='pt-3'>
      {error && <div className="text-red-500">{error}</div>}
      <div className='pt-3'>
        <StudyTypesTable key={key} categories={categories} studyTypes={studyTypes} saveStudyType={handleSaveStudyType} refresh={getStudyTypes} />
      </div>
      <div className='pt-3'>
        <CategoriesTable key={key} categories={categories} saveCategory={handleSaveCategory} />
      </div>
    </div>
  );
};

export default Settings;
