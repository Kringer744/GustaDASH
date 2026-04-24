/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#080D16',
          900: '#0D1117',
          800: '#111827',
          700: '#141C2E',
          600: '#1A2235',
          500: '#1F2940',
          400: '#263047',
          300: '#2E3A52',
        },
        accent: {
          DEFAULT: '#4ADE80',
          50:  'rgba(74,222,128,0.08)',
          100: 'rgba(74,222,128,0.15)',
          200: 'rgba(74,222,128,0.25)',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          900: '#14532D',
        },
        muted: {
          DEFAULT: '#6B7A99',
          100: '#8B9BB8',
          200: '#4A5568',
          300: '#2D3748',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 2px 8px rgba(0,0,0,0.35)',
        'card-hover':'0 4px 20px rgba(0,0,0,0.5)',
        glow:       '0 0 20px rgba(74,222,128,0.2)',
        'glow-sm':  '0 0 10px rgba(74,222,128,0.15)',
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-out',
        'slide-down':'slideDown 0.2s ease-out',
        'pulse-slow':'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { from:{opacity:0,transform:'translateY(6px)'},  to:{opacity:1,transform:'translateY(0)'} },
        slideDown: { from:{opacity:0,transform:'translateY(-6px)'}, to:{opacity:1,transform:'translateY(0)'} },
      },
    },
  },
  plugins: [],
}
