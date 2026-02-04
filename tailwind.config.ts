import type { Config } from 'tailwindcss';

/**
 * Modern UI theme: white-led surfaces, soft gray background, teal accent.
 * Ensures strong contrast and clear hierarchy (best-practice UX).
 */
const brand = {
  // Surfaces (white-first)
  white: '#ffffff',
  'surface': '#ffffff',
  'background': '#f8fafc',      // Soft gray-white page bg (cards pop)
  'background-hover': '#f1f5f9', // Row hover, subtle states
  // Borders (neutral, subtle)
  'border': '#e2e8f0',
  'border-light': '#f1f5f9',
  // Ink (typography hierarchy)
  'ink': '#0f172a',             // Primary text (slate-900)
  'ink-muted': '#64748b',       // Secondary (slate-500)
  'ink-subtle': '#94a3b8',      // Tertiary, icons (slate-400)
  // Accent (teal – use sparingly for CTAs and focus)
  'accent': '#0d9488',         // Teal-600
  'accent-hover': '#0f766e',
  'accent-light': '#ccfbf1',   // Teal-100
  'accent-muted': '#99f6e4',   // Teal-200
  // Gantt/category palette (kept for bars)
  dark: '#005461',
  'dark-light': '#0a6d7a',
  teal: '#0C7779',
  'teal-light': '#e6f5f5',
  mint: '#249E94',
  'mint-light': '#d4f0ee',
  aqua: '#3BC1A8',
  'aqua-light': '#e8faf7',
  cream: '#f0faf9',
  'cream-dark': '#ddeceb',
};

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand,
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'gantt': '0 2px 8px -2px rgba(0, 84, 97, 0.12), 0 4px 12px -4px rgba(0, 84, 97, 0.1)',
        'gantt-hover': '0 4px 14px -2px rgba(0, 84, 97, 0.18), 0 8px 20px -4px rgba(0, 84, 97, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
