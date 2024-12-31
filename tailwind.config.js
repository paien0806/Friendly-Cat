/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        orange: {
          100: '#FFEDD5', // 添加 Tailwind 預設的淺橘色
          200: '#FED7AA',
          500: '#F97316',
          900: '#7C2D12',
        },
        baseColor: '#F4EFE6',
        noteColor: '#A18249'
      },
    },
  },
};

