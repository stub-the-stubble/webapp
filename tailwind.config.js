/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            white: '#ffffff',
            black: colors.stone['900'],
            grey: colors.stone['500'],
            'lightish-grey': colors.stone['300'],
            'light-grey': colors.stone['200'],
            'lightest-grey': colors.stone['50'],
            'dark-grey': colors.stone['600'],
            brown: 'rgb(154,103,55)',
            'light-orange': colors.orange['100'],
            red: colors.red['500'],
        },
        container: {
            center: true,
            padding: '1.5rem',
        },
        screens: {
            xs: '540px',
            sm: '768px',
            md: '1024px',
            lg: '1280px',
            xl: '1536px',
        },

        extend: {
            colors: {
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                primary: {
                    DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                    foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                    foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
                },
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
                },
                popover: {
                    DEFAULT: "hsl(var(--popover) / <alpha-value>)",
                    foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
                },
                card: {
                    DEFAULT: "hsl(var(--card) / <alpha-value>)",
                    foreground: "hsl(var(--card-foreground) / <alpha-value>)"
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)"
            },
            aspectRatio: {
                '4/3': '4 / 3',
            },
            fontSize: {
                '6.5xl': '4rem',
            },
            animation: {
                'fadein-up': '0.8s ease-out fadein-up forwards',
            },
            keyframes: {
                'fadein-up': {
                    from: {
                        transform: 'translateY(50px)',
                        opacity: 0,
                    },
                    to: {
                        transform: 'translateY(0px)',
                        opacity: 1,
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
};
