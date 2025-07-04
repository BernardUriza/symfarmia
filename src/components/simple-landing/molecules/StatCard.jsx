import React from 'react';
import Card from '../atoms/Card';
import { Heading, Text } from '../atoms/Typography';

const StatCard = ({ 
  number, 
  label, 
  description,
  icon: Icon,
  variant = 'default'
}) => {
  return (
    <Card variant={variant} className="text-center">
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="w-8 h-8 text-red-500" />
        </div>
      )}
      
      <Heading level={2} color="teal" className="mb-2">
        {number}
      </Heading>
      
      <Text weight="semibold" className="mb-2">
        {label}
      </Text>
      
      {description && (
        <Text size="sm" color="gray">
          {description}
        </Text>
      )}
    </Card>
  );
};

export default StatCard;