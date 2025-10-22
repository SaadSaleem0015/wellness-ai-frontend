/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins'],
      },
      colors: {
        'primary': '#1b9983',
        'hoverdPrimary' :'#0d4c41'
      },
      
    },
  },
  plugins: [],
}