/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        silverBlue: '#d7e6ee',
        bone: '#f7f5f2',
        warmBeige: '#e9dfd2',
        taupe: '#8a7666',
        ivory: '#e6e2dc',
      },
      boxShadow: {
        soft: '0 18px 38px rgba(84, 70, 62, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
