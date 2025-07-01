import React, { useState, useEffect } from 'react';
import { Grid, Col } from '@tremor/react';
import NumericIndicators from './components/NumericIndicators';
import TopStudiesList from './components/TopStudiesList';
import ClinicalResultsTable from './components/ClinicalResultsTable';
import { fetchMedicalReports, fetchPatients, saveMedicalReports, savePatient } from './useCases';
import { fetchCategories, saveStudy, removeStudy } from './useCases';

const Dashboard = ({ setLoadingState }) => {
  const [patientsCount, setPatientsCount] = useState(0);
  const [reportsSentCount, setReportsSentCount] = useState(0);
  const [studiesData, setStudiesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyClinicalResultsTable, setKeyClinicalResultsTableState] = useState(1);
  const [openForm, setOpenForm] = useState(false);

  const incrementKeyClinicalResultsTable = () => setKeyClinicalResultsTableState(prevKey => prevKey + 1);

  const handleError = (error, customMessage = '') => {
    console.error(`${customMessage} ${error.message}`);
    // Here, you could log to an external service or show a notification to the user
  };

  const fetchData = async (loadingStateActive = true) => {
    try {
      if (loadingStateActive) setLoadingState(true);
      const [medicalReports, categoriesData, patients] = await Promise.all([
        fetchMedicalReports(),
        fetchCategories(),
        fetchPatients(),
      ]);

      setStudiesData(medicalReports);
      incrementKeyClinicalResultsTable();
      setCategories(categoriesData);
      setPatientsCount(patients.length);
      setReportsSentCount(medicalReports.length);
    } catch (error) {
      handleError(error, 'Error fetching data: ');
    } finally {
      if (loadingStateActive) setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSaveReport = async (editedReport) => {
    try {
      const result = await saveMedicalReports(editedReport);
      if (result.success) {
        setOpenForm(false);
        return result.data; // Optionally, you can return something useful here
      } else {
        console.error('Error saving the medical report in the API.');
        throw new Error('Error saving the medical report.');
      }
    } catch (error) {
      handleError(error, 'Error saving the medical report: ');
      throw error; // Rethrowing the error if you need further error handling upstream
    }
  };

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => {
    incrementKeyClinicalResultsTable();
    setOpenForm(false);
  };

  return (
    <div className='pt-3'>
      <Grid numItems={1} numItemsLg={3} className="gap-2">
        <Col numColSpan={1} numColSpanLg={1}>
          <NumericIndicators setOpenForm={handleOpenForm} patientsCount={patientsCount} reportsSentCount={reportsSentCount} />
        </Col>
        <Col numColSpan={1} numColSpanLg={2}>
          <TopStudiesList medicalReports={studiesData} categories={categories}/>
        </Col>
      </Grid>
      <div className='pt-3'>
        <ClinicalResultsTable onClose={handleCloseForm} isOpenForm={openForm} key={keyClinicalResultsTable} reports={studiesData} categories={categories} save={handleSaveReport} saveStudy={saveStudy} savePatient={savePatient} refresh={fetchData} removeStudy={removeStudy} setKeyClinicalResultsTable={incrementKeyClinicalResultsTable}/>
      </div>
    </div>
  );
};

export default Dashboard;
