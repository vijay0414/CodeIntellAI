/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#0b0d12',
          surface: '#111318',
          card:    '#161a24',
          border:  '#1e2333',
          hover:   '#1c2030',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover:   '#2563eb',
          muted:   'rgba(59,130,246,0.12)',
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
