'use client';

import { useState, useEffect } from 'react';

const VersionInfo = () => {
  const [versionInfo, setVersionInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        // Try to fetch from build-time generated file first
        const response = await fetch('/version.json?t=' + Date.now());
        if (response.ok) {
          const info = await response.json();
          setVersionInfo(info);
        } else {
          // Fallback to environment variables
          setVersionInfo({
            version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
            gitHash: 'unknown',
            gitBranch: process.env.NODE_ENV || 'development',
            buildDate: new Date().toISOString(),
            buildTimestamp: Date.now(),
          });
        }
      } catch (error) {
        console.warn('Could not fetch version info:', error);
        // Final fallback
        setVersionInfo({
          version: '0.1.0',
          gitHash: 'unknown',
          gitBranch: 'development',
          buildDate: new Date().toISOString(),
          buildTimestamp: Date.now(),
        });
      }
    };

    fetchVersionInfo();
  }, []);

  if (!versionInfo) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha desconocida';
    }
  };

  const getEnvironmentColor = (branch) => {
    switch (branch?.toLowerCase()) {
      case 'main':
      case 'master':
        return 'text-green-600';
      case 'dev':
      case 'development':
        return 'text-blue-600';
      case 'staging':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="version-info-container">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="version-info-trigger text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer select-none"
        title="Click para ver detalles de versión"
      >
        v{versionInfo.version} • {versionInfo.gitHash} •{' '}
        {formatDate(versionInfo.buildDate)}
      </button>

      {isExpanded && (
        <div className="version-info-details absolute bottom-full left-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-xs z-50 min-w-64">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Versión:</span>
              <span className="text-gray-900">{versionInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Git Hash:</span>
              <span className="font-mono text-gray-900">
                {versionInfo.gitHash}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Rama:</span>
              <span
                className={`font-medium ${getEnvironmentColor(versionInfo.gitBranch)}`}
              >
                {versionInfo.gitBranch}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">
                Última actualización:
              </span>
              <span className="text-gray-900">
                {formatDate(versionInfo.gitDate || versionInfo.buildDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Build:</span>
              <span className="text-gray-900">
                {formatDate(versionInfo.buildDate)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2 text-center">
              <span className="text-gray-500">SYMFARMIA Medical System</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionInfo;
