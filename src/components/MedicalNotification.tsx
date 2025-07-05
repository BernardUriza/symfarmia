"use client";
import { NotificationVariant } from "../types/medicalUI";
import { useEffect, useState } from "react";

interface Props {
  variant: NotificationVariant;
  message: string;
  show: boolean;
}

export default function MedicalNotification({ variant, message, show }: Props) {
  const [visible, setVisible] = useState(show);
  useEffect(() => setVisible(show), [show]);

  return (
    <div
      className={`medical-notification medical-notification--${variant} ${visible ? "show" : ""}`}
      role="alert"
    >
      {message}
    </div>
  );
}
