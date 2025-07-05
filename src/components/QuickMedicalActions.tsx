"use client";
import { QuickAction } from "../types/medicalUI";
import {
  FaHeartPulse,
  FaPrescriptionBottleMedical,
  FaCalendarCheck,
  FaBell,
} from "react-icons/fa6";

const actions: QuickAction[] = [
  {
    id: "vital-signs",
    label: "Signos Vitales",
    icon: "heart-pulse",
    color: "#ef4444",
    action: () => (window as any).openVitalSignsModal?.(),
  },
  {
    id: "prescription",
    label: "Nueva Receta",
    icon: "prescription",
    color: "#10b981",
    action: () => (window as any).openPrescriptionForm?.(),
  },
  {
    id: "follow-up",
    label: "Seguimiento",
    icon: "calendar-check",
    color: "#f59e0b",
    action: () => (window as any).scheduleFollowUp?.(),
  },
  {
    id: "emergency",
    label: "Emergencia",
    icon: "siren",
    color: "#dc2626",
    action: () => (window as any).triggerEmergencyProtocol?.(),
  },
];

const iconMap: Record<string, any> = {
  "heart-pulse": FaHeartPulse,
  prescription: FaPrescriptionBottleMedical,
  "calendar-check": FaCalendarCheck,
  siren: FaBell,
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
