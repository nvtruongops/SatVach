/** @type {import('tailwindcss').Config} */
import flowbite from "flowbite/plugin";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./index.html",
    "./node_modules/flowbite/**/*.js", // Required for Flowbite interactive components
  ],
  theme: {
    extend: {
      colors: {
        // Brand Palette
        "brand-blue": "#227C9D",
        "brand-teal": "#17C3B2",
        "brand-yellow": "#FFCB77",
        "brand-cream": "#FEF9EF",
        "brand-red": "#FE6D73",

        // Semantic Aliases
        primary: {
          DEFAULT: "#227C9D",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#227C9D", // Brand Blue
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        secondary: "#17C3B2",
        accent: "#FFCB77",
        danger: "#FE6D73",
        surface: "#FEF9EF",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        item: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        body: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [flowbite, typography],
};
