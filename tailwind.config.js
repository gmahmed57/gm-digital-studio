/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fb',
          100: '#e7ecf5',
          200: '#cdd7ea',
          300: '#a3b9db',
          400: '#7392c6',
          500: '#5174b1',
          600: '#3e5b92',
          700: '#334976',
          800: '#2d3e62',
          900: '#283652',
          950: '#1b2236',
        },
        dark: {
          bg: '#0a0a0b',
          surface: '#121214',
          border: '#27272a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
