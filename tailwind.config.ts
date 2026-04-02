import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vexBlue: '#0f172a',
        vexAccent: '#22c55e',
      },
    },
  },
  plugins: [],
};

export default config;
