export interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number | null;
  isActive?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

export type NotificationVariant = "critical" | "warning" | "success" | "info";
