```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    // Add paths to any other files that use Tailwind CSS classes
  ],
  theme: {
    extend: {
      colors: {
        // ...existing colors...
        brown: {
          400: '#a18072',
          500: '#8d6e63',
          600: '#795548',
          700: '#5d4037',
          800: '#4e342e',
          900: '#3e2723',
        },
      },
    },
  },
  plugins: [],
}

```