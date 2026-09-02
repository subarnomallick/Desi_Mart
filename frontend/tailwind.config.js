/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f4f7f6',
          100: '#e6eeea',
          200: '#c1d4cb',
          300: '#9cbcae',
          400: '#538c71',
          500: '#1b4332', // Primary brand deep forest green
          600: '#153527',
          700: '#0e231a',
          800: '#08140f',
          900: '#030806',
        },
        sage: {
          50: '#fcfdfd',
          100: '#f5f8f6',
          200: '#e5eee8',
          300: '#d5e3da',
          400: '#b5cebf',
          500: '#74c69d', // Accent sage green
          600: '#5cb88b',
          700: '#3c9367',
          800: '#255b40',
          900: '#122c1f',
        },
        terracotta: {
          50: '#fef7f6',
          100: '#fdefec',
          200: '#fadcd6',
          300: '#f6b8ac',
          400: '#eb7562',
          500: '#d29895', // Accent soft terracotta
          600: '#b74431',
          700: '#8c3325',
          800: '#5e2319',
          900: '#3a1510',
        }
      }
    },
  },
  plugins: [],
}
