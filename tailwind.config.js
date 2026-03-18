/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        navy: {
          DEFAULT: '#003366',
          50: '#e6edf5',
          100: '#c2d4e8',
          200: '#9bb9d9',
          300: '#739eca',
          400: '#5589bf',
          500: '#3774b4',
          600: '#003366',
          700: '#002b55',
          800: '#002244',
          900: '#001a33',
        },
        emerald: {
          DEFAULT: '#009975',
          50: '#e6f7f4',
          100: '#b3e7df',
          200: '#80d6c9',
          300: '#4dc5b4',
          400: '#009975',
          500: '#007a5f',
        },
        'soft-gray': '#F4F4F4',
        'light-blue': '#E0F2FE',
      },
      fontSize: {
        'lead': ['1.25rem', { lineHeight: '1.5' }],
        'page-title': ['1.75rem', { lineHeight: '1.3' }],
        'section': ['1.125rem', { lineHeight: '1.4' }],
      },
      minHeight: {
        'touch': '44px',
      },
      spacing: {
        'touch': '44px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
