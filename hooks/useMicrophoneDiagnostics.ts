import { useState, useCallback } from 'react';
import Logger from '../src/utils/logger';

export interface MicrophoneDiagnostics {
  timestamp: string;
  browser: string;
  isHTTPS: boolean;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasPermissionsAPI: boolean;
  devices: Array<{ deviceId: string; label: string; groupId: string }>;
  permissionState: string;
  errors: string[];
  recommendations: string[];
  accessTest?: 'success' | 'failed';
  accessError?: { name: string; message: string };
  audioContextSupport?: string;
}

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'checking';

/**
 * Hook for checking microphone permissions and running diagnostics.
 */
export function useMicrophoneDiagnostics() {
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [micDiagnostics, setMicDiagnostics] = useState<MicrophoneDiagnostics | null>(null);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state as PermissionState);
        result.addEventListener('change', () => {
          setMicPermission(result.state as PermissionState);
        });
      } else {
        setMicPermission('prompt');
      }
    } catch (error) {
      Logger.warn('Permission API not available');
      setMicPermission('prompt');
    }
  }, []);

  const runMicrophoneDiagnostics = useCallback(async () => {
    const diagnostics: MicrophoneDiagnostics = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      isHTTPS: location.protocol === 'https:',
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      hasPermissionsAPI: !!navigator.permissions,
      devices: [],
      permissionState: 'unknown',
      errors: [],
      recommendations: []
    };

    try {
      if (!navigator.mediaDevices) {
        diagnostics.errors.push('MediaDevices API no disponible en este navegador');
        diagnostics.recommendations.push('Actualiza tu navegador a una versión más reciente');
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        diagnostics.errors.push('getUserMedia API no disponible');
        diagnostics.recommendations.push('Tu navegador no soporta acceso al micrófono');
      }
      if (!diagnostics.isHTTPS && location.hostname !== 'localhost') {
        diagnostics.errors.push('Se requiere HTTPS para acceso al micrófono');
        diagnostics.recommendations.push('Accede al sitio usando HTTPS://');
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        diagnostics.devices = audioInputs.map(d => ({
          deviceId: d.deviceId,
          label: d.label || 'Micrófono sin nombre',
          groupId: d.groupId
        }));
        if (audioInputs.length === 0) {
          diagnostics.errors.push('No se encontraron dispositivos de audio de entrada');
          diagnostics.recommendations.push('Conecta un micrófono o verifica que esté habilitado');
        }
      } catch (deviceError: any) {
        diagnostics.errors.push(`Error enumerando dispositivos: ${deviceError.message}`);
      }

      if (navigator.permissions) {
        try {
          const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          diagnostics.permissionState = permissionResult.state;
          switch (permissionResult.state) {
            case 'denied':
              diagnostics.errors.push('Permisos de micrófono denegados explícitamente');
              diagnostics.recommendations.push('Permite el acceso al micrófono en el navegador');
              break;
            case 'prompt':
              diagnostics.recommendations.push('Los permisos se solicitarán al intentar grabar');
              break;
            case 'granted':
              diagnostics.recommendations.push('Permisos concedidos, el micrófono debería funcionar');
              break;
          }
        } catch (permError: any) {
          diagnostics.errors.push(`Error verificando permisos: ${permError.message}`);
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        diagnostics.accessTest = 'success';
        diagnostics.permissionState = 'granted';
        setMicPermission('granted');
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        diagnostics.audioContextSupport = audioContext.state;
        audioContext.close();
        stream.getTracks().forEach(track => track.stop());
      } catch (accessError: any) {
        diagnostics.accessTest = 'failed';
        diagnostics.accessError = { name: accessError.name, message: accessError.message };
        switch (accessError.name) {
          case 'NotAllowedError':
            setMicPermission('denied');
            diagnostics.errors.push('Acceso al micrófono denegado por el usuario');
            diagnostics.recommendations.push('Permite el acceso al micrófono en el navegador');
            break;
          case 'NotFoundError':
            setMicPermission('denied');
            diagnostics.errors.push('No se encontró ningún dispositivo de micrófono');
            diagnostics.recommendations.push('Verifica que el micrófono esté conectado y funcionando');
            break;
          default:
            diagnostics.errors.push(`Error desconocido: ${accessError.message}`);
            diagnostics.recommendations.push('Intenta recargar la página o reiniciar el navegador');
        }
      }
    } catch (error: any) {
      diagnostics.errors.push(`Error general en diagnóstico: ${error.message}`);
    }
    setMicDiagnostics(diagnostics);
    console.debug('[SYMFARMIA] Microphone diagnostics', diagnostics);
    return diagnostics;
  }, []);

  return {
    micPermission,
    micDiagnostics,
    checkMicrophonePermission,
    runMicrophoneDiagnostics,
    setMicPermission,
  };
}
