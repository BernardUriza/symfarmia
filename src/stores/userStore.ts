// User store - migrated from Redux to Zustand
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserStore, LoginCredentials } from './types';
import { auditMiddleware, AuditState, AuditActions } from './middleware/auditMiddleware';
import { performanceMiddleware, PerformanceState, PerformanceActions } from './middleware/performanceMiddleware';

type UserStoreWithMiddleware = UserStore & AuditState & AuditActions & PerformanceState & PerformanceActions;

export const useUserStore = create<UserStoreWithMiddleware>()(
  persist(
    auditMiddleware(
      performanceMiddleware(
        devtools((set, get) => ({
          // Initial state
          currentUser: null,
          isAuthenticated: false,
          loading: false,
          error: null,

          // Actions
          loginStart: () => {
            set({ loading: true, error: null }, false, 'login_start');
            
            // Log audit action
            get().logAction({
              action: 'login_attempt',
              userId: null,
              resourceType: 'user',
              changes: { loading: true }
            });
          },

          loginSuccess: (user) => {
            set({
              loading: false,
              currentUser: user,
              isAuthenticated: true,
              error: null
            }, false, 'login_success');
            
            // Log successful login
            get().logAction({
              action: 'login_success',
              userId: user.id,
              resourceType: 'user',
              resourceId: user.id,
              changes: { authenticated: true, user: user.email }
            });
          },

          logout: () => {
            const currentUser = get().currentUser;
            
            set({
              currentUser: null,
              isAuthenticated: false,
              loading: false,
              error: null
            }, false, 'logout');
            
            // Log logout
            get().logAction({
              action: 'logout',
              userId: currentUser?.id || null,
              resourceType: 'user',
              resourceId: currentUser?.id,
              changes: { authenticated: false }
            });
          },

          setError: (error) => {
            set({ error, loading: false }, false, 'set_error');
          },

          // Async login action
          login: async (credentials: LoginCredentials) => {
            const { loginStart, loginSuccess, setError } = get();
            
            loginStart();
            
            try {
              // Record performance for login API call
              const startTime = performance.now();
              
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
              });

              const duration = performance.now() - startTime;
              
              // Record API performance
              get().recordMetric({
                action: 'login_api_call',
                duration,
                metadata: {
                  email: credentials.email,
                  success: response.ok
                }
              });

              if (!response.ok) {
                throw new Error('Invalid credentials');
              }

              const userData = await response.json();
              loginSuccess(userData.user);
              
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Login failed';
              setError(errorMessage);
              
              // Log failed login attempt
              get().logAction({
                action: 'login_failed',
                userId: null,
                resourceType: 'user',
                changes: {
                  error: errorMessage,
                  email: credentials.email
                }
              });
            }
          }
        }), {
          name: 'user-store',
          version: 1
        })
      )
    ),
    {
      name: 'symfarmia-user-storage',
      partialize: (state) => ({
        // Only persist essential user data
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        // Don't persist loading, error states, or sensitive data
      }),
      skipHydration: true, // Prevent hydration issues in Next.js
    }
  )
);

// Selectors for common use cases
export const useUser = () => useUserStore((state) => state.currentUser);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);

// Action selectors
export const useUserActions = () => useUserStore((state) => ({
  login: state.login,
  logout: state.logout,
  setError: state.setError
}));

// Audit selectors
export const useUserAudit = () => useUserStore((state) => ({
  auditLogs: state.getAuditLogs(),
  userLogs: state.getAuditLogs(state.currentUser?.id)
}));

// Performance selectors
export const useUserPerformance = () => useUserStore((state) => ({
  metrics: state.getMetrics(),
  loginPerformance: state.getAveragePerformance('login_api_call')
}));