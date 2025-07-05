"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNavItem } from "../types/medicalUI";
import { FaUserMd, FaBrain, FaFolderOpen, FaGear } from "react-icons/fa6";

const navItems: BottomNavItem[] = [
  {
    id: "dashboard",
    label: "Pacientes",
    icon: "users-medical",
    route: "/dashboard",
    badge: null,
  },
  {
    id: "ai-assistant",
    label: "Asistente IA",
    icon: "brain",
    route: "/chat",
    badge: null,
  },
  {
    id: "records",
    label: "Expedientes",
    icon: "folder-medical",
    route: "/records",
    badge: null,
  },
  {
    id: "settings",
    label: "Configuración",
    icon: "gear-medical",
    route: "/settings",
    badge: null,
  },
];

const iconMap: Record<string, any> = {
  "users-medical": FaUserMd,
  brain: FaBrain,
  "folder-medical": FaFolderOpen,
  "gear-medical": FaGear,
};

export default function MedicalBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="medical-bottom-nav flex justify-around">
      {navItems.map((item) => {
        const active = pathname === item.route;
        const Icon = iconMap[item.icon] || FaUserMd;
        return (
          <Link
            key={item.id}
            href={item.route}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
