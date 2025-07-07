"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNavItem } from "../types/medicalUI";
// use simple emoji strings instead of react-icons
interface BottomNavItemWithEmoji extends BottomNavItem {
  emoji: string;
}

const navItems: BottomNavItemWithEmoji[] = [
  {
    id: "dashboard",
    label: "Pacientes",
    emoji: "👥",
    route: "/dashboard",
    badge: null,
  },
  {
    id: "ai-assistant",
    label: "Asistente IA",
    emoji: "🧠",
    route: "/chat",
    badge: null,
  },
  {
    id: "records",
    label: "Expedientes",
    emoji: "📂",
    route: "/records",
    badge: null,
  },
  {
    id: "settings",
    label: "Configuración",
    emoji: "⚙️",
    route: "/settings",
    badge: null,
  },
];

export default function MedicalBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="medical-bottom-nav flex justify-around">
      {navItems.map((item) => {
        const active = pathname === item.route;
        return (
          <Link
            key={item.id}
            href={item.route}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <span className="nav-icon" role="img" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
