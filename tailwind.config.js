/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cartoon: {
          blue: '#4361EE',
          purple: '#7209B7',
          pink: '#F72585',
          orange: '#FB8500',
          yellow: '#FFBE0B',
          green: '#2EC4B6',
          red: '#E71D36',
          dark: '#232946',
          light: '#FFFFFE',
          bg: '#F8F5FF',
        },
      },
      boxShadow: {
        'cartoon': '5px 5px 0px rgba(0, 0, 0, 0.2)',
        'cartoon-lg': '8px 8px 0px rgba(0, 0, 0, 0.2)',
        'cartoon-xl': '12px 12px 0px rgba(0, 0, 0, 0.2)',
        'cartoon-inner': 'inset 3px 3px 0px rgba(0, 0, 0, 0.1)',
        'cartoon-button': '3px 3px 0px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'cartoon': '12px',
        'blob': '60% 40% 50% 50% / 40% 50% 50% 60%',
      },
      fontFamily: {
        'cartoon': ['Nunito', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-in': 'slide-in 0.5s ease-out',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        }
      },
    },
  },
  plugins: [],
} 