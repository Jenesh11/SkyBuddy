/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./constants.ts"   // IMPORTANT!!!
  ],
  safelist: [
    // Background gradients (from your PERSONALITIES file)
    'from-yellow-300', 'to-orange-400',
    'from-slate-700', 'to-blue-900',
    'from-purple-900', 'to-gray-900',
    'from-gray-400', 'to-slate-500',
    'from-teal-300', 'to-green-500',
    'from-cyan-100', 'to-blue-300',
    'from-blue-200', 'to-gray-300'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
