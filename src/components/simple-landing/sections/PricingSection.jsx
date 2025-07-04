import React from 'react';
import { Heading, Text } from '../atoms/Typography';
import PricingCard from '../molecules/PricingCard';
import { CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PricingSection = ({ t }) => {
  const plans = [
    {
      name: t('plan_free'),
      price: 'GRATUITO',
      period: '',
      features: [
        t('feature_5_consultations'),
        t('feature_basic_transcription'),
        t('feature_email_support'),
        t('feature_basic_reports')
      ],
      ctaText: t('start_free'),
      popular: false
    },
    {
      name: t('plan_professional'),
      price: '$299',
      period: 'MXN/mes',
      features: [
        t('feature_unlimited_consultations'),
        t('feature_ai_diagnosis'),
        t('feature_automated_prescriptions'),
        t('feature_priority_support'),
        t('feature_advanced_analytics'),
        t('feature_pdf_merger'),
        t('feature_custom_templates')
      ],
      ctaText: t('transform_now'),
      popular: true
    },
    {
      name: t('plan_clinic'),
      price: t('custom_pricing'),
      period: '',
      features: [
        t('feature_multi_doctor'),
        t('feature_clinic_management'),
        t('feature_dedicated_support'),
        t('feature_custom_integration'),
        t('feature_training_included'),
        t('feature_white_label')
      ],
      ctaText: t('contact_sales'),
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <CurrencyDollarIcon className="w-12 h-12 text-teal-400 mr-4" />
            <Heading level={2} color="white">
              {t('transformation_plans')}
            </Heading>
          </div>
          
          <Text size="xl" color="light" className="mb-4">
            {t('choose_transformation_level')}
          </Text>
          
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto"></div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              ctaText={plan.ctaText}
              popular={plan.popular}
              onSelect={() => console.log(`Selected ${plan.name}`)}
            />
          ))}
        </div>
        
        {/* Money Back Guarantee */}
        <div className="text-center">
          <div className="inline-flex items-center bg-teal-500/20 backdrop-blur-sm px-8 py-4 rounded-full border border-teal-400/30">
            <ShieldCheckIcon className="w-6 h-6 text-teal-400 mr-3" />
            <Text color="white" weight="medium" size="lg">
              {t('money_back_guarantee')}
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;