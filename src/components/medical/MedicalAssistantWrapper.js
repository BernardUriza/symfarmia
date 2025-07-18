"use client";
import dynamic from "next/dynamic";

const MedicalAssistantWrapper = dynamic(
  () => import("../MedicalAssistant"),
  { ssr: false },
);

export { MedicalAssistantWrapper };
