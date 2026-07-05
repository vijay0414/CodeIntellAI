/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#0A0A0A',
          surface: '#111111',
          card:    '#161616',
          border:  '#2A2A2A',
          hover:   '#1A1A1A',
        },
        accent: {
          DEFAULT: '#DC2626',
          hover:   '#B91C1C',
          muted:   'rgba(220,38,38,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease infinite',
        fadeIn:  'fadeIn 0.2s ease forwards',
      },
    },
  },
  plugins: [],
}
