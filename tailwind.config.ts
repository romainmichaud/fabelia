import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FEFCF8',
          100: '#FAF5ED',
          200: '#F5EBD8',
          300: '#EEDDC0',
          400: '#E5CB9F',
          500: '#D9B87A',
        },
        forest: {
          100: '#E8F2EC',
          200: '#C5DDD0',
          300: '#8BBFA1',
          400: '#4A7C5F',
          500: '#2D5A3D',
          600: '#1E3D28',
          700: '#132819',
        },
        amber: {
          300: '#F5D98A',
          400: '#E8A93C',
          500: '#C9843A',
          600: '#A8662C',
        },
        terra: {
          300: '#F0B49A',
          400: '#E07A5F',
          500: '#C45C44',
          600: '#A04030',
        },
        navy: {
          600: '#2A3F5F',
          700: '#1E2E47',
          800: '#1A2E4A',
          900: '#0F1B2D',
        },
        gold: {
          300: '#F5DF8A',
          400: '#E8C547',
          500: '#C9A84C',
          600: '#A8893D',
        },
        sage: {
          100: '#EEF3EE',
          200: '#D5E5D5',
          300: '#AECCAE',
          400: '#7DAA80',
          500: '#5A8B5D',
        },
      },
      fontFamily: {
        serif:  ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:   ['var(--font-dm-sans)',  'system-ui', 'sans-serif'],
        mono:   ['var(--font-mono)',     'monospace'],
      },
      fontSize: {
        '5xl': ['3rem',    { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem',  { lineHeight: '1.0' }],
        '8xl': ['6rem',    { lineHeight: '0.95' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-slow':     'float 9s ease-in-out infinite',
        'float-delayed':  'float 6s ease-in-out 2s infinite',
        'fade-up':        'fadeUp 0.7s ease-out forwards',
        'fade-in':        'fadeIn 0.5s ease-out forwards',
        'scale-in':       'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-right':    'slideRight 0.5s ease-out forwards',
        'shimmer':        'shimmer 2.5s linear infinite',
        'pulse-soft':     'pulseSoft 3s ease-in-out infinite',
        'wiggle':         'wiggle 0.5s ease-in-out',
        'page-flip':      'pageFlip 0.6s cubic-bezier(0.45, 0, 0.55, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-16px) rotate(1deg)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1',    transform: 'scale(1)' },
          '50%':      { opacity: '0.85', transform: 'scale(1.02)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-3deg)' },
          '75%':      { transform: 'rotate(3deg)' },
        },
        pageFlip: {
          '0%':   { transform: 'rotateY(0deg)',    transformOrigin: 'left center' },
          '100%': { transform: 'rotateY(-180deg)', transformOrigin: 'left center' },
        },
      },
      backgroundImage: {
        'gradient-warm':       'linear-gradient(135deg, #FAF5ED 0%, #F5EBD8 50%, #EEDDC0 100%)',
        'gradient-forest':     'linear-gradient(135deg, #2D5A3D 0%, #1E3D28 100%)',
        'gradient-hero':       'linear-gradient(180deg, #FEFCF8 0%, #FAF5ED 60%, #F5EBD8 100%)',
        'gradient-amber':      'linear-gradient(135deg, #E8A93C 0%, #C9843A 100%)',
        'gradient-terra':      'linear-gradient(135deg, #E07A5F 0%, #C45C44 100%)',
        'gradient-card':       'linear-gradient(145deg, #FEFCF8 0%, #FAF5ED 100%)',
        'gradient-navy':       'linear-gradient(180deg, #1A2E4A 0%, #0F1B2D 100%)',
        'texture-paper':       "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'warm':     '0 4px 24px rgba(200, 140, 60, 0.15)',
        'warm-lg':  '0 8px 40px rgba(200, 140, 60, 0.25)',
        'soft':     '0 2px 20px rgba(26, 46, 74, 0.08)',
        'soft-lg':  '0 8px 40px rgba(26, 46, 74, 0.12)',
        'forest':   '0 4px 24px rgba(45, 90, 61, 0.20)',
        'book':     '4px 4px 20px rgba(26, 46, 74, 0.20), 8px 8px 40px rgba(26, 46, 74, 0.10)',
        'glow-amber':'0 0 30px rgba(232, 169, 60, 0.40)',
      },
      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':   'cubic-bezier(0.45, 0, 0.55, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
}

export default config
