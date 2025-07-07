"use client";
import { QuickAction } from "../types/medicalUI";
// replace heavy icon library with simple emoji rendering
interface ActionWithEmoji extends QuickAction {
  emoji: string;
}

const actions: ActionWithEmoji[] = [
  {
    id: "vital-signs",
    label: "Signos Vitales",
    icon: "❤️",
    emoji: "❤️",
    color: "#ef4444",
    action: () => window.openVitalSignsModal?.(),
  },
  {
    id: "prescription",
    label: "Nueva Receta",
    icon: "💊",
    emoji: "💊",
    color: "#10b981",
    action: () => window.openPrescriptionForm?.(),
  },
  {
    id: "follow-up",
    label: "Seguimiento",
    icon: "📅",
    emoji: "📅",
    color: "#f59e0b",
    action: () => window.scheduleFollowUp?.(),
  },
  {
    id: "emergency",
    label: "Emergencia",
    icon: "🚨",
    emoji: "🚨",
    color: "#dc2626",
    action: () => window.triggerEmergencyProtocol?.(),
  },
];

export default function QuickMedicalActions() {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-end space-y-3 z-50">
      {actions.map((act) => (
        <button
          key={act.id}
          onClick={act.action}
          style={{ background: act.color }}
          className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg"
        >
          <span role="img" aria-hidden="true" className="text-lg">
            {act.emoji}
          </span>
        </button>
      ))}
    </div>
  );
}
