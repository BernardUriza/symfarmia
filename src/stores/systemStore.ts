// System store - UI state and application-level settings
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SystemStore, Notification } from './types';
import { auditMiddleware, AuditState, AuditActions } from './middleware/auditMiddleware';
import { performanceMiddleware, PerformanceState, PerformanceActions } from './middleware/performanceMiddleware';

type SystemStoreWithMiddleware = SystemStore & AuditState & AuditActions & PerformanceState & PerformanceActions;

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useSystemStore = create<SystemStoreWithMiddleware>()(
  persist(
    auditMiddleware(
      performanceMiddleware(
        devtools((set, get) => ({
          // Initial state
          theme: 'light',
          sidebarOpen: true,
          notifications: [],
          loading: false,

          // Theme actions
          setTheme: (theme) => {
            set({ theme }, false, 'set_theme');
            
            // Apply theme to document
            if (typeof window !== 'undefined') {
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.classList.toggle('dark', theme === 'dark');
            }
            
            // Log theme change
            get().logAction({
              action: 'theme_changed',
              userId: null, // Will be filled by middleware
              resourceType: 'system',
              changes: { theme }
            });
          },

          // Sidebar actions
          toggleSidebar: () => {
            const currentState = get();
            const newState = !currentState.sidebarOpen;
            
            set({ sidebarOpen: newState }, false, 'toggle_sidebar');
            
            get().logAction({
              action: 'sidebar_toggled',
              userId: null,
              resourceType: 'system',
              changes: { sidebarOpen: newState }
            });
          },

          setSidebarOpen: (open) => {
            set({ sidebarOpen: open }, false, 'set_sidebar_open');
            
            get().logAction({
              action: 'sidebar_state_changed',
              userId: null,
              resourceType: 'system',
              changes: { sidebarOpen: open }
            });
          },

          // Notification actions
          addNotification: (notification) => {
            const fullNotification: Notification = {
              ...notification,
              id: notification.id || generateId(),
              timestamp: notification.timestamp || Date.now(),
              read: false
            };

            set(
              (state) => ({
                notifications: [...state.notifications, fullNotification]
              }),
              false,
              'add_notification'
            );

            // Auto-remove notification after 5 seconds for non-error types
            if (notification.type !== 'error') {
              setTimeout(() => {
                get().removeNotification(fullNotification.id);
              }, 5000);
            }

            get().logAction({
              action: 'notification_added',
              userId: null,
              resourceType: 'system',
              changes: {
                notificationType: notification.type,
                notificationTitle: notification.title
              }
            });
          },

          removeNotification: (id) => {
            set(
              (state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
              }),
              false,
              'remove_notification'
            );

            get().logAction({
              action: 'notification_removed',
              userId: null,
              resourceType: 'system',
              changes: { notificationId: id }
            });
          },

          // Loading state
          setLoading: (loading) => {
            set({ loading }, false, 'set_loading');
            
            if (loading) {
              // Record when loading starts
              get().recordMetric({
                action: 'loading_start',
                duration: 0,
                metadata: { timestamp: Date.now() }
              });
            }
          }
        }), {
          name: 'system-store',
          version: 1
        })
      )
    ),
    {
      name: 'symfarmia-system-storage',
      partialize: (state) => ({
        // Persist user preferences
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // Don't persist notifications or loading state
      }),
      skipHydration: true,
    }
  )
);

// Selectors for common use cases
export const useTheme = () => useSystemStore((state) => state.theme);
export const useSidebarOpen = () => useSystemStore((state) => state.sidebarOpen);
export const useNotifications = () => useSystemStore((state) => state.notifications);
export const useUnreadNotifications = () => 
  useSystemStore((state) => state.notifications.filter(n => !n.read));
export const useSystemLoading = () => useSystemStore((state) => state.loading);

// Action selectors
export const useSystemActions = () => useSystemStore((state) => ({
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  setLoading: state.setLoading
}));

// Notification helpers
export const useNotificationHelpers = () => {
  const addNotification = useSystemStore(state => state.addNotification);
  
  return {
    showSuccess: (title: string, message: string) =>
      addNotification({ type: 'success', title, message }),
    showError: (title: string, message: string) =>
      addNotification({ type: 'error', title, message }),
    showWarning: (title: string, message: string) =>
      addNotification({ type: 'warning', title, message }),
    showInfo: (title: string, message: string) =>
      addNotification({ type: 'info', title, message }),
  };
};

// Performance monitoring for system operations
export const useSystemPerformance = () => useSystemStore((state) => ({
  metrics: state.getMetrics(),
  themeChangePerformance: state.getAveragePerformance('set_theme'),
  notificationPerformance: state.getAveragePerformance('add_notification')
}));