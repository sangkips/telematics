/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors - Change these to update the entire app's color scheme
        brand: {
          // Primary color (navbar, sidebar, main brand color)
          primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',  // Main teal color
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',  // Navbar/Sidebar background
            900: '#134e4a',
          },
          // Secondary color (accents, highlights)
          secondary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',  // Active states, icons
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
          },
          // Accent color (buttons, active menu items)
          accent: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',  // Active menu items
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
        },
      },
    },
  },
  plugins: [],
};
