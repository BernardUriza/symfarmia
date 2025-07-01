"use client"
import { useState, useEffect } from 'react';
import { fetchMedicalReport } from './useCases/fetchMedicalReport';
import { ContentCardsClient } from './controls/ContentCardsClient/ContentCardsClient';
import { Watch } from 'react-loader-spinner'
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import PropTypes from 'prop-types'; // If you choose to use PropTypes

const MedicalReportDetails = ({ loading, medicalReportId }) => {
  const [data, setMedicalReportData] = useState(null);
  const [loadingPage, setLoading] = useState(loading);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const medicalReport = await fetchMedicalReport(medicalReportId);
        setMedicalReportData(medicalReport);
      } catch (error) {
        console.error('Error fetching medical report data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (medicalReportId) {
      fetchPatientData();
    }
  }, [medicalReportId]);

  if (loadingPage) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-100 flex items-center justify-center z-50">
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
    );//change by the loader
  }

  if (!data) {
    return <p>No data found for the patient.</p>;
  }

  return (
    <div className='container mx-auto px-3'>
      <div className="frame">
        <p className="centro-de-diagn">
          <span className="text-wrapper">Centro de </span>
          <span className="text-wrapper font-bold">Diagnóstico Móvil</span>
        </p>
      </div>
      <div className="flex justify-between mx-3 my-6">
        <a href="https://symfarmia.com/" target='_blank'>
          <img src="/images/symfarmia.png" alt="Logo Image" className="my-auto pt-2" width={105.426} height={40} />
        </a>
        <a href="https://symfarmia.com/">
          <HiOutlineArrowRightOnRectangle className="mx-1 w-6 h-6" />
        </a>
      </div>
      <ContentCardsClient data={data} />
    </div>
  );
};

// Optional: Using PropTypes for type checking
MedicalReportDetails.propTypes = {
  medicalReportId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default MedicalReportDetails;