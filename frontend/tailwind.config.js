/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],

    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                lg: "2rem",
                xl: "3rem"
            }
        },

        extend: {
            spacing: {
                66: "16.5rem"
            },

            /* ---------------- COLORS ---------------- */
            colors: {
                "novator-blue": "#0B4BFF",
                "novator-blue-dark": "#0A3ED1",

                brand: {
                    blue: "#0B4BFF",
                    blueSoft: "#4F7CFF",
                    orange: "#FF7A2F",
                    orangeSoft: "#FF9A5C"
                },

                bg: {
                    light: "#F7F9FC",
                    dark: "#0B1220"
                },

                text: {
                    main: "#0B1220",
                    muted: "#6B7280",
                    light: "#FFFFFF"
                }
            },

            /* ---------------- GRADIENTS ---------------- */
            backgroundImage: {
                "hero-gradient":
                    "linear-gradient(135deg, #0B4BFF 0%, #4F7CFF 55%, #FF7A2F 100%)",

                "card-gradient":
                    "linear-gradient(135deg, #1E40FF 0%, #FF7A2F 100%)",

                "icon-gradient":
                    "linear-gradient(135deg, #4F7CFF 0%, #FF7A2F 100%)"
            },

            /* ---------------- SHADOWS ---------------- */
            boxShadow: {
                soft: "0 10px 30px rgba(0,0,0,0.06)",
                card: "0 16px 40px rgba(0,0,0,0.08)",
                glowBlue: "0 0 40px rgba(79,124,255,0.35)"
            },

            /* ---------------- RADIUS ---------------- */
            borderRadius: {
                xl: "1.25rem",
                "2xl": "1.75rem",
                card: "1.5rem"
            },

            /* ---------------- FONTS ---------------- */
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"]
            },

            /* ---------------- ANIMATIONS ---------------- */
            keyframes: {
                fadeUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" }
                },

                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-14px)" }
                },

                glow: {
                    "0%, 100%": { opacity: "0.6" },
                    "50%": { opacity: "1" }
                }
            },

            animation: {
                fadeUp: "fadeUp 0.6s ease-out forwards",
                float: "float 6s ease-in-out infinite",
                glow: "glow 3s ease-in-out infinite"
            }
        }
    },

    plugins: []
};