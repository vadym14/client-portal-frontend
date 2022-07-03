/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif']
      },
    },
    screens: {
      sm: { min: '350px' },
      md: { min: '768px' },
      lg: { min: '1024px' },
      xl: { min: '1280px' },
      '2xl': { min: '1536px' },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light","dark"],
  },
}
