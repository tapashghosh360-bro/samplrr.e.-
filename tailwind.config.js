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
        obsidian: {
          DEFAULT: '#090B0D',
          50: '#1a1f24',
          100: '#15191d',
          200: '#13171B',
          300: '#0f1215',
          900: '#090B0D',
        },
        charcoal: {
          DEFAULT: '#13171B',
          surface: '#1A1D20',
          elevated: '#202428',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        pearl: {
          DEFAULT: '#F5F2EC',
          muted: '#BBC1C4',
          subtle: '#8E969B',
        },
        emerald: {
          brand: '#059669',
          light: '#10B981',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        amber: {
          brand: '#D97706',
          light: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        glass: {
          dark: 'rgba(12, 16, 20, 0.65)',
          medium: 'rgba(19, 23, 27, 0.75)',
          light: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.14)',
          borderHover: 'rgba(255, 255, 255, 0.28)',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', '"Hind Siliguri"', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow': '0 0 25px rgba(255, 255, 255, 0.06), 0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
