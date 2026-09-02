import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0F172A',
        petro: {
          50: '#F5F8FF',
          100: '#DCE6F8',
          200: '#C7D7F5',
          300: '#A9C2EF',
          400: '#7BA2E6',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        canvasbg: '#E2E8F0',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 60px -20px rgba(15, 23, 42, 0.18)',
        card: '0 12px 32px -16px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        '4xl': '2.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
