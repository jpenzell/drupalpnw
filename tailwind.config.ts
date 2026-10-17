import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Display font: clean modern sans (Innovate QA template uses a Futura-style sans)
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        // Serif kept available for accents/quote marks like in the template
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        curtain: {
          DEFAULT: "hsl(var(--curtain))",
          foreground: "hsl(var(--curtain-foreground))",
        },
        spotlight: "hsl(var(--spotlight))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "wiggle": {
          "0%, 100%": { transform: "translate(-50%, -50%) rotate(0deg)" },
          "25%": { transform: "translate(-50%, -50%) rotate(-3deg)" },
          "75%": { transform: "translate(-50%, -50%) rotate(3deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0) rotate(-15deg)", opacity: "0" },
          "60%": { transform: "scale(1.25) rotate(8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "eliminate-out": {
          "0%": { transform: "scale(1) rotate(0deg) translateY(0)", opacity: "1" },
          "30%": { transform: "scale(1.15) rotate(-5deg) translateY(-8px)", opacity: "1" },
          "100%": { transform: "scale(0.4) rotate(25deg) translateY(120px)", opacity: "0" },
        },
        "spotlight-pulse": {
          "0%, 100%": { transform: "scale(1.5)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.65)", filter: "brightness(1.3)" },
        },
        "survivor-reveal": {
          "0%": { transform: "scale(0.5)", opacity: "0.5" },
          "60%": { transform: "scale(1.4)", opacity: "1" },
          "100%": { transform: "scale(1.25)", opacity: "1" },
        },
        "race-streak-left": {
          "0%": { transform: "translateX(-120%)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateX(120%)", opacity: "0" },
        },
        "race-streak-right": {
          "0%": { transform: "translateX(120%)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateX(-120%)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wiggle": "wiggle 0.3s ease-in-out",
        "pop-in": "pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "eliminate-out": "eliminate-out 0.7s cubic-bezier(0.5, 0, 0.75, 0) forwards",
        "spotlight-pulse": "spotlight-pulse 0.6s ease-in-out infinite",
        "survivor-reveal": "survivor-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-left": "race-streak-left 1.2s ease-out infinite",
        "slide-in-right": "race-streak-right 1.2s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
