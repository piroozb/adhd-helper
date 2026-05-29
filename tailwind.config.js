/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./example/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f5f2",
        foreground: "#2d2a35",
        card: "#ffffff",
        "card-foreground": "#2d2a35",
        popover: "#ffffff",
        "popover-foreground": "#2d2a35",
        primary: "#7c6bae",
        "primary-foreground": "#ffffff",
        secondary: "#e8e4f4",
        "secondary-foreground": "#2d2a35",
        muted: "#ede9e0",
        "muted-foreground": "#7a7568",
        accent: "#a8c5a0",
        "accent-foreground": "#1e3a1e",
        destructive: "#c94f4f",
        "destructive-foreground": "#ffffff",
        border: "rgba(124,107,174,0.15)",
        "input-background": "#f0edf8",
        "switch-background": "#c4bde0",
        ring: "#7c6bae",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
