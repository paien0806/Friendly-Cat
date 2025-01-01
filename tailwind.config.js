/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F4EFE6',
          DEFAULT: '#A18249',
          dark: '#1C160C',
        },
        success: '#019863',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
};


