import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      screens: {
        DEFAULT: "100%",
        xl: "1390px",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
      "3xl": "1500px",
      "4xl": "1780px",

      "max-xs": { max: "319px" },
      "max-sm": { max: "639px" },
      "max-md": { max: "767px" },
      "max-lg": { max: "1023px" },
      "max-xl": { max: "1279px" },
      "max-2xl": { max: "1399px" },
      "max-3xl": { max: "1499px" },
      "max-4xl": { max: "1779px" },
    },
    extend: {
      fontFamily: {
        inter: 'var(--font-inter)',
        lato: 'var(--font-lato)',
        satisfy: 'var(--font-satisfy)',
        plafair: 'var(--font-playfair)',
        'playfair': ['Playfair Display', 'serif'],
      },
      fontSize: {
        "40":'40px',
        "64":'64px',
        "1xl":'22px',
        h1: [
          "2.5rem",
          {
            lineHeight: "2.75rem",
          },
        ],
        h2: [
          "1.875rem",
          {
            lineHeight: "2.375rem",
          },
        ],
        h3: [
          "1.5rem",
          {
            lineHeight: "2rem",
          },
        ],
        h4: [
          "1.25rem",
          {
            lineHeight: "1.75rem",
          },
        ],
        h5: [
          "1.125rem",
          {
            lineHeight: "1.625rem",
          },
        ],
        h6: [
          "1rem",
          {
            lineHeight: "1.5rem",
          },
        ],
        quote: [
          "1.125rem",
          {
            lineHeight: "1.75rem",
            fontWeight: "600",
          },
        ],
      },
      colors: {
        CPrimary: "#B699CA",
        CSecondary: "#EFC951",
        CAqua: "#89CFD6",
        gray: {
          main: "rgb(var(--gray-main) / <alpha-value>)",
          light: "rgb(var(--gray-light) / <alpha-value>)",
          lighter: "rgb(var(--gray-lighter) / <alpha-value>)",
          lightest: "rgb(var(--gray-lightest) / <alpha-value>)",
          DEFAULT: "rgb(var(--gray-default) / <alpha-value>)",
          dark: "rgb(var(--gray-dark) / <alpha-value>)",
          1000: "rgb(var(--gray-1000) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
        },
        red: {
          light: "rgb(var(--red-light) / <alpha-value>)",
          lighter: "rgb(var(--red-lighter) / <alpha-value>)",
          DEFAULT: "rgb(var(--red-default) / <alpha-value>)",
          dark: "rgb(var(--red-dark) / <alpha-value>)",
        },
        orange: {
          light: "rgb(var(--orange-light) / <alpha-value>)",
          lighter: "rgb(var(--orange-lighter) / <alpha-value>)",
          DEFAULT: "rgb(var(--orange-default) / <alpha-value>)",
          dark: "rgb(var(--orange-dark) / <alpha-value>)",
        },
        green: {
          light: "rgb(var(--green-light) / <alpha-value>)",
          lighter: "rgb(var(--green-lighter) / <alpha-value>)",
          DEFAULT: "rgb(var(--green-default) / <alpha-value>)",
          dark: "rgb(var(--green-dark) / <alpha-value>)",
        },
        indigo: {
          lighter: 'rgb(var(--indigo-lighter) / <alpha-value>)',
        },
        'light-bg': '#F3F3F3',
        'card-bg': '#FFFFFF',
        'text-primary': '#000000',
        'text-secondary': '#726E6E',
        'text-tertiary': '#3E3E3E',
      },
      backgroundImage: {
        'cutout': "url('/images/vectors/cutout-bg.svg')",
        'cutoutM': "url('/images/vectors/cutout-bgM.svg')",
        'cutout1': "url('/images/vectors/cutout-1.png')",
        'cutout1M': "url('/images/vectors/cutout-1M.png')",
        'cutout2': "url('/images/vectors/cutout-2.png')",
        'cutout2M': "url('/images/vectors/cutout-2M.png')",
        'pups4SaleDesktop': "url('/images/banner/rounded-banner.png')",
        'pups4SaleMobile': "url('/images/vectors/backgroundlineform.svg')",
        'selectArrow': "url('/images/vectors/selectArrow.svg')",
        'selectArrow2': "url('/images/vectors/selectArrow2.png')",
        'blogDetails': "url('/images/vectors/blogDetails.png')",
        'aboutOwner': "url('/images/vectors/aboutOwner.png')",
        'listingBG': "url('/images/vectors/listingBG.png')",
        'notFound': "url('/images/vectors/404bg.png')",
      },
      boxShadow: {
        card: "0px 0px 0px 1px rgba(35, 38, 59, 0.05), 0px 2px 4px rgba(35, 38, 59, 0.1)",
        "card-hover": "0px 0px 0px 1px rgba(35, 38, 59, 0.05), 0px 3px 4px rgba(35, 38, 59, 0.1)",
        "card-two": "0px 8px 12px rgba(0, 0, 0, 0.08)",
        "menu-shadow": "0px 0px 8px rgba(133, 21, 21, 0.12)",
        'CCard': '0px 4px 27px 0px #00000021',
        'CCardHover': '0px 4.4px 48.42px 0px #0000009C',
        'section': '0px 4px 27px 0px #0000001A',
        'range': '0px 0px 0px 2px #00000033',
        'review': '0px 3.57px 9.99px 0px #080F340A',
      },
      animation: {
        blink: "blink 1.4s infinite both;",
        "scale-up": "scaleUp 500ms infinite alternate",
      },
      keyframes: {
        blink: {
          "0%": { opacity: "0.2" },
          "20%": { opacity: "1" },
          "100%": { opacity: "0.2" },
        },
        scaleUp: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      borderRadius: {
        40: '40px',
        hero: '80px',
        max: '80px',
      }
    },
  },
  plugins: [],
};
export default config;
