/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zenchain-green': '#10b981',
        'zenchain-blue': '#3b82f6',
      }
    },
  },
  plugins: [],
}
