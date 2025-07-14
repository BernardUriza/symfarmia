/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'foreground-rgb': 'rgb(var(--color-foreground-rgb) / <alpha-value>)',
        'background-start-rgb': 'rgb(var(--color-background-start-rgb) / <alpha-value>)',
        'background-end-rgb': 'rgb(var(--color-background-end-rgb) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}