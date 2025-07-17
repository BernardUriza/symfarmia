/**
 * Audio Denoising Dashboard - "BAZAAR MODE" 
 * 
 * Dashboard PÚBLICO con métricas accesibles:
 * - Estado del sistema en tiempo real
 * - Métricas de rendimiento
 * - Configuración auditable
 * - Log de auditoría visible
 * - Benchmarking público
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, Typography, Button, Switch, Select, Option, Progress, Alert } from '@material-tailwind/react';
import { ChartBarIcon, CogIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface DenoisingMetrics {
  processing: {
    totalProcessed: number;
    successRate: number;
    averageProcessingTime: number;
    errorCount: number;
    lastProcessingTime: number | null;
  };
  quality: {
    noiseReductionEffectiveness: number;
    alarmPreservationRate: number;
  };
  performance: {
    history: Array<{
      timestamp: string;
      processingTime: number;
      success: boolean;
    }>;
    currentLoad: number;
  };
  system: {
    modelName: string;
    environment: string;
    configVersion: string;
  };
}

interface SystemStatus {
  isInitialized: boolean;
  modelName: string;
  currentEnvironment: string;
  isProcessing: boolean;
  lastError: string | null;
  configVersion: string;
  debugMode: boolean;
}

interface NoiseTypeConfig {
  enabled: boolean;
  threshold: number;
  filterStrength: number;
}

interface EnvironmentConfig {
  name: string;
  enabledNoises: string[];
  globalThreshold: number;
  preserveAlarms: boolean;
  aggressiveness: number;
}

interface DenoisingConfig {
  noiseTypes: Record<string, NoiseTypeConfig>;
  environments: Record<string, EnvironmentConfig>;
  global: {
    preserveCriticalAlarms: boolean;
    enableRealTimeMetrics: boolean;
    logAllAdjustments: boolean;
    enableAuditMode: boolean;
    maxProcessingTime: number;
    enableFallbackMode: boolean;
    fallbackThreshold: number;
  };
  currentEnvironment: string;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  message: string;
  systemState: string;
  configVersion: string;
}

export default function AudioDenoisingDashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<DenoisingMetrics | null>(null);
  const [config, setConfig] = useState<DenoisingConfig | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState('consultorio');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/audio/denoising/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (error) {
      setError('Network error fetching status');
    }
  }, []);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/audio/denoising/metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (error) {
      setError('Network error fetching metrics');
    }
  }, []);

  // Fetch configuration
  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/audio/denoising/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        setSelectedEnvironment(data.data.currentEnvironment);
      } else {
        setError(data.error || 'Failed to fetch config');
      }
    } catch (error) {
      setError('Network error fetching config');
    }
  }, []);

  // Fetch audit log
  const fetchAuditLog = useCallback(async () => {
    try {
      const response = await fetch('/api/audio/denoising/audit');
      const data = await response.json();
      
      if (data.success) {
        setAuditLog(data.data.auditLog || []);
      } else {
        setError(data.error || 'Failed to fetch audit log');
      }
    } catch (error) {
      setError('Network error fetching audit log');
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStatus(),
        fetchMetrics(),
        fetchConfig(),
        fetchAuditLog()
      ]);
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus, fetchMetrics, fetchConfig, fetchAuditLog]);

  // Update configuration
  const updateConfig = async (updatedConfig: Partial<DenoisingConfig>) => {
    try {
      const response = await fetch('/api/audio/denoising/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: updatedConfig })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadData(); // Refresh data
      } else {
        setError(data.error || 'Failed to update configuration');
      }
    } catch (error) {
      setError('Network error updating configuration');
    }
  };

  // Change environment
  const changeEnvironment = async (environmentName: string) => {
    if (!config) return;
    
    await updateConfig({
      ...config,
      currentEnvironment: environmentName
    });
  };

  // Toggle noise type
  const toggleNoiseType = async (noiseType: string) => {
    if (!config) return;
    
    const updatedConfig = {
      ...config,
      noiseTypes: {
        ...config.noiseTypes,
        [noiseType]: {
          ...config.noiseTypes[noiseType],
          enabled: !config.noiseTypes[noiseType].enabled
        }
      }
    };
    
    await updateConfig(updatedConfig);
  };

  // Update noise threshold
  const updateNoiseThreshold = async (noiseType: string, threshold: number) => {
    if (!config) return;
    
    const updatedConfig = {
      ...config,
      noiseTypes: {
        ...config.noiseTypes,
        [noiseType]: {
          ...config.noiseTypes[noiseType],
          threshold: threshold
        }
      }
    };
    
    await updateConfig(updatedConfig);
  };

  // Export configuration
  const exportConfiguration = async () => {
    try {
      const response = await fetch('/api/audio/denoising/export');
      const data = await response.json();
      
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `denoising-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError(data.error || 'Failed to export configuration');
      }
    } catch (error) {
      setError('Network error exporting configuration');
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center p-8\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"></div>
          <Typography variant=\"h6\" color=\"gray\">
            Loading Denoising Dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6 p-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <Typography variant=\"h4\" color=\"blue-gray\">
            Audio Denoising Dashboard
          </Typography>
          <Typography variant=\"paragraph\" color=\"gray\">
            Bazaar Mode - Transparent & Auditable
          </Typography>
        </div>
        <div className=\"flex items-center space-x-4\">
          <div className=\"flex items-center space-x-2\">
            <Switch
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              label=\"Auto Refresh\"
              crossOrigin={undefined}
            />
          </div>
          <Button 
            onClick={loadData}
            variant=\"outlined\"
            size=\"sm\"
            className=\"flex items-center gap-2\"
          >
            <ClockIcon className=\"h-4 w-4\" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          color=\"red\"
          icon={<ExclamationTriangleIcon className=\"h-6 w-6\" />}
          action={
            <Button
              variant=\"text\"
              color=\"red\"
              size=\"sm\"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* System Status */}
      <Card>
        <CardHeader floated={false} shadow={false} className=\"rounded-none\">
          <div className=\"flex items-center justify-between\">
            <Typography variant=\"h6\" color=\"blue-gray\">
              System Status
            </Typography>
            <div className=\"flex items-center space-x-2\">
              {status?.isInitialized ? (
                <CheckCircleIcon className=\"h-5 w-5 text-green-500\" />
              ) : (
                <ExclamationTriangleIcon className=\"h-5 w-5 text-yellow-500\" />
              )}
              <Typography variant=\"small\" color={status?.isInitialized ? 'green' : 'yellow'}>
                {status?.isInitialized ? 'Initialized' : 'Not Initialized'}
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
            <div>
              <Typography variant=\"small\" color=\"gray\">Model</Typography>
              <Typography variant=\"paragraph\">{status?.modelName || 'Unknown'}</Typography>
            </div>
            <div>
              <Typography variant=\"small\" color=\"gray\">Environment</Typography>
              <Typography variant=\"paragraph\">{status?.currentEnvironment || 'Unknown'}</Typography>
            </div>
            <div>
              <Typography variant=\"small\" color=\"gray\">Processing</Typography>
              <Typography variant=\"paragraph\" color={status?.isProcessing ? 'orange' : 'green'}>
                {status?.isProcessing ? 'Active' : 'Idle'}
              </Typography>
            </div>
            <div>
              <Typography variant=\"small\" color=\"gray\">Config Version</Typography>
              <Typography variant=\"paragraph\">{status?.configVersion || 'Unknown'}</Typography>
            </div>
          </div>
          
          {status?.lastError && (
            <Alert color=\"red\" className=\"mt-4\">
              <Typography variant=\"small\">
                <strong>Last Error:</strong> {status.lastError}
              </Typography>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Metrics */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
        <Card>
          <CardBody className=\"text-center\">
            <ChartBarIcon className=\"h-8 w-8 text-blue-500 mx-auto mb-2\" />
            <Typography variant=\"h4\" color=\"blue-gray\">
              {metrics?.processing.totalProcessed || 0}
            </Typography>
            <Typography variant=\"small\" color=\"gray\">
              Total Processed
            </Typography>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className=\"text-center\">
            <Typography variant=\"h4\" color=\"green\">
              {((metrics?.processing.successRate || 0) * 100).toFixed(1)}%
            </Typography>
            <Typography variant=\"small\" color=\"gray\">
              Success Rate
            </Typography>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className=\"text-center\">
            <Typography variant=\"h4\" color=\"blue-gray\">
              {metrics?.processing.averageProcessingTime?.toFixed(0) || 0}ms
            </Typography>
            <Typography variant=\"small\" color=\"gray\">
              Avg Processing Time
            </Typography>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className=\"text-center\">
            <Typography variant=\"h4\" color={metrics?.processing.errorCount ? 'red' : 'green'}>
              {metrics?.processing.errorCount || 0}
            </Typography>
            <Typography variant=\"small\" color=\"gray\">
              Error Count
            </Typography>
          </CardBody>
        </Card>
      </div>

      {/* Environment Configuration */}
      <Card>
        <CardHeader floated={false} shadow={false} className=\"rounded-none\">
          <Typography variant=\"h6\" color=\"blue-gray\">
            Environment Configuration
          </Typography>
        </CardHeader>
        <CardBody>
          <div className=\"mb-4\">
            <Typography variant=\"small\" color=\"gray\" className=\"mb-2\">
              Current Environment
            </Typography>
            <Select
              value={selectedEnvironment}
              onChange={(value) => {
                setSelectedEnvironment(value || 'consultorio');
                changeEnvironment(value || 'consultorio');
              }}
              label=\"Select Environment\"
            >
              {config && Object.entries(config.environments).map(([key, env]) => (
                <Option key={key} value={key}>
                  {env.name}
                </Option>
              ))}
            </Select>
          </div>
          
          {config && config.environments[selectedEnvironment] && (
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mt-4\">
              <div>
                <Typography variant=\"small\" color=\"gray\">Global Threshold</Typography>
                <Typography variant=\"paragraph\">
                  {config.environments[selectedEnvironment].globalThreshold}
                </Typography>
              </div>
              <div>
                <Typography variant=\"small\" color=\"gray\">Preserve Alarms</Typography>
                <Typography variant=\"paragraph\" color={config.environments[selectedEnvironment].preserveAlarms ? 'green' : 'red'}>
                  {config.environments[selectedEnvironment].preserveAlarms ? 'Enabled' : 'Disabled'}
                </Typography>
              </div>
              <div>
                <Typography variant=\"small\" color=\"gray\">Aggressiveness</Typography>
                <Typography variant=\"paragraph\">
                  {config.environments[selectedEnvironment].aggressiveness}
                </Typography>
              </div>
              <div>
                <Typography variant=\"small\" color=\"gray\">Enabled Noises</Typography>
                <Typography variant=\"paragraph\">
                  {config.environments[selectedEnvironment].enabledNoises.length}
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Noise Types Configuration */}
      <Card>
        <CardHeader floated={false} shadow={false} className=\"rounded-none\">
          <Typography variant=\"h6\" color=\"blue-gray\">
            Noise Types Configuration
          </Typography>
        </CardHeader>
        <CardBody>
          <div className=\"space-y-4\">
            {config && Object.entries(config.noiseTypes).map(([noiseType, noiseConfig]) => (
              <div key={noiseType} className=\"flex items-center justify-between p-4 border rounded-lg\">
                <div className=\"flex items-center space-x-4\">
                  <Switch
                    checked={noiseConfig.enabled}
                    onChange={() => toggleNoiseType(noiseType)}
                    label={noiseType}
                    crossOrigin={undefined}
                  />
                  <div>
                    <Typography variant=\"small\" color=\"gray\">
                      Threshold: {noiseConfig.threshold}
                    </Typography>
                    <Typography variant=\"small\" color=\"gray\">
                      Strength: {noiseConfig.filterStrength}
                    </Typography>
                  </div>
                </div>
                <div className=\"w-32\">
                  <Progress
                    value={noiseConfig.threshold * 100}
                    color={noiseConfig.enabled ? 'blue' : 'gray'}
                    size=\"sm\"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader floated={false} shadow={false} className=\"rounded-none\">
          <div className=\"flex items-center justify-between\">
            <Typography variant=\"h6\" color=\"blue-gray\">
              Audit Log
            </Typography>
            <Button
              onClick={exportConfiguration}
              variant=\"outlined\"
              size=\"sm\"
              className=\"flex items-center gap-2\"
            >
              <CogIcon className=\"h-4 w-4\" />
              Export Config
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className=\"max-h-96 overflow-y-auto\">
            {auditLog.length === 0 ? (
              <Typography variant=\"small\" color=\"gray\" className=\"text-center py-8\">
                No audit entries available
              </Typography>
            ) : (
              <div className=\"space-y-2\">
                {auditLog.slice(-20).reverse().map((entry, index) => (
                  <div key={index} className=\"p-3 bg-gray-50 rounded-lg text-sm\">
                    <div className=\"flex items-center justify-between\">
                      <Typography variant=\"small\" color=\"blue-gray\" className=\"font-medium\">
                        {entry.action}
                      </Typography>
                      <Typography variant=\"small\" color=\"gray\">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                    </div>
                    <Typography variant=\"small\" color=\"gray\" className=\"mt-1\">
                      {entry.message}
                    </Typography>
                    <Typography variant=\"small\" color=\"gray\" className=\"mt-1 opacity-75\">
                      Environment: {entry.systemState} | Config: {entry.configVersion}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}