// LoggerStrategy.js
export class LoggerStrategy {
  constructor(enabled = true) {
    this.enabled = enabled;
  }
  log(...args) {
    if (this.enabled) console.log(...args);
  }
  error(...args) {
    if (this.enabled) console.error(...args);
  }
  setEnabled(value) {
    this.enabled = value;
  }
}

export const DefaultLogger = new LoggerStrategy(true);
