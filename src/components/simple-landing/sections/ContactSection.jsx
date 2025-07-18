import React, { useState } from 'react';
import { Heading, Text } from '../atoms/Typography';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const ContactSection = ({ t }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);

    // Reset form after success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', specialty: '', phone: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-teal-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heading level={2} color="white" className="mb-6">
            {t('join_revolution')}
          </Heading>

          <Text size="xl" color="light" className="mb-8 max-w-4xl mx-auto">
            {t('revolution_subtitle')}
          </Text>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card variant="glass" padding="large">
            <Heading level={3} color="white" align="center" className="mb-6">
              {t('start_transformation')}
            </Heading>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder={t('full_name')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder={t('email_address')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                    >
                      <option value="" className="text-slate-800">
                        {t('select_specialty')}
                      </option>
                      <option value="general" className="text-slate-800">
                        {t('general_medicine')}
                      </option>
                      <option value="cardiology" className="text-slate-800">
                        {t('cardiology')}
                      </option>
                      <option value="dermatology" className="text-slate-800">
                        {t('dermatology')}
                      </option>
                      <option value="pediatrics" className="text-slate-800">
                        {t('pediatrics')}
                      </option>
                      <option value="other" className="text-slate-800">
                        {t('other_specialty')}
                      </option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder={t('phone_number')}
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="large"
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      {t('transforming')}
                    </div>
                  ) : (
                    t('start_free_trial')
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <Heading level={3} color="white" className="mb-2">
                  {t('transformation_initiated')}
                </Heading>
                <Text color="light">{t('check_email_next_steps')}</Text>
              </div>
            )}
          </Card>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">
                1,247+
              </div>
              <Text color="white">{t('doctors_transformed')}</Text>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">89%</div>
              <Text color="white">{t('time_savings')}</Text>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">4.9/5</div>
              <Text color="white">{t('satisfaction_rating')}</Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
