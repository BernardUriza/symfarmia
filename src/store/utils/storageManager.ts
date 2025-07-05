// Simple storage manager
import type { AppState } from '../types';

export class StorageManager {
  constructor(private key: string) {}

  async loadState(): Promise<Partial<AppState>> {
    try {
      const stored = localStorage.getItem(this.key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load state:', error);
      return {};
    }
  }

  async saveState(state: AppState): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.key);
  }

  exportState(state: AppState): string {
    return JSON.stringify(state, null, 2);
  }

  getStorageInfo(): { used: number; available: number } {
    const stored = localStorage.getItem(this.key) || '';
    return {
      used: new Blob([stored]).size,
      available: 10 * 1024 * 1024 // 10MB estimate
    };
  }
}