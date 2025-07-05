import { medicalHaptics } from "./medicalHaptics";

export const medicalGestures = {
  swipeRight: (element: HTMLElement) => {
    element.style.background = "#10b981";
    medicalHaptics.success();
  },
  swipeLeft: (element: HTMLElement) => {
    element.style.background = "#f59e0b";
    medicalHaptics.warning();
  },
  longPress: (element: HTMLElement, duration = 800) => {
    setTimeout(() => {
      medicalHaptics.processing();
      if (typeof window.showAdvancedOptions === "function") {
        window.showAdvancedOptions(element);
      }
    }, duration);
  },
};
