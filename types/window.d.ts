declare global {
  interface Window {
    openVitalSignsModal?: () => void;
    openPrescriptionForm?: () => void;
    scheduleFollowUp?: () => void;
    triggerEmergencyProtocol?: () => void;
    showAdvancedOptions?: (element: HTMLElement) => void;
  }
}
export {};
