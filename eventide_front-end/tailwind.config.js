import {heroui} from "@heroui/react"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Epilogue", "sans-serif"],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui(
      {
      prefix: "heroui",
      addCommonColors: false,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {
        dividerWeight: "1px",
        disabledOpacity: 0.5,
        fontSize: {
          tiny: "0.75rem",      // 12px
          small: "0.875rem",    // 14px
          medium: "1rem",       // 16px
          large: "1.125rem",    // 18px
        },
        lineHeight: {
          tiny: "1rem",         // 16px
          small: "1.25rem",     // 20px
          medium: "1.5rem",     // 24px
          large: "1.75rem",     // 28px
        },
        radius: {
          small: "8px",         // Chips, badges
          medium: "12px",       // Buttons, inputs
          large: "20px",        // Cards
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
      // themes: {
      //   light: {
      //     layout: {
      //       hoverOpacity: 0.8,
      //       boxShadow: {
      //         small: "0 2px 8px rgba(139, 92, 246, 0.1)",
      //         medium: "0 8px 24px rgba(139, 92, 246, 0.15)",
      //         large: "0 16px 48px rgba(139, 92, 246, 0.2)",
      //       },
      //     },
      //     colors: {
      //       background: "#fafafa",
      //       foreground: "#0f172a",
            
      //       // Primary - Electric Violet
      //       primary: {
      //         50: "#faf5ff",
      //         100: "#f3e8ff",
      //         200: "#e9d5ff",
      //         300: "#d8b4fe",
      //         400: "#c084fc",
      //         500: "#a855f7",
      //         600: "#9333ea",
      //         700: "#7e22ce",
      //         800: "#6b21a8",
      //         900: "#581c87",
      //         DEFAULT: "#a855f7",
      //         foreground: "#ffffff",
      //       },
            
      //       // Secondary - Coral Sunset
      //       secondary: {
      //         50: "#fff5f5",
      //         100: "#ffe3e3",
      //         200: "#ffc9c9",
      //         300: "#ffa8a8",
      //         400: "#ff8787",
      //         500: "#ff6b6b",
      //         600: "#fa5252",
      //         700: "#f03e3e",
      //         800: "#e03131",
      //         900: "#c92a2a",
      //         DEFAULT: "#ff6b6b",
      //         foreground: "#ffffff",
      //       },
            
      //       // Success - Emerald
      //       success: {
      //         50: "#ecfdf5",
      //         100: "#d1fae5",
      //         200: "#a7f3d0",
      //         300: "#6ee7b7",
      //         400: "#34d399",
      //         500: "#10b981",
      //         600: "#059669",
      //         700: "#047857",
      //         800: "#065f46",
      //         900: "#064e3b",
      //         DEFAULT: "#10b981",
      //         foreground: "#ffffff",
      //       },
            
      //       // Warning - Amber
      //       warning: {
      //         50: "#fffbeb",
      //         100: "#fef3c7",
      //         200: "#fde68a",
      //         300: "#fcd34d",
      //         400: "#fbbf24",
      //         500: "#f59e0b",
      //         600: "#d97706",
      //         700: "#b45309",
      //         800: "#92400e",
      //         900: "#78350f",
      //         DEFAULT: "#f59e0b",
      //         foreground: "#000000",
      //       },
            
      //       // Danger - Rose
      //       danger: {
      //         50: "#fef2f2",
      //         100: "#fee2e2",
      //         200: "#fecaca",
      //         300: "#fca5a5",
      //         400: "#f87171",
      //         500: "#ef4444",
      //         600: "#dc2626",
      //         700: "#b91c1c",
      //         800: "#991b1b",
      //         900: "#7f1d1d",
      //         DEFAULT: "#ef4444",
      //         foreground: "#ffffff",
      //       },
            
      //       // Default/Neutral - Slate
      //       default: {
      //         50: "#f8fafc",
      //         100: "#f1f5f9",
      //         200: "#e2e8f0",
      //         300: "#cbd5e1",
      //         400: "#94a3b8",
      //         500: "#64748b",
      //         600: "#475569",
      //         700: "#334155",
      //         800: "#1e293b",
      //         900: "#0f172a",
      //         DEFAULT: "#e2e8f0",
      //         foreground: "#0f172a",
      //       },
            
      //       // Focus color (for inputs, etc.)
      //       focus: "#a855f7",
            
      //       // Content colors
      //       content1: "#ffffff",
      //       content2: "#f8fafc",
      //       content3: "#f1f5f9",
      //       content4: "#e2e8f0",
            
      //       // Divider
      //       divider: "rgba(0, 0, 0, 0.1)",
            
      //       // Overlay
      //       overlay: "rgba(0, 0, 0, 0.5)",
      //     },
      //   },
      //   dark: {
      //     layout: {
      //       hoverOpacity: 0.9,
      //       boxShadow: {
      //         small: "0 2px 8px rgba(0, 0, 0, 0.4)",
      //         medium: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(168, 85, 247, 0.2)",
      //         large: "0 16px 48px rgba(0, 0, 0, 0.6), 0 0 32px rgba(168, 85, 247, 0.3)",
      //       },
      //     },
      //     colors: {
      //       background: "#0a0a0a",
      //       foreground: "#f8fafc",
            
      //       // Primary - Electric Violet (lighter for dark mode)
      //       primary: {
      //         50: "#581c87",
      //         100: "#6b21a8",
      //         200: "#7e22ce",
      //         300: "#9333ea",
      //         400: "#a855f7",
      //         500: "#c084fc",
      //         600: "#d8b4fe",
      //         700: "#e9d5ff",
      //         800: "#f3e8ff",
      //         900: "#faf5ff",
      //         DEFAULT: "#c084fc",
      //         foreground: "#0a0a0a",
      //       },
            
      //       // Secondary - Coral (adjusted for dark)
      //       secondary: {
      //         50: "#c92a2a",
      //         100: "#e03131",
      //         200: "#f03e3e",
      //         300: "#fa5252",
      //         400: "#ff6b6b",
      //         500: "#ff8787",
      //         600: "#ffa8a8",
      //         700: "#ffc9c9",
      //         800: "#ffe3e3",
      //         900: "#fff5f5",
      //         DEFAULT: "#ff8787",
      //         foreground: "#0a0a0a",
      //       },
            
      //       // Success - Emerald
      //       success: {
      //         50: "#064e3b",
      //         100: "#065f46",
      //         200: "#047857",
      //         300: "#059669",
      //         400: "#10b981",
      //         500: "#34d399",
      //         600: "#6ee7b7",
      //         700: "#a7f3d0",
      //         800: "#d1fae5",
      //         900: "#ecfdf5",
      //         DEFAULT: "#34d399",
      //         foreground: "#0a0a0a",
      //       },
            
      //       // Warning - Amber
      //       warning: {
      //         50: "#78350f",
      //         100: "#92400e",
      //         200: "#b45309",
      //         300: "#d97706",
      //         400: "#f59e0b",
      //         500: "#fbbf24",
      //         600: "#fcd34d",
      //         700: "#fde68a",
      //         800: "#fef3c7",
      //         900: "#fffbeb",
      //         DEFAULT: "#fbbf24",
      //         foreground: "#0a0a0a",
      //       },
            
      //       // Danger - Rose
      //       danger: {
      //         50: "#7f1d1d",
      //         100: "#991b1b",
      //         200: "#b91c1c",
      //         300: "#dc2626",
      //         400: "#ef4444",
      //         500: "#f87171",
      //         600: "#fca5a5",
      //         700: "#fecaca",
      //         800: "#fee2e2",
      //         900: "#fef2f2",
      //         DEFAULT: "#f87171",
      //         foreground: "#0a0a0a",
      //       },
            
      //       // Default/Neutral
      //       default: {
      //         50: "#0f172a",
      //         100: "#1e293b",
      //         200: "#334155",
      //         300: "#475569",
      //         400: "#64748b",
      //         500: "#94a3b8",
      //         600: "#cbd5e1",
      //         700: "#e2e8f0",
      //         800: "#f1f5f9",
      //         900: "#f8fafc",
      //         DEFAULT: "#334155",
      //         foreground: "#f8fafc",
      //       },
            
      //       // Focus
      //       focus: "#c084fc",
            
      //       // Content colors
      //       content1: "#1a1a1a",
      //       content2: "#262626",
      //       content3: "#333333",
      //       content4: "#404040",
            
      //       // Divider
      //       divider: "rgba(255, 255, 255, 0.1)",
            
      //       // Overlay
      //       overlay: "rgba(0, 0, 0, 0.7)",
      //     },
      //   },
        
      //   // Optional: Custom "purple-dark" theme for special events
      //   "purple-dark": {
      //     extend: "dark",
      //     colors: {
      //       background: "#1a0a2e",
      //       primary: {
      //         DEFAULT: "#d946ef",
      //         foreground: "#ffffff",
      //       },
      //     },
      //   },
      // },
    }),
  ],
};
