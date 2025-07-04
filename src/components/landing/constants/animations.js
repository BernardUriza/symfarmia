// Animation constants for consistent performance and maintainability
export const ANIMATION_DURATIONS = {
  FAST: 0.3,
  NORMAL: 0.8,
  SLOW: 1.5,
  VERY_SLOW: 3
};

export const ANIMATION_DELAYS = {
  IMMEDIATE: 0,
  SHORT: 0.2,
  MEDIUM: 0.5,
  LONG: 1
};

export const EASING = {
  EASE_IN_OUT: "easeInOut",
  EASE_OUT: "easeOut",
  LINEAR: "linear"
};

export const PARTICLE_CONFIGS = {
  MINIMAL: { count: 8, opacity: 0.15 },
  LOW: { count: 12, opacity: 0.2 },
  MEDIUM: { count: 20, opacity: 0.3 },
  HIGH: { count: 30, opacity: 0.4 }
};

export const BOX_SHADOW_ANIMATIONS = {
  SUBTLE: [
    "0 0 15px rgba(79, 209, 197, 0.1)",
    "0 0 25px rgba(79, 209, 197, 0.2)",
    "0 0 15px rgba(79, 209, 197, 0.1)"
  ],
  NORMAL: [
    "0 0 20px rgba(79, 209, 197, 0.2)",
    "0 0 30px rgba(79, 209, 197, 0.3)",
    "0 0 20px rgba(79, 209, 197, 0.2)"
  ],
  STRONG: [
    "0 0 30px rgba(79, 209, 197, 0.3)",
    "0 0 40px rgba(79, 209, 197, 0.4)",
    "0 0 30px rgba(79, 209, 197, 0.3)"
  ]
};

export const VIEWPORT_CONFIG = {
  once: true,
  margin: "-10%"
};