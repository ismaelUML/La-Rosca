/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Anton"', '"Impact"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        rosada: {
          DEFAULT: '#EB3F7D',
          dark: '#B82358',
          deep: '#190910'
        },
        papel: '#EFE9DA'
      }
    }
  },
  plugins: []
};

