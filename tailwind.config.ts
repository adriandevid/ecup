import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleUp: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      colors: {
        slate: {
          750: '#2d3748',
          850: '#1a202c',
        },
        darkBg: '#090d16',
        cardBg: '#121b2d',
        cardHover: '#18243c',
        borderBlue: '#1e2d4a',
        accentGreen: '#10b981',
        accentRed: '#ef4444',
        accentGold: '#f59e0b',
      },
    },
  },
  plugins: [],
};

export default config;
