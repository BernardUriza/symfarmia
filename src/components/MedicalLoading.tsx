"use client";
import { motion } from "framer-motion";
import { medicalLoadingStates } from "../utils/medicalLoadingStates";

const iconMap: Record<string, React.ElementType> = {
  "brain-circuit": () => <span className="nav-icon">🧠</span>,
  stethoscope: () => <span className="nav-icon">🩺</span>,
  "file-medical": () => <span className="nav-icon">📄</span>,
  heartbeat: () => <span className="nav-icon">❤️</span>,
};

export default function MedicalLoading({
  state,
}: {
  state: keyof typeof medicalLoadingStates;
}) {
  const config = medicalLoadingStates[state];
  const Icon = iconMap[config.icon] || iconMap["brain-circuit"];

  return (
    <div className="flex flex-col items-center p-4 animate-pulse">
      <Icon />
      <p className="text-sm text-gray-600 mb-2">{config.text}</p>
      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2 }}
        />
      </div>
      <div className="mt-4 space-y-2 w-full">
        <div className="h-3 bg-blue-100 rounded w-3/4" />
        <div className="h-3 bg-blue-100 rounded w-1/2" />
      </div>
    </div>
  );
}
