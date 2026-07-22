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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f94a00', // Signature Logo Orange
          600: '#ea3900',
          700: '#c22b00',
          800: '#9a2404',
          900: '#7c2108',
          950: '#430d03',
        },
        dark: {
          bg: '#0a0a0b',
          surface: '#131316',
          border: '#242429',
          card: '#18181b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'brand-glow': '0 0 25px -5px rgba(249, 74, 0, 0.35)',
        'premium': '0 4px 25px -2px rgba(0, 0, 0, 0.08)',
        'premium-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
