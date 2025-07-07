// Module loader utility for better compilation performance
export class ModuleLoader {
  private static loadedModules = new Map<string, Promise<any>>();

  static async loadModule<T>(
    modulePath: string, 
    importFunc: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> {
    const key = cacheKey || modulePath;
    
    if (!this.loadedModules.has(key)) {
      this.loadedModules.set(key, importFunc());
    }
    
    return this.loadedModules.get(key)!;
  }

  static preloadModules(modules: Array<{ key: string; loader: () => Promise<any> }>) {
    modules.forEach(({ key, loader }) => {
      if (!this.loadedModules.has(key)) {
        this.loadedModules.set(key, loader());
      }
    });
  }

  static clearCache() {
    this.loadedModules.clear();
  }
}