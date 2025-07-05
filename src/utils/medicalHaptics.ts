export const medicalHaptics = {
  success: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }
  },
  warning: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
  },
  critical: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  },
  processing: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const interval = setInterval(() => navigator.vibrate(30), 2000);
      setTimeout(() => clearInterval(interval), 10000);
    }
  },
};
