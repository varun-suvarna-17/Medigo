/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FDFEFE',
        'bg-soft': '#E8F1F8',
        'accent-lt': '#B7D3E8',
        accent: {
          DEFAULT: '#4B87B3',
          hover: '#3D7299',
        },
        dark: '#1B2A38',
      },
    },
  },
  plugins: [],
}
