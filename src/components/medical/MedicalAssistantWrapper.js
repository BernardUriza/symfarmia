"use client";
import dynamic from "next/dynamic";

const MedicalAssistant = dynamic(
  () => import("../MedicalAssistant"),
  { ssr: false },
);

export default MedicalAssistant;
