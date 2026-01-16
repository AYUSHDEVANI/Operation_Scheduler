/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e293b', // Slate 900 (Navy)
        secondary: '#475569', // Slate 600
        background: '#f8fafc', // Slate 50
        surface: '#ffffff',
        charcoal: '#0f172a', // Slate 900
        success: '#059669', // Emerald 600
        warning: '#d97706', // Amber 600 (Gold)
        emergency: '#b91c1c', // Red 700
      },
    },
  },
  plugins: [],
}
