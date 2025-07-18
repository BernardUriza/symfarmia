import React from 'react';
import Logo from '../atoms/Logo';
import { Text } from '../atoms/Typography';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

const Footer = ({ t }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Logo size="medium" variant="white" />

            <Text color="gray" className="mb-6 max-w-md mt-4">
              {t('footer_description')}
            </Text>

            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <ServerIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <Text color="white" weight="semibold" className="mb-4">
              {t('product')}
            </Text>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-gray-400 hover:text-teal-400 transition-colors"
              >
                {t('features')}
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-teal-400 transition-colors"
              >
                {t('pricing')}
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-teal-400 transition-colors"
              >
                {t('security')}
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <Text color="white" weight="semibold" className="mb-4">
              {t('support')}
            </Text>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-gray-400 hover:text-teal-400 transition-colors"
              >
                {t('documentation')}
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-teal-400 transition-colors"
              >
                {t('contact')}
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-teal-400 transition-colors"
              >
                {t('privacy')}
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <Text color="gray">
            © 2024 SYMFARMIA. {t('all_rights_reserved')}
          </Text>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
