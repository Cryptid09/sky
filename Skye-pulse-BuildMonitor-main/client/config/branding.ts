// SkyEye Build Monitor - Branding Configuration
export const branding = {
  // App Information
  name: "SkyEye Build Monitor",
  tagline: "Protecting agricultural land through intelligent monitoring",
  description:
    "Advanced satellite-based encroachment detection system for farmers and administrators",

  // Logo and Icons
  logo: {
    text: "SkyEye",
    subtitle: "Build Monitor",
    icon: "🌾", // Wheat/farming icon
  },

  // Color Palette - Green/Farmer-friendly theme
  colors: {
    // Primary - Fresh agricultural green
    primary: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Main primary
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },

    // Secondary - Earth tones
    secondary: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
    },

    // Accent - Sky blue for satellite theme
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },

    // Status colors
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Typography
  fonts: {
    primary: "'Inter', system-ui, sans-serif",
    secondary: "'Roboto', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Spacing and Layout
  layout: {
    borderRadius: "0.5rem",
    maxWidth: "1200px",
    headerHeight: "4rem",
    sidebarWidth: "16rem",
  },

  // Feature Colors
  features: {
    encroachment: "#ef4444", // Red for alerts
    approved: "#22c55e", // Green for approved
    pending: "#f59e0b", // Amber for pending
    satellite: "#3b82f6", // Blue for satellite data
  },
};

// CSS Custom Properties for Tailwind
export const cssVariables = {
  ":root": {
    // Primary colors
    "--primary-50": "240 253 244",
    "--primary-100": "220 252 231",
    "--primary-200": "187 247 208",
    "--primary-300": "134 239 172",
    "--primary-400": "74 222 128",
    "--primary-500": "34 197 94", // Main primary
    "--primary-600": "22 163 74",
    "--primary-700": "21 128 61",
    "--primary-800": "22 101 52",
    "--primary-900": "20 83 45",

    // Semantic colors for components
    "--background": "0 0% 100%",
    "--foreground": "20 14.3% 4.1%",
    "--card": "0 0% 100%",
    "--card-foreground": "20 14.3% 4.1%",
    "--popover": "0 0% 100%",
    "--popover-foreground": "20 14.3% 4.1%",
    "--primary": "142 76% 36%", // Green primary
    "--primary-foreground": "355.7 100% 97.3%",
    "--secondary": "60 4.8% 95.9%",
    "--secondary-foreground": "24 9.8% 10%",
    "--muted": "60 4.8% 95.9%",
    "--muted-foreground": "25 5.3% 44.7%",
    "--accent": "199 89% 48%", // Sky blue accent
    "--accent-foreground": "210 20% 98%",
    "--destructive": "0 84.2% 60.2%",
    "--destructive-foreground": "210 20% 98%",
    "--border": "20 5.9% 90%",
    "--input": "20 5.9% 90%",
    "--ring": "142 76% 36%",
    "--radius": "0.5rem",
  },
  ".dark": {
    "--background": "20 14.3% 4.1%",
    "--foreground": "60 9.1% 97.8%",
    "--card": "20 14.3% 4.1%",
    "--card-foreground": "60 9.1% 97.8%",
    "--popover": "20 14.3% 4.1%",
    "--popover-foreground": "60 9.1% 97.8%",
    "--primary": "142 70% 45%", // Brighter green for dark mode
    "--primary-foreground": "144.9 80.4% 10%",
    "--secondary": "12 6.5% 15.1%",
    "--secondary-foreground": "60 9.1% 97.8%",
    "--muted": "12 6.5% 15.1%",
    "--muted-foreground": "24 5.4% 63.9%",
    "--accent": "199 89% 48%",
    "--accent-foreground": "210 20% 98%",
    "--destructive": "0 62.8% 30.6%",
    "--destructive-foreground": "60 9.1% 97.8%",
    "--border": "12 6.5% 15.1%",
    "--input": "12 6.5% 15.1%",
    "--ring": "142 70% 45%",
  },
};

// App-specific constants
export const appConfig = {
  name: branding.name,
  version: "1.0.0",
  author: "SkyEye Team",
  contact: {
    email: "support@skyeyemonitor.com",
    phone: "+1-800-SKYEYE-1",
  },
  social: {
    website: "https://skyeyemonitor.com",
    twitter: "@SkyEyeMonitor",
  },
};
