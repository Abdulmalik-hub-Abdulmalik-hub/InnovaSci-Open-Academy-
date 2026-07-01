import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
        // InnovaSci Brand Colors - CSS Variable based for theming
        brand: {
          // Primary Purple - Innovation
          purple: {
            DEFAULT: "hsl(var(--brand-purple))",
            light: "hsl(var(--brand-purple-light))",
            dark: "hsl(var(--brand-purple-dark))",
            foreground: "hsl(var(--brand-purple-foreground))",
          },
          // Primary Blue - Intelligence
          blue: {
            DEFAULT: "hsl(var(--brand-blue))",
            light: "hsl(var(--brand-blue-light))",
            dark: "hsl(var(--brand-blue-dark))",
            foreground: "hsl(var(--brand-blue-foreground))",
          },
          // Teal - Science/CTA
          teal: {
            DEFAULT: "hsl(var(--brand-teal))",
            light: "hsl(var(--brand-teal-light))",
            dark: "hsl(var(--brand-teal-dark))",
            foreground: "hsl(var(--brand-teal-foreground))",
          },
          // Black/Grey - Professionalism
          neutral: {
            DEFAULT: "hsl(var(--brand-black))",
            muted: "hsl(var(--brand-grey))",
            light: "hsl(var(--brand-grey-light))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Responsive typography with clamp()
      fontSize: {
        "fluid-xs": ["clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)", { lineHeight: "1.5" }],
        "fluid-sm": ["clamp(0.875rem, 0.8rem + 0.35vw, 1rem)", { lineHeight: "1.5" }],
        "fluid-base": ["clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", { lineHeight: "1.6" }],
        "fluid-lg": ["clamp(1.125rem, 1rem + 0.5vw, 1.25rem)", { lineHeight: "1.6" }],
        "fluid-xl": ["clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)", { lineHeight: "1.4" }],
        "fluid-2xl": ["clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)", { lineHeight: "1.3" }],
        "fluid-3xl": ["clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)", { lineHeight: "1.2" }],
        "fluid-4xl": ["clamp(2.25rem, 1.75rem + 2.5vw, 3rem)", { lineHeight: "1.1" }],
        "fluid-5xl": ["clamp(3rem, 2rem + 4vw, 3.75rem)", { lineHeight: "1.05" }],
        "fluid-6xl": ["clamp(3.5rem, 2.5rem + 5vw, 4.5rem)", { lineHeight: "1" }],
      },
      // Responsive spacing
      spacing: {
        "fluid-1": "clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)",
        "fluid-2": "clamp(0.5rem, 0.4rem + 0.5vw, 1rem)",
        "fluid-3": "clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)",
        "fluid-4": "clamp(1rem, 0.8rem + 1vw, 2rem)",
        "fluid-6": "clamp(1.5rem, 1.2rem + 1.5vw, 3rem)",
        "fluid-8": "clamp(2rem, 1.5rem + 2.5vw, 4rem)",
      },
      // Custom shadows with brand colors
      boxShadow: {
        "brand-purple": "0 4px 14px 0 hsl(var(--brand-purple) / 0.25)",
        "brand-blue": "0 4px 14px 0 hsl(var(--brand-blue) / 0.25)",
        "brand-teal": "0 4px 14px 0 hsl(var(--brand-teal) / 0.25)",
        "brand-purple-lg": "0 10px 25px -5px hsl(var(--brand-purple) / 0.3)",
        "brand-blue-lg": "0 10px 25px -5px hsl(var(--brand-blue) / 0.3)",
        "brand-teal-lg": "0 10px 25px -5px hsl(var(--brand-teal) / 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
