"use client"
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import MedicalReportDetails from '../../MedicalReportDetails';

export default async function Page({ params }) {
  const { token } = await params;
  const [decodedToken, setDecodedToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decodeToken = async () => {
      try {
        const decoded = jwt.verify(token, 'tu_secreto_secreto');
        setDecodedToken(decoded);
      } catch (error) {
        console.error('Error decodificando el token:', error);
        // Manejar el error, por ejemplo, redirigir a una página de error
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      decodeToken();
    }
  }, [token]);

  return (
    <MedicalReportDetails loading={loading} medicalReportId={decodedToken?.medicalReportId} />
  );
};