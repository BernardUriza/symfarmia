/**
 * ActionButton Usage Examples
 * 
 * This file demonstrates various ways to use the ActionButton component
 * across different medical system scenarios.
 */

import React from 'react';
import ActionButton from './ActionButton';
import { 
  UserPlusIcon, 
  UserIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  BeakerIcon, 
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ActionButtonExamples = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Basic Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              onClick={() => alert('Add New Patient')}
              text="Add New Patient"
              icon={UserPlusIcon}
              color="emerald"
            />
            <ActionButton
              onClick={() => alert('Add Doctor')}
              text="Add Doctor"
              icon={UserIcon}
              color="blue"
            />
            <ActionButton
              onClick={() => alert('Add Study')}
              text="Add Study"
              icon={PlusIcon}
              color="purple"
            />
          </div>
        </section>

        {/* Size Variations */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Size Variations</h2>
          <div className="flex flex-wrap items-center gap-4">
            <ActionButton
              onClick={() => {}}
              text="XS Button"
              size="xs"
              color="blue"
            />
            <ActionButton
              onClick={() => {}}
              text="Small Button"
              size="sm"
              color="emerald"
            />
            <ActionButton
              onClick={() => {}}
              text="Medium Button"
              size="md"
              color="purple"
            />
            <ActionButton
              onClick={() => {}}
              text="Large Button"
              size="lg"
              color="orange"
            />
            <ActionButton
              onClick={() => {}}
              text="XL Button"
              size="xl"
              color="red"
            />
          </div>
        </section>

        {/* Variant Styles */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Variant Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              onClick={() => {}}
              text="Filled Button"
              icon={DocumentTextIcon}
              variant="filled"
              color="blue"
            />
            <ActionButton
              onClick={() => {}}
              text="Outline Button"
              icon={DocumentTextIcon}
              variant="outline"
              color="blue"
            />
            <ActionButton
              onClick={() => {}}
              text="Ghost Button"
              icon={DocumentTextIcon}
              variant="ghost"
              color="blue"
            />
          </div>
        </section>

        {/* Color Themes */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Color Themes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ActionButton
              onClick={() => {}}
              text="Blue Theme"
              icon={ChartBarIcon}
              color="blue"
            />
            <ActionButton
              onClick={() => {}}
              text="Emerald Theme"
              icon={UserPlusIcon}
              color="emerald"
            />
            <ActionButton
              onClick={() => {}}
              text="Purple Theme"
              icon={BeakerIcon}
              color="purple"
            />
            <ActionButton
              onClick={() => {}}
              text="Orange Theme"
              icon={CalendarIcon}
              color="orange"
            />
            <ActionButton
              onClick={() => {}}
              text="Red Theme"
              icon={TrashIcon}
              color="red"
            />
            <ActionButton
              onClick={() => {}}
              text="Gray Theme"
              icon={CogIcon}
              color="gray"
            />
          </div>
        </section>

        {/* States */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Button States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              onClick={() => {}}
              text="Normal State"
              icon={UserIcon}
              color="blue"
            />
            <ActionButton
              onClick={() => {}}
              text="Disabled State"
              icon={UserIcon}
              color="blue"
              disabled={true}
            />
            <ActionButton
              onClick={() => {}}
              text="Loading State"
              icon={UserIcon}
              color="blue"
              loading={true}
            />
          </div>
        </section>

        {/* Medical System Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Medical System Examples</h2>
          <div className="space-y-4">
            
            {/* Patient Management */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Patient Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionButton
                  onClick={() => {}}
                  text="Add New Patient"
                  icon={UserPlusIcon}
                  color="emerald"
                  variant="filled"
                  fullWidth={true}
                />
                <ActionButton
                  onClick={() => {}}
                  text="Import Patients"
                  icon={DocumentTextIcon}
                  color="blue"
                  variant="outline"
                  fullWidth={true}
                />
              </div>
            </div>

            {/* Medical Reports */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Medical Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionButton
                  onClick={() => {}}
                  text="Generate Report"
                  icon={DocumentTextIcon}
                  color="blue"
                  size="sm"
                  fullWidth={true}
                />
                <ActionButton
                  onClick={() => {}}
                  text="Schedule Study"
                  icon={CalendarIcon}
                  color="purple"
                  size="sm"
                  fullWidth={true}
                />
                <ActionButton
                  onClick={() => {}}
                  text="Lab Results"
                  icon={BeakerIcon}
                  color="orange"
                  size="sm"
                  fullWidth={true}
                />
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Emergency Actions</h3>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={() => {}}
                  text="Emergency Alert"
                  color="red"
                  size="lg"
                  variant="filled"
                />
                <ActionButton
                  onClick={() => {}}
                  text="Quick Save"
                  color="emerald"
                  size="md"
                  variant="outline"
                />
                <ActionButton
                  onClick={() => {}}
                  text="Cancel"
                  color="gray"
                  size="md"
                  variant="ghost"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ActionButtonExamples;