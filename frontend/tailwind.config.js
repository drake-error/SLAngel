/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Flex"', '"Google Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        display: ['"Google Sans Display"', '"Google Sans"', 'sans-serif'],
      },
      colors: {
        stitch: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dce5fe',
          300: '#bfd2fd',
          400: '#94b3fb',
          500: '#648cf7',
          600: '#4268ee',
          700: '#3250d9',
          800: '#2b41b0',
          900: '#283b8b',
          950: '#1a2456',
        },
        gemini: {
          blue: '#1a73e8',
          purple: '#8ab4f8',
          gradientStart: '#4285f4',
          gradientMid: '#9b72cb',
          gradientEnd: '#d96570',
        },
        canvas: {
          light: '#f8f9fa',
          dot: '#e2e8f0',
          dark: '#0f141c',
          card: '#ffffff',
          panel: '#ffffff',
          panelDark: '#131822',
        }
      },
      boxShadow: {
        'stitch-sm': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'stitch-md': '0 4px 12px -2px rgba(0,0,0,0.06), 0 2px 6px -1px rgba(0,0,0,0.04)',
        'stitch-lg': '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'stitch-xl': '0 20px 48px -6px rgba(15, 23, 42, 0.12), 0 8px 24px -4px rgba(15, 23, 42, 0.06)',
        'gemini-glow': '0 0 24px -4px rgba(66, 133, 244, 0.25)',
        'active-frame': '0 0 0 2px #4285f4, 0 8px 30px rgba(66, 133, 244, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
