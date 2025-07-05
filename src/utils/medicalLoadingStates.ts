export interface LoadingStateConfig {
  text: string;
  duration: string;
  icon: string;
}

export const medicalLoadingStates: Record<string, LoadingStateConfig> = {
  "analyzing-symptoms": {
    text: "Analizando síntomas del paciente...",
    duration: "2-3 segundos",
    icon: "brain-circuit",
  },
  "generating-diagnosis": {
    text: "Generando diagnóstico diferencial...",
    duration: "3-5 segundos",
    icon: "stethoscope",
  },
  "creating-soap": {
    text: "Estructurando nota SOAP...",
    duration: "1-2 segundos",
    icon: "file-medical",
  },
  "processing-vitals": {
    text: "Procesando signos vitales...",
    duration: "1 segundo",
    icon: "heartbeat",
  },
};
