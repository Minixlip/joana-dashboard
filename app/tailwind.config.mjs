// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import lineClamp from '@tailwindcss/line-clamp';

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Include src directory if you use one
  ],
  theme: {
    extend: {
      colors: {
        // Here we map Tailwind color names to our CSS variables.
        // The <alpha-value> placeholder allows opacity modifiers like /50, /80 etc.
        'primary-background':
          'rgb(var(--primary-background-rgb) / <alpha-value>)',
        'secondary-background':
          'rgb(var(--secondary-background-rgb) / <alpha-value>)',
        'input-background': 'rgb(var(--input-background-rgb) / <alpha-value>)',
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        'primary-text': 'rgb(var(--primary-text-rgb) / <alpha-value>)',
        'secondary-text': 'rgb(var(--secondary-text-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        link: 'rgb(var(--link-rgb) / <alpha-value>)',
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        error: 'rgb(var(--error-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'], // Example if using next/font
        serif: ['var(--font-lora)', 'serif'], // Example if using next/font
        mono: ['var(--font-roboto-mono)', 'monospace'], // Example if using next/font
      },
      typography: (theme) => ({
        // Custom styles for the 'prose' class from @tailwindcss/typography
        invert: {
          // For dark backgrounds
          css: {
            '--tw-prose-body': theme('colors.primary-text'),
            '--tw-prose-headings': theme('colors.accent'),
            '--tw-prose-links': theme('colors.link'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-quotes': theme('colors.primary-text'),
            '--tw-prose-quote-borders': theme('colors.accent'),
            '--tw-prose-code': theme('colors.accent'),
            '--tw-prose-pre-bg': 'rgb(var(--input-background-rgb))',
            '--tw-prose-hr': 'rgb(var(--border-rgb))',
          },
        },
      }),
    },
  },
  plugins: [
    typography,
    forms, // A great plugin for basic form styling resets
    lineClamp, // The plugin for truncating text (e.g., line-clamp-3)
  ],
};

export default config;
