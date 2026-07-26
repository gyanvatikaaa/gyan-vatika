/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ---- Gyan Vatika design tokens ----
        vatika: {
          bg: "#EFF3EB",       // soft sage paper background
          surface: "#FFFFFF",   // card surface
          ink: "#1C2B22",       // deep forest ink (primary text)
          forest: "#2D4A3E",    // deep forest green (primary brand)
          forestDark: "#1E332A",
          marigold: "#E8A33D",  // warm marigold accent (growth/highlight)
          marigoldDark: "#C6821F",
          clay: "#B4674A",      // warning/error tone, warm terracotta-clay
          line: "#DCE3D6",      // hairline borders
          muted: "#5C6B60",     // secondary text
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
