'use client';
import React, { useState } from 'react';
import mockAPI from '../../utils/mockApi';
import Logger from '../../utils/logger';

const SmokeTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const runSmokeTest = async () => {
    setTesting(true);
    setResults(null);
    Logger.info('Starting smoke test suite');

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    };

    const addTest = (name, status, details = null, error = null) => {
      testResults.tests.push({ name, status, details, error });
      testResults.total++;
      if (status === 'passed') testResults.passed++;
      if (status === 'failed') testResults.failed++;
    };

    try {
      // Test 1: Health Check
      Logger.debug('Running health check test');
      try {
        const healthResponse = await mockAPI.healthCheck();
        if (healthResponse.success && healthResponse.status === 'healthy') {
          addTest(
            'Health Check',
            'passed',
            `API healthy with ${healthResponse.counts.patients} patients`,
          );
        } else {
          addTest(
            'Health Check',
            'failed',
            null,
            'API not responding correctly',
          );
        }
      } catch (error) {
        addTest('Health Check', 'failed', null, error.message);
      }

      // Test 2: Get Patients
      Logger.debug('Testing patient retrieval');
      try {
        const patientsResponse = await mockAPI.getPatients();
        if (patientsResponse.success && Array.isArray(patientsResponse.data)) {
          addTest(
            'Get Patients',
            'passed',
            `Retrieved ${patientsResponse.data.length} patients`,
          );
        } else {
          addTest(
            'Get Patients',
            'failed',
            null,
            'Invalid patients data structure',
          );
        }
      } catch (error) {
        addTest('Get Patients', 'failed', null, error.message);
      }

      // Test 3: Get Medical Reports
      Logger.debug('Testing medical reports retrieval');
      try {
        const reportsResponse = await mockAPI.getMedicalReports();
        if (reportsResponse.success && Array.isArray(reportsResponse.data)) {
          addTest(
            'Get Medical Reports',
            'passed',
            `Retrieved ${reportsResponse.data.length} reports`,
          );
        } else {
          addTest(
            'Get Medical Reports',
            'failed',
            null,
            'Invalid reports data structure',
          );
        }
      } catch (error) {
        addTest('Get Medical Reports', 'failed', null, error.message);
      }

      // Test 4: Get Study Types
      Logger.debug('Testing study types retrieval');
      try {
        const studyTypesResponse = await mockAPI.getStudyTypes();
        if (
          studyTypesResponse.success &&
          Array.isArray(studyTypesResponse.data)
        ) {
          addTest(
            'Get Study Types',
            'passed',
            `Retrieved ${studyTypesResponse.data.length} study types`,
          );
        } else {
          addTest(
            'Get Study Types',
            'failed',
            null,
            'Invalid study types data structure',
          );
        }
      } catch (error) {
        addTest('Get Study Types', 'failed', null, error.message);
      }

      // Test 5: Create Patient
      Logger.debug('Testing patient creation');
      try {
        const newPatient = {
          name: 'Test Patient',
          email: 'test@symfarmia.com',
          phone: '555-0123',
        };
        const createResponse = await mockAPI.createPatient(newPatient);
        if (createResponse.success && createResponse.data.id) {
          addTest(
            'Create Patient',
            'passed',
            `Created patient with ID ${createResponse.data.id}`,
          );
        } else {
          addTest('Create Patient', 'failed', null, 'Failed to create patient');
        }
      } catch (error) {
        addTest('Create Patient', 'failed', null, error.message);
      }

      // Test 6: Component Rendering
      Logger.debug('Testing component rendering');
      try {
        const testElement = document.getElementById('smoke-test-container');
        if (testElement) {
          addTest(
            'Component Rendering',
            'passed',
            'SmokeTest component rendered successfully',
          );
        } else {
          addTest(
            'Component Rendering',
            'failed',
            null,
            'Component not found in DOM',
          );
        }
      } catch (error) {
        addTest('Component Rendering', 'failed', null, error.message);
      }

      // Test 7: Local Storage
      Logger.debug('Testing local storage');
      try {
        const testKey = 'symfarmia-test';
        const testValue = 'test-data';
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        if (retrieved === testValue) {
          addTest('Local Storage', 'passed', 'Local storage working correctly');
        } else {
          addTest('Local Storage', 'failed', null, 'Local storage not working');
        }
      } catch (error) {
        addTest('Local Storage', 'failed', null, error.message);
      }

      // Test 8: Browser Features
      Logger.debug('Testing browser features');
      try {
        const features = {
          fetch: typeof fetch !== 'undefined',
          localStorage: typeof localStorage !== 'undefined',
          console: typeof console !== 'undefined',
          Promise: typeof Promise !== 'undefined',
        };

        const unsupported = Object.entries(features).filter(
          ([, supported]) => !supported,
        );

        if (unsupported.length === 0) {
          addTest(
            'Browser Features',
            'passed',
            'All required browser features available',
          );
        } else {
          addTest(
            'Browser Features',
            'failed',
            null,
            `Missing features: ${unsupported.map(([name]) => name).join(', ')}`,
          );
        }
      } catch (error) {
        addTest('Browser Features', 'failed', null, error.message);
      }
    } catch (globalError) {
      addTest('Global Error Handler', 'failed', null, globalError.message);
    }

    Logger.info('Smoke test completed', testResults);
    setResults(testResults);
    setTesting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-200"
        title="Run Front-end Smoke Test"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      id="smoke-test-container"
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-md w-96 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Frontend Smoke Test
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <button
          onClick={runSmokeTest}
          disabled={testing}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {testing ? 'Running Tests...' : 'Run Smoke Test'}
        </button>

        {results && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Test Results ({results.passed}/{results.total} passed)
              </div>
              <div className="flex space-x-4 text-sm">
                <span className="text-green-600">
                  ✓ {results.passed} passed
                </span>
                <span className="text-red-600">✗ {results.failed} failed</span>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {results.tests.map((test, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <span
                    className={`flex-shrink-0 ${test.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {test.status === 'passed' ? '✓' : '✗'}
                  </span>
                  <div>
                    <div className="font-medium">{test.name}</div>
                    {test.details && (
                      <div className="text-gray-600">{test.details}</div>
                    )}
                    {test.error && (
                      <div className="text-red-600 text-xs">{test.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmokeTest;
