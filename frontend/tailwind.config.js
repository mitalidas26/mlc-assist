/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B0F19',
          900: '#111827',
          850: '#151F32',
          800: '#1E293B',
          700: '#334155',
        }
      }
    },
  },
  plugins: [],
}
