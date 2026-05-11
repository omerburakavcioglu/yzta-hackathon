import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#f7faf2',
          100: '#ecf3dc',
          200: '#d7e6b6',
          300: '#bdd589',
          400: '#9bbf5d',
          500: '#7a9f3f',
          600: '#5f7f30',
          700: '#4a6328',
          800: '#3d5023',
          900: '#33421f',
        },
        cream: {
          50:  '#fdfaf2',
          100: '#faf3e0',
          200: '#f4e7c3',
        },
        ink: {
          900: '#1f2520',
          700: '#3a463c',
          500: '#6a786c',
          400: '#8a978c',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
