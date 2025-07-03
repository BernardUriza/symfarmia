// NumericIndicators.js
import React from 'react';
import { Text, Metric, Card, Button } from "@tremor/react";
import { UserGroupIcon, ClipboardListIcon, DocumentAddIcon } from '@heroicons/react/24/solid';
import { useAppMode } from '../../providers/AppModeProvider';

const NumericIndicators = ({setOpenForm, patientsCount, reportsSentCount}) => {
  const { isDemoMode } = useAppMode();
  return (
    <>
      <div className={`pb-3 w-100 ${isDemoMode ? 'animate-pulse' : ''}`}>
        <Button onClick={setOpenForm} style={{width: "100%"}} className={isDemoMode ? 'ring-2 ring-blue-300' : ''}>
          <div className='flex' style={{ height: "52px" }}>
            <DocumentAddIcon style={{ width: "20px" }}></DocumentAddIcon>
            <span className='mx-3 my-auto' style={{fontSize: "17px"}}>Nuevo resultado clínico</span>
          </div>
        </Button>
      </div>
      <div className={`pb-3 ${isDemoMode ? 'animate-pulse' : ''}`} style={{ height: "104px" }}>
        <Card className={`h-full ${isDemoMode ? 'ring-2 ring-green-300' : ''}`}>
          <div className='flex'>
            <div>
              <Text>Pacientes</Text>
              <Metric>{patientsCount}</Metric>
            </div>
            <p className="flex-1"></p>
            <UserGroupIcon style={{ width: "36px", color: "#6B7280", height: "36px" }}></UserGroupIcon>
          </div>
        </Card>
      </div>
      <div className={isDemoMode ? 'animate-pulse' : ''} style={{ height: "110px" }}>
        <Card className={`h-full ${isDemoMode ? 'ring-2 ring-purple-300' : ''}`}>
          <div className='flex'>
            <div>
              <Text>Resultados enviados</Text>
              <Metric>{reportsSentCount}</Metric>
            </div>
            <p className="flex-1"></p>
            <ClipboardListIcon style={{ width: "36px", color: "#6B7280", height: "36px" }}></ClipboardListIcon>
          </div>
        </Card>
      </div>
    </>
  );
};

export default NumericIndicators;
