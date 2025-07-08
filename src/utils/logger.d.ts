declare class Logger {
  static log(message: string, data?: any): void;
  static error(message: string, error?: any): void;
  static warn(message: string, data?: any): void;
  static info(message: string, data?: any): void;
  static debug(message: string, data?: any): void;
  static api(endpoint: string, method: string, data?: any): void;
  static user(action: string, user?: any): void;
  static component(componentName: string, props?: any): void;
}

export default Logger;