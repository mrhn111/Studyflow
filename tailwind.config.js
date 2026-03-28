/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Cards — actually visible depth
        'card':       '0 1px 4px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09)',
        'card-hover': '0 8px 20px rgba(0,0,0,0.12), 0 24px 56px rgba(0,0,0,0.14)',
        // Buttons — colored sage green glow
        'btn':        '0 4px 14px rgba(71,101,80,0.40), 0 1px 3px rgba(0,0,0,0.10)',
        'btn-hover':  '0 8px 28px rgba(71,101,80,0.55), 0 2px 6px rgba(0,0,0,0.10)',
        // Timer ring glow
        'glow':       '0 0 40px rgba(71,101,80,0.25), 0 0 80px rgba(71,101,80,0.12)',
        // Subtle inner inset
        'inner-sm':   'inset 0 1px 3px rgba(0,0,0,0.06)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.93)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.4', transform: 'scale(0.75)' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':  'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':   'shimmer 2.5s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'float':     'floatUp 3s ease-in-out infinite',
      },
      colors: {
        // CSS-variable-backed colors — dark mode swaps the variables in index.css
        'primary':                   'rgb(var(--c-primary) / <alpha-value>)',
        'primary-dim':               'rgb(var(--c-primary-dim) / <alpha-value>)',
        'on-primary':                'rgb(var(--c-on-primary) / <alpha-value>)',
        'primary-container':         'rgb(var(--c-primary-container) / <alpha-value>)',
        'on-primary-container':      'rgb(var(--c-on-primary-container) / <alpha-value>)',
        'secondary':                 'rgb(var(--c-secondary) / <alpha-value>)',
        'secondary-container':       'rgb(var(--c-secondary-container) / <alpha-value>)',
        'on-secondary-container':    'rgb(var(--c-on-secondary-container) / <alpha-value>)',
        'background':                'rgb(var(--c-background) / <alpha-value>)',
        'surface':                   'rgb(var(--c-surface) / <alpha-value>)',
        'on-surface':                'rgb(var(--c-on-surface) / <alpha-value>)',
        'on-surface-variant':        'rgb(var(--c-on-surface-variant) / <alpha-value>)',
        'surface-container-lowest':  'rgb(var(--c-surface-container-lowest) / <alpha-value>)',
        'surface-container-low':     'rgb(var(--c-surface-container-low) / <alpha-value>)',
        'surface-container':         'rgb(var(--c-surface-container) / <alpha-value>)',
        'surface-container-high':    'rgb(var(--c-surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--c-surface-container-highest) / <alpha-value>)',
        'outline':                   'rgb(var(--c-outline) / <alpha-value>)',
        'outline-variant':           'rgb(var(--c-outline-variant) / <alpha-value>)',
        'error':                     'rgb(var(--c-error) / <alpha-value>)',
        'tertiary-container':        'rgb(var(--c-tertiary-container) / <alpha-value>)',
        'on-tertiary-container':     'rgb(var(--c-on-tertiary-container) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
