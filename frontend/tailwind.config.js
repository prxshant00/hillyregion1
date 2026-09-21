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
        // Tactical HUD and instrument panel palette
        tactical: {
          bg: "#161b22",
          surface: "#1c232d",
          card: "#212934",
          border: "#2d3744",
          highlight: "#374354",
          accent: "#0284c7",
          ochre: "#b45309",
          chalk: "#e6edf3"
        },
        slateGneiss: "#161b22",
        siltBedrock: "#243038",
        glacialTorrent: "#0284c7",
        sedimentOchre: "#b45309",
        signalVermilion: "#dc2626",
        cartoChalk: "#e6edf3",

        // Core neutral scale (slate-based, refined)
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Surface hierarchy
        surface: {
          raised: '#1c2330',
          sunken: '#0b0f17',
          overlay: 'rgba(15, 23, 42, 0.85)',
        },
        // Brand accent - refined cyan
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Semantic colors
        risk: {
          normal: '#059669',
          'normal-muted': '#d1fae5',
          advisory: '#d97706',
          'advisory-muted': '#fef3c7',
          watch: '#ea580c',
          'watch-muted': '#ffedd5',
          warning: '#dc2626',
          'warning-muted': '#fee2e2',
        },
        // Chart palette (colorblind-safe)
        chart: {
          beas: '#2563eb',
          parbati: '#7c3aed',
          tirthan: '#059669',
          rainfall: '#06b6d4',
          risk: '#f59e0b',
          river: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Cascadia Code', 'monospace'],
        display: ['Inter', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.25rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'elevated': '0 4px 6px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25)',
        'floating': '0 12px 24px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.3)',
        'modal': '0 24px 48px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.35)',
        'focus': '0 0 0 3px rgba(6, 182, 212, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateY(-4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'status-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(6, 182, 212, 0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 150ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'status-pulse': 'status-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}