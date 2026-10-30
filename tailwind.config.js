/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.{js,ts}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#171614',
        graphite: '#292723',
        'warm-stone': '#E9E4DB',
        parchment: '#F6F2EA',
        'soft-taupe': '#B4AA9D',
        'muted-text': '#716A61',
        antique: {
          DEFAULT: '#A77E4B',
          hover: '#936D3E',
          subtle: 'rgba(167, 126, 75, 0.12)',
          border: 'rgba(167, 126, 75, 0.25)',
        },
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
        serif: ['"Cormorant Garamond"', '"Cinzel"', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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
        'royal': '0 20px 50px rgba(23, 22, 20, 0.18)',
        'antique-glow': '0 0 20px rgba(167, 126, 75, 0.25)',
      },
      screens: {
        'xs': '420px',
      }
    },
  },
  plugins: [],
}
