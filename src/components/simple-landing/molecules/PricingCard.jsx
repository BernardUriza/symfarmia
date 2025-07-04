import React from 'react';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import { Heading, Text } from '../atoms/Typography';
import { CheckIcon } from '@heroicons/react/24/outline';

const PricingCard = ({ 
  name,
  price,
  period,
  features,
  ctaText,
  popular = false,
  onSelect
}) => {
  return (
    <Card 
      className={`relative h-full ${popular ? 'ring-2 ring-teal-500 scale-105' : ''}`}
      variant={popular ? 'gradient' : 'default'}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Más Popular
          </span>
        </div>
      )}
      
      {/* Plan Header */}
      <div className="text-center mb-6">
        <Heading level={3} className="mb-2">
          {name}
        </Heading>
        
        <div className="mb-4">
          <span className="text-4xl font-bold text-teal-600">
            {price}
          </span>
          {period && (
            <Text color="gray" className="ml-1">
              {period}
            </Text>
          )}
        </div>
      </div>
      
      {/* Features List */}
      <div className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <CheckIcon className="w-5 h-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0" />
            <Text size="sm">
              {feature}
            </Text>
          </div>
        ))}
      </div>
      
      {/* CTA Button */}
      <Button 
        variant={popular ? 'primary' : 'outline'}
        size="large"
        className="w-full"
        onClick={onSelect}
      >
        {ctaText}
      </Button>
    </Card>
  );
};

export default PricingCard;