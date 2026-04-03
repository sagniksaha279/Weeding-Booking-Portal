/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FFF8F0',
          DEFAULT: '#C08552',
          medium: '#8C5A3C',
          dark: '#4B2E2B',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: 'rgba(201,169,110,0.15)',
          dark: '#A8884E',
        },
        smoke: '#F5EFE8',
        muted: '#7A6555',
        ink: '#1C1008',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        jost: ['Jost', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in-down': 'fadeInDown 0.7s cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in-left': 'fadeInLeft 0.7s cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in-right': 'fadeInRight 0.7s cubic-bezier(0.23, 1, 0.32, 1) both',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) both',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: 0, transform: 'translateY(-24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: 0, transform: 'translateX(-24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      boxShadow: {
        'wedding': '0 16px 48px rgba(74,55,40,0.1)',
        'wedding-lg': '0 24px 80px rgba(74,55,40,0.12)',
        'gold': '0 4px 20px rgba(201,169,110,0.2)',
      },
    },
  },
  plugins: [],
}
