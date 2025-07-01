import React from "react";
import { ClockIcon, UploadIcon, BanIcon, CheckCircleIcon } from "@heroicons/react/outline";
import { Badge } from "@tremor/react";

const StatusBadge = ({ status }) => {
  let badgeColor = "green"; // Default color
  let badgeIcon = CheckCircleIcon; // Default icon

  switch (status) {
    case "Pendiente":
      badgeColor = "yellow";
      badgeIcon = ClockIcon;
      break;
    case "Enviado":
      badgeColor = "blue";
      badgeIcon = UploadIcon;
      break;
    case "No entregado":
      badgeColor = "red";
      badgeIcon = BanIcon;
      break;
    case "Activo":
      badgeColor = "green";
      badgeIcon = CheckCircleIcon;
      break;
    default:
      badgeColor = "gray";
  }

  return (
    <Badge color={badgeColor} size="sm" icon={badgeIcon}>
      {status}
    </Badge>
  );
};

export default StatusBadge;