import type { Config } from 'tailwindcss'

/** Reads a design token from `src/styles/globals.css` and keeps Tailwind opacity modifiers working. */
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jollof: { DEFAULT: token('jollof'), dark: token('jollof-dark') },
        gold: { DEFAULT: token('gold'), soft: token('gold-soft') },
        ewedu: { DEFAULT: token('ewedu'), soft: token('ewedu-soft') },
        indigo: { DEFAULT: token('indigo'), soft: token('indigo-soft') },
        cocoa: { DEFAULT: token('cocoa'), soft: token('cocoa-soft') },
        shea: token('shea'),
        paper: token('paper'),
        muted: token('muted'),
        line: token('line'),
        'danger-soft': token('danger-soft'),
        'chart-blue': token('chart-blue'),
      },
      fontFamily: {
        display: ['var(--font-display)'],
        accent: ['var(--font-accent)'],
        body: ['var(--font-body)'],
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      spacing: {
        sidebar: 'var(--sidebar-width)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
      },
      boxShadow: {
        float: '0 18px 40px -16px rgb(var(--color-cocoa) / 0.35)',
        panel: '0 24px 70px -24px rgb(var(--color-cocoa) / 0.55)',
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(100%)' } },
        'pop-in': { from: { opacity: '0', transform: 'translateY(12px)' } },
      },
      animation: {
        'slide-in': 'slide-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'pop-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
