/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      xs: ["12px", "16px"],
      sm: ["14px", "20px"],
      base: ["16px", "19.5px"],
      lg: ["18px", "21.94px"],
      xl: ["20px", "24.38px"],
      "2xl": ["24px", "29.26px"],
      "3xl": ["28px", "50px"],
      "36px": ["36px", "52px"],
      "4xl": ["48px", "58px"],
      "5xl": ["60px", "75.75px"],
      "8xl": ["96px", "106px"],
      text10_14: ["10px", "14px"],
      text12_20: ["12px", "20px"],
      text14_20: ["14px", "20px"],
      text16_20: ["16px", "20px"],
      text16_24: ["16px", "24px"],
      text18_20: ["18px", "20px"],
      text18_28: ["18px", "28px"],
      text20_30: ["20px", "30px"],
      text24_44: ["24px", "44px"],
      text30_40: ["30px", "40px"],
      text36_40: ["36px", "40px"],
      text40_60: ["40px", "60px"],
      text50_60: ["50px", "60px"],
    },
    extend: {
      fontFamily: {
        palanquin: ["Palanquin", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        Poppins: ["Poppins", "sans-serif"],
        Mulish: ["Mulish", "sans-serif"],
        Manrope: ["Manrope", "sans-serif"],
        Lato: ["Lato", "sans-serif"],
        Roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        "color-1": "#508CAE",
        "color-2": "rgba(82, 135, 135, 0.32)",
        "color-3": "#43B02A",
        "color-4": "#696969",
        primary: "#ECEEFF",
        "coral-red": "#FF6452",
        "slate-gray": "#6D6D6D",
        "pale-blue": "#F5F6FF",
        "white-400": "rgba(255, 255, 255, 0.80)",
        "primary-text": "#508CAE",
        "primary-text-hover": "#36627D",
        "secondary-text": "#7D7987",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      },
      boxShadow: {
        "3xl": "0 10px 40px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        hero: "url('assets/images/collection-background.svg')",
        card: "url('assets/images/thumbnail-background.svg')",
      },
      screens: {
        wide: "1440px",
      },
      width: {
        "w-icon-card": "350px",
        "w-heading": "525px",
        "w-ellipse": "800px",
        "w-paragraph": "705px",
      },
      height: {
        "h-icon-card": "350px",
        "h-ellipse": "800px",
        "h-konsultan": "650px",
      },
      borderRadius: {
        "image-rounded": "1000px",
        "55px": "55px",
      },
      borderColor: {
        primary: "#508CAE",
      },
    },
  },
  plugins: [],
};
