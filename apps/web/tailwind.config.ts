import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5ff',
          300: '#a3b9ff',
          400: '#7a94ff',
          500: '#5865ff',
          600: '#4a52e8',
          700: '#3d41d4',
          800: '#3432ad',
          900: '#2e2a8a',
        },
        neutral: {
          0: '#ffffff',
          50: '#f8f9fc',
          100: '#f0f2f8',
          200: '#e3e6f0',
          300: '#d1d5e0',
          400: '#b8bcc9',
          500: '#8b92a1',
          600: '#626970',
          700: '#4a5158',
          800: '#323841',
          900: '#1a1d23',
          950: '#0f1117',
        },
      },
      backgroundColor: {
        dark: {
          bg: '#0f1419',
          'bg-secondary': '#1a1f2e',
          'bg-tertiary': '#242d3d',
        },
      },
      textColor: {
        dark: {
          primary: '#ffffff',
          secondary: '#b8bcc9',
          tertiary: '#8b92a1',
        },
      },
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '200ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: {
            transform: 'translateY(10px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        slideInLeft: {
          from: {
            transform: 'translateX(-10px)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          "'Roboto'",
          "'Oxygen'",
          "'Ubuntu'",
          "'Cantarell'",
          "'Fira Sans'",
          "'Droid Sans'",
          "'Helvetica Neue'",
          'sans-serif',
        ],
        mono: [
          "'SFMono-Regular'",
          "'Consolas'",
          "'Liberation Mono'",
          "'Menlo'",
          'monospace',
        ],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
