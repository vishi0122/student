/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        accent: '#10B981',
      },
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        scan: {
          '0%': { top: '10%' },
          '50%': { top: '90%' },
          '100%': { top: '10%' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
