"use client";
import dynamic from "next/dynamic";

const MedicalAssistant = dynamic(
  () => import("../../src/components/MedicalAssistant"),
  { ssr: false },
);

export default MedicalAssistant;
