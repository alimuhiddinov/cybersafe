/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          dark: 'var(--secondary-dark)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          dark: 'var(--accent-dark)',
        },
        danger: {
          DEFAULT: 'var(--danger-color)',
          dark: 'var(--danger-dark)',
        },
        warning: {
          DEFAULT: 'var(--warning-color)',
          dark: 'var(--warning-dark)',
        },
        info: {
          DEFAULT: 'var(--info-color)',
          dark: 'var(--info-dark)',
        },
        success: {
          DEFAULT: 'var(--success-color)',
          dark: 'var(--success-dark)',
        },
        navy: {
          50: '#f0f4f9',
          100: '#d9e2f2',
          200: '#a8c1e5',
          300: '#7da0d8',
          400: '#5580cb',
          500: '#3a62b5',
          600: '#2c4d9a',
          700: '#1e3a7b',
          800: '#13285c',
          900: '#0a1833',
          950: '#050c1a',
          700: '#1e2a4a',
          800: '#0f172a',
          900: '#0a0f1d',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: 'var(--font-mono)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
};
