import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#020617",
        primary: {
          DEFAULT: "#0047BB", // Sovereign Blue
          50: "#EBF3FF",
          100: "#D7E7FF",
          200: "#AFCEFF",
          300: "#87B5FF",
          400: "#5F9CFF",
          500: "#0047BB",
          600: "#003996",
          700: "#002B71",
          800: "#001D4B",
          900: "#000E26",
        },
        secondary: {
          DEFAULT: "#00875A", // Government Emerald
          50: "#E3FCEF",
          100: "#BFF9DB",
          200: "#79F2C0",
          300: "#36EBA3",
          400: "#00D98B",
          500: "#00875A",
          600: "#006644",
          700: "#004D33",
          800: "#003322",
          900: "#001A11",
        },
        slate: {
          950: "#020617",
        }
      },
      letterSpacing: {
        'tightest': '-0.06em',
        'tighter': '-0.04em',
        'tight': '-0.02em',
        'normal': '0',
        'wide': '0.02em',
        'wider': '0.05em',
        'widest': '0.1em',
        'ultra-wide': '0.25em',
      },
      lineHeight: {
        'extra-loose': '2.5',
        'relaxed-ar': '1.8',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        '7xl': '4rem',
      },
      boxShadow: {
        'premium': '0 20px 50px -10px rgba(0, 71, 187, 0.1)',
        'premium-hover': '0 40px 80px -20px rgba(0, 71, 187, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(0, 71, 187, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 71, 187, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out',
        'slide-right': 'slideRight 0.8s ease-out',
        'slide-left': 'slideLeft 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
