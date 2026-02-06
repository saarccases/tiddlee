import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#A4C615",
                secondary: "#f9ed32",
                "background-light": "#F8FAFC",
                "background-dark": "#0F172A",
                "accent-yellow": "#FEF9C3",
                dark: "#1a1a1a",
            },
            fontFamily: {
                display: ["Outfit", "sans-serif"],
                body: ["Quicksand", "sans-serif"],
                inter: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem",
                xl: "24px",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
    ],
};
export default config;
