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
            'lightest-grey': colors.stone['50'],
            'light-grey': colors.stone['200'],
            brown: 'rgb(154,103,55)',
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
    plugins: [],
};
