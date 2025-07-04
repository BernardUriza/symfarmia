import React from 'react';
import { Heading, Text } from '../atoms/Typography';
import TestimonialCard from '../molecules/TestimonialCard';
import { UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const TestimonialsSection = ({ t }) => {
  const testimonials = [
    {
      quote: t('dr_maria_quote'),
      author: t('dr_maria_name'),
      role: t('dr_maria_specialty'),
      location: t('dr_maria_location'),
      avatar: "👩‍⚕️",
      rating: 5
    },
    {
      quote: t('dr_carlos_quote'),
      author: t('dr_carlos_name'),
      role: t('dr_carlos_specialty'),
      location: t('dr_carlos_location'),
      avatar: "👨‍⚕️",
      rating: 5
    },
    {
      quote: t('dr_ana_quote'),
      author: t('dr_ana_name'),
      role: t('dr_ana_specialty'),
      location: t('dr_ana_location'),
      avatar: "👩‍⚕️",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-700 to-slate-600">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <UserCircleIcon className="w-12 h-12 text-teal-400 mr-4" />
            <Heading level={2} color="white">
              {t('transformation_voices')}
            </Heading>
          </div>
          
          <Text size="xl" color="light" className="mb-4">
            {t('real_doctor_stories')}
          </Text>
          
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-yellow-400 mx-auto"></div>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              location={testimonial.location}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
            />
          ))}
        </div>
        
        {/* Collective Message */}
        <div className="text-center">
          <Text size="xl" color="light" className="italic mb-4">
            "{t('collective_transformation')}"
          </Text>
          
          <div className="inline-flex items-center bg-teal-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-teal-400/30">
            <UserGroupIcon className="w-5 h-5 text-teal-400 mr-2" />
            <Text color="white" weight="medium">
              {t('join_transformation')}
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;