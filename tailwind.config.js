/** @type {import('tailwindcss').Config} */ 

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    screens: {
      "mobile-small": "320px",
      "mobile-standard": "375px",
      "mobile-large": "414px",
      "tablet-medical": "768px",
    },
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: "#eff6ff",            muted: "#bfdbfe",            subtle: "#60a5fa",            DEFAULT: "#12B76A",            emphasis: "#0d7444",            inverted: "#ffffff",          },
          background: {
            muted: "#f9fafb",            subtle: "#f3f4f6",            DEFAULT: "#ffffff",            emphasis: "#374151",          },
          border: {
            DEFAULT: "#e5e7eb",          },
          ring: {
            DEFAULT: "#e5e7eb",          },
          content: {
            subtle: "#9ca3af",            DEFAULT: "#6b7280",            emphasis: "#374151",            strong: "#111827",            inverted: "#ffffff",          },
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229",            muted: "#172554",            subtle: "#1e40af",            DEFAULT: "#12B76A",            emphasis: "#60a5fa",            inverted: "#030712",          },
          background: {
            muted: "#131A2B",            subtle: "#1f2937",            DEFAULT: "#111827",            emphasis: "#d1d5db",          },
          border: {
            DEFAULT: "#1f2937",          },
          ring: {
            DEFAULT: "#1f2937",          },
          content: {
            subtle: "#4b5563",            DEFAULT: "#6b7280",            emphasis: "#e5e7eb",            strong: "#f9fafb",            inverted: "#000000",          },
        },
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem"],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    // @headlessui/tailwindcss plugin temporarily disabled due to compatibility issues
    // require("@headlessui/tailwindcss")
  ],
};