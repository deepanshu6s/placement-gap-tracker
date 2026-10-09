/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080B12',
          surface: '#0D1320',
          card: '#111B2D',
          elevated: '#17243A',
          border: '#243249',
          'border-hover': '#364A6B',
        },
        neon: {
          cyan: '#42F5E8',
          'cyan-hover': '#24e8da',
          'cyan-muted': 'rgba(66, 245, 232, 0.12)',
          lime: '#C4FF58',
          'lime-hover': '#b5f540',
          'lime-muted': 'rgba(196, 255, 88, 0.12)',
        },
        content: {
          primary: '#F3F7FC',
          secondary: '#A6B4C8',
          muted: '#77869B',
        },
        status: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#FB7185',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(66, 245, 232, 0.3)',
        'glow-lime': '0 0 25px -5px rgba(196, 255, 88, 0.3)',
        'card-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'card-elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
