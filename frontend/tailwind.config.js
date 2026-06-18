/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: { bg: '#0A0F1F', secondary: '#0B0F19', surface: 'rgba(255,255,255,0.04)' },
        accent: { blue: '#00E5FF', red: '#FF3B3B', white: 'rgba(255,255,255,0.15)' },
        text: { primary: '#FFFFFF', secondary: '#A1A1AA', disabled: '#52525B' },
        border: { subtle: 'rgba(255,255,255,0.08)' }
      },
      boxShadow: {
        'glow-blue': '0 0 16px rgba(0,229,255,0.5)',
        'glow-red': '0 0 18px rgba(255,59,59,0.5)',
        'glow-blue-sm': '0 0 8px rgba(0,229,255,0.3)',
        'glow-red-sm': '0 0 10px rgba(255,59,59,0.3)',
      }
    }
  },
  plugins: []
}
