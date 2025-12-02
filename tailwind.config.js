/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main-task': '#3b82f6',
        'demon-task': '#ef4444',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}

