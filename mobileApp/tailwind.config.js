/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#0f172a',
        primary: '#2563eb',
        secondary: '#f1f5f9',
        success: '#16a249',
        warning: '#f59f0a',
        destructive: '#ef4444',
      },
    },
  },
  plugins: [],
};
