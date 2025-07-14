"use client"
import React from 'react';
import AnalyticsDashboard from '../../src/components/AnalyticsDashboard';
import { I18nProvider } from '@/src/providers/I18nProvider';
import { AppModeProvider } from '@/src/providers/AppModeProvider';

export default function AnalyticsPage() {
  return (
    <I18nProvider>
      <AppModeProvider>
        <AnalyticsDashboard />
      </AppModeProvider>
    </I18nProvider>
  );
}