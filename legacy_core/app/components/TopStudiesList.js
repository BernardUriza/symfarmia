import React from 'react';
import { Card, Text, BarList } from "@tremor/react";

const TopStudiesList = ({ medicalReports }) => {
  // Group studies by types and count the number of reports per type
  const typeCounts = medicalReports.reduce((typeCount, report) => {
    // Iterate through studies within each medical report
    report.studies.forEach((study) => {
      const { type } = study;
      const { category } = type;
      const categoryName = category.name;
      const typeName = type.name + " - " + categoryName;
      typeCount[typeName] = (typeCount[typeName] || 0) + 1;
    });
    return typeCount;
  }, {});

  // Sort types by the number of reports (descending order)
  const sortedTypes = Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1]
  );

  // Select the top five types
  const topTypes = sortedTypes.slice(0, 5);

  return (
    <Card className="">
      <Text className='pb-4' color='gray'>Top 5 de Tipos de Estudio</Text>
      <BarList
        color="green"
        data={topTypes.map(([type, count]) => ({
          value: count,
          name: type,
        }))}
        valueFormatter={(value) => `${value} reportes`}
      />
    </Card>
  );
};

export default TopStudiesList;
