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
    icon: "👥",
    emoji: "👥",
    route: "/dashboard",
    badge: null,
  },
  {
    id: "ai-assistant",
    label: "Asistente IA",
    icon: "🧠",
    emoji: "🧠",
    route: "/chat",
    badge: null,
  },
  {
    id: "records",
    label: "Expedientes",
    icon: "📂",
    emoji: "📂",
    route: "/records",
    badge: null,
  },
  {
    id: "settings",
    label: "Configuración",
    icon: "⚙️",
    emoji: "⚙️",
    route: "/settings",
    badge: null,
  },
];

export default function MedicalBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="medical-bottom-nav fixed bottom-0 left-0 right-0 z-40
                     bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
                     border-t border-gray-200/50 dark:border-gray-700/50
                     shadow-lg supports-[backdrop-filter]:bg-white/60
                     px-4 py-2">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const active = pathname === item.route;
          return (
            <Link
              key={item.id}
              href={item.route}
              className={`
                group relative flex flex-col items-center justify-center
                px-4 py-2 rounded-xl transition-all duration-300
                ${active 
                  ? "bg-gradient-to-br from-medical-primary/10 to-medical-accent/10 dark:from-medical-primary/20 dark:to-medical-accent/20" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"}
              `}
            >
              <span className={`
                nav-icon text-2xl mb-1 transform transition-all duration-300
                group-hover:scale-110 group-hover:-translate-y-1
                ${active 
                  ? "text-medical-primary dark:text-medical-accent drop-shadow-lg" 
                  : "text-gray-600 dark:text-gray-400"}
              `} role="img" aria-hidden="true">
                {item.emoji}
              </span>
              <span className={`
                nav-label text-xs font-medium transition-colors duration-300
                ${active 
                  ? "text-medical-primary dark:text-medical-accent" 
                  : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"}
              `}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2
                                w-12 h-1 bg-gradient-to-r from-medical-primary to-medical-accent
                                rounded-t-full"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
