/** @type {import('tailwindcss').Config} */ 

module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: "#eff6ff", // Cambiado a verde
            muted: "#bfdbfe", // Cambiado a verde
            subtle: "#60a5fa", // Cambiado a verde
            DEFAULT: "#12B76A", // Cambiado a verde
            emphasis: "#0d7444", // Cambiado a verde
            inverted: "#ffffff", // Cambiado a verde
          },
          background: {
            muted: "#f9fafb", // Cambiado a verde
            subtle: "#f3f4f6", // Cambiado a verde
            DEFAULT: "#ffffff", // Cambiado a verde
            emphasis: "#374151", // Cambiado a verde
          },
          border: {
            DEFAULT: "#e5e7eb", // Cambiado a verde
          },
          ring: {
            DEFAULT: "#e5e7eb", // Cambiado a verde
          },
          content: {
            subtle: "#9ca3af", // Cambiado a verde
            DEFAULT: "#6b7280", // Cambiado a verde
            emphasis: "#374151", // Cambiado a verde
            strong: "#111827", // Cambiado a verde
            inverted: "#ffffff", // Cambiado a verde
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229", // Cambiado a verde
            muted: "#172554", // Cambiado a verde
            subtle: "#1e40af", // Cambiado a verde
            DEFAULT: "#12B76A", // Cambiado a verde
            emphasis: "#60a5fa", // Cambiado a verde
            inverted: "#030712", // Cambiado a verde
          },
          background: {
            muted: "#131A2B", // Cambiado a verde
            subtle: "#1f2937", // Cambiado a verde
            DEFAULT: "#111827", // Cambiado a verde
            emphasis: "#d1d5db", // Cambiado a verde
          },
          border: {
            DEFAULT: "#1f2937", // Cambiado a verde
          },
          ring: {
            DEFAULT: "#1f2937", // Cambiado a verde
          },
          content: {
            subtle: "#4b5563", // Cambiado a verde
            DEFAULT: "#6b7280", // Cambiado a verde
            emphasis: "#e5e7eb", // Cambiado a verde
            strong: "#f9fafb", // Cambiado a verde
            inverted: "#000000", // Cambiado a verde
          },
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
  plugins: [require("@headlessui/tailwindcss")],
};