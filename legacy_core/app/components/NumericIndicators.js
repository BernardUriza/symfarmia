// NumericIndicators.js
import React from 'react';
import { Text, Metric, Card, Button } from "@tremor/react";
import { UserGroupIcon, ClipboardListIcon, DocumentAddIcon } from '@heroicons/react/solid';

const NumericIndicators = ({setOpenForm, patientsCount, reportsSentCount}) => {
  return (
    <>
      <div className='pb-3 w-100'>
        <Button onClick={setOpenForm} style={{width: "100%"}}>
          <div className='flex' style={{ height: "52px" }}>
            <DocumentAddIcon style={{ width: "20px" }}></DocumentAddIcon>
            <span className='mx-3 my-auto' style={{fontSize: "17px"}}>Nuevo resultado clínico</span>
          </div>
        </Button>
      </div>
      <div className="pb-3" style={{ height: "104px" }}>
        <Card className="h-full">
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
      <div style={{ height: "110px" }}>
        <Card className="h-full">
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
