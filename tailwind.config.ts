import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        talkingHead: {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "25%": { transform: "scale(1.01) translateY(-1px)" },
          "50%": { transform: "scale(0.99) translateY(1px)" },
          "75%": { transform: "scale(1.015) translateY(-0.5px)" },
        },
        waveform: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "24px" },
        },
        avatarNaturalTalking: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        avatarSubtleHead: {
          "0%, 100%": { transform: "rotate(0deg) translateY(0)" },
          "25%": { transform: "rotate(1.2deg) translateY(-2px)" },
          "50%": { transform: "rotate(-1deg) translateY(1px)" },
          "75%": { transform: "rotate(0.6deg) translateY(0)" },
        },
        avatarHandGestures: {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.03) translateY(-4px)" },
        },
        avatarZoomIn: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        avatarZoomOut: {
          "0%, 100%": { transform: "scale(1.15)" },
          "50%": { transform: "scale(1)" },
        },
        avatarCinematic: {
          "0%, 100%": { transform: "scale(1) translateX(0)" },
          "50%": { transform: "scale(1.08) translateX(5px)" },
          "75%": { transform: "scale(1.04) translateX(-3px)" },
        },
        avatarDynamic: {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "25%": { transform: "scale(1.05) translateY(-4px)" },
          "50%": { transform: "scale(0.98) translateY(2px)" },
          "75%": { transform: "scale(1.02) translateY(-2px)" },
        },
        avatarProfessional: {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.02) translateY(-1.5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "talking-head": "talkingHead 0.4s ease-in-out infinite",
        "waveform": "waveform 0.8s ease-in-out infinite",
        "avatar-natural-talking": "avatarNaturalTalking 2.8s ease-in-out infinite",
        "avatar-subtle-head": "avatarSubtleHead 4s ease-in-out infinite",
        "avatar-hand-gestures": "avatarHandGestures 3.2s ease-in-out infinite",
        "avatar-zoom-in": "avatarZoomIn 6s ease-in-out infinite",
        "avatar-zoom-out": "avatarZoomOut 6s ease-in-out infinite",
        "avatar-cinematic": "avatarCinematic 7s ease-in-out infinite",
        "avatar-dynamic": "avatarDynamic 3.5s ease-in-out infinite",
        "avatar-professional": "avatarProfessional 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
