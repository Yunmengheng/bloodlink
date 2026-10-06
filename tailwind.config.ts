import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Every colour here resolves to a CSS variable defined in app/globals.css.
 * Components should use these utility names and never a raw hex value.
 */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-latin)", "var(--font-khmer)", "system-ui", "sans-serif"],
        khmer: ["var(--font-khmer)", "sans-serif"],
      },

      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Text ramp: primary is `foreground`, then these two.
        subtle: "hsl(var(--text-secondary))",
        faint: "hsl(var(--text-muted))",
        // Non-text only: rules, dividers, disabled marks.
        decorative: "hsl(var(--text-decorative))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          tint: "hsl(var(--primary-tint))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          tint: "hsl(var(--success-tint))",
          ink: "hsl(var(--success-ink))",
        },
        // Urgency levels. Critical reuses primary; never colour alone — always
        // paired with an icon and a text label.
        critical: {
          DEFAULT: "hsl(var(--primary))",
          tint: "hsl(var(--primary-tint))",
          ink: "hsl(var(--critical-ink))",
        },
        urgent: {
          DEFAULT: "hsl(var(--urgent))",
          tint: "hsl(var(--urgent-tint))",
          ink: "hsl(var(--urgent-ink))",
        },
        standard: {
          DEFAULT: "hsl(var(--standard))",
          tint: "hsl(var(--standard-tint))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },

      // Type scale: 13 / 15 / 17 / 20 / 28 / 36.
      fontSize: {
        xs: ["13px", { lineHeight: "1.5" }],
        sm: ["15px", { lineHeight: "1.55" }],
        base: ["17px", { lineHeight: "1.6" }],
        lg: ["20px", { lineHeight: "1.45" }],
        xl: ["28px", { lineHeight: "1.25" }],
        "2xl": ["36px", { lineHeight: "1.15" }],
      },

      borderRadius: {
        card: "16px",
        button: "12px",
        input: "12px",
        pill: "9999px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Subtle only. Cards pair a border with the soft shadow.
      boxShadow: {
        soft: "0 1px 2px 0 rgb(28 25 23 / 0.05)",
        lift: "0 4px 16px 0 rgb(28 25 23 / 0.08)",
      },

      maxWidth: {
        content: "1120px",
      },

      spacing: {
        // Named steps on the 8px grid used by page sections.
        section: "4rem",
      },

      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
