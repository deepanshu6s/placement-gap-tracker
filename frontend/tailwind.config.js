/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#0A0908',
          surface: '#12100E',
          card: '#191512',
          hover: '#241B16',
          input: '#14110F',
          border: '#34271F',
          'border-active': '#65402C',
        },
        orange: {
          neon: '#FF6A2A',
          hover: '#FF7B43',
          muted: 'rgba(255, 106, 42, 0.12)',
        },
        coral: {
          DEFAULT: '#FF526F',
          hover: '#FF637D',
          muted: 'rgba(255, 82, 111, 0.12)',
        },
        amber: {
          DEFAULT: '#FFC857',
          hover: '#FFD273',
          muted: 'rgba(255, 200, 87, 0.12)',
        },
        content: {
          primary: '#F5F0EB',
          secondary: '#C3B7AD',
          muted: '#A3978D',
          disabled: '#786D65',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': '0 2px 8px -1px rgba(0, 0, 0, 0.5)',
        'card-elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.18s ease-out forwards',
      },
    },
  },
  plugins: [],
};
