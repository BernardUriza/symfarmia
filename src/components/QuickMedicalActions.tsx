"use client";
import { QuickAction } from "../types/medicalUI";
import {
  FaHeartPulse,
  FaPrescriptionBottleMedical,
  FaCalendarCheck,
  FaBell,
} from "react-icons/fa6";
type IconComponent = (props: { className?: string }) => JSX.Element;

const actions: QuickAction[] = [
  {
    id: "vital-signs",
    label: "Signos Vitales",
    icon: "heart-pulse",
    color: "#ef4444",
    action: () => window.openVitalSignsModal?.(),
  },
  {
    id: "prescription",
    label: "Nueva Receta",
    icon: "prescription",
    color: "#10b981",
    action: () => window.openPrescriptionForm?.(),
  },
  {
    id: "follow-up",
    label: "Seguimiento",
    icon: "calendar-check",
    color: "#f59e0b",
    action: () => window.scheduleFollowUp?.(),
  },
  {
    id: "emergency",
    label: "Emergencia",
    icon: "siren",
    color: "#dc2626",
    action: () => window.triggerEmergencyProtocol?.(),
  },
];

const iconMap: Record<string, IconComponent> = {
  "heart-pulse": FaHeartPulse as IconComponent,
  prescription: FaPrescriptionBottleMedical as IconComponent,
  "calendar-check": FaCalendarCheck as IconComponent,
  siren: FaBell as IconComponent,
};

export default function QuickMedicalActions() {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-end space-y-3 z-50">
      {actions.map((act) => {
        const Icon = iconMap[act.icon];
        return (
          <button
            key={act.id}
            onClick={act.action}
            style={{ background: act.color }}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg"
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
