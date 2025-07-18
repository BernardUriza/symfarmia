import React from 'react';
import Card from '../atoms/Card';
import { Heading, Text } from '../atoms/Typography';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  variant = 'default',
  iconColor = 'text-teal-600',
}) => {
  return (
    <Card
      variant={variant}
      className="text-center hover:shadow-xl transition-shadow duration-300"
    >
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className={`w-12 h-12 ${iconColor}`} />
        </div>
      )}

      <Heading level={4} className="mb-3">
        {title}
      </Heading>

      <Text color="gray" className="leading-relaxed">
        {description}
      </Text>
    </Card>
  );
};

export default FeatureCard;
