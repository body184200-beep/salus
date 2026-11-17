/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        salus: {
          teal: '#087D69',
          'dark-teal': '#174D49',
          'light-mint': '#EAF7F1',
          'text': '#183B35',
          'muted': '#60756D',
          'bg': '#F7FAF8',
          'warning': '#FFF4E0',
          'critical': '#B42318',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
