/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--color-bg)",
        textPrimary: "var(--color-text)",
        textGray: "var(--color-gray)",
        textHover: "var(--color-text-hover)",

        activeBorder: "var(--color-active-border)",
        activeBg: "var(--color-active-bg)",
        activeText: "var(--color-active-text)",

        // admin colors
        adminBg: "var(--admin-bg)",
        adminCard: "var(--admin-card-bg)",
        adminText: "var(--admin-text)",
        adminMuted: "var(--admin-text-muted)",
        adminBorder: "var(--admin-border)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
