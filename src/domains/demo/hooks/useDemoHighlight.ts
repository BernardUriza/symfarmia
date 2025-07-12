import { useAppMode } from '@/app/providers/AppModeProvider';

export function useDemoHighlight() {
  const { isDemoMode } = useAppMode();
  const highlight = (className: string) => (isDemoMode ? className : '');
  return { isDemoMode, highlight };
}
