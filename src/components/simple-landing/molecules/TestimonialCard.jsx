import React from 'react';
import Card from '../atoms/Card';
import { Text } from '../atoms/Typography';
import { StarIcon } from '@heroicons/react/24/solid';

const TestimonialCard = ({
  quote,
  author,
  role,
  location,
  rating = 5,
  avatar,
}) => {
  return (
    <Card className="h-full">
      {/* Rating Stars */}
      <div className="flex space-x-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
        ))}
      </div>

      {/* Quote */}
      <Text className="mb-6 italic leading-relaxed">"{quote}"</Text>

      {/* Author Info */}
      <div className="flex items-center">
        {avatar && <div className="mr-3 text-2xl">{avatar}</div>}
        <div>
          <Text weight="semibold" className="mb-1">
            {author}
          </Text>
          <Text size="sm" color="gray">
            {role}
          </Text>
          {location && (
            <Text size="xs" color="gray">
              {location}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;
