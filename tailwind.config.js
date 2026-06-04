import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        colors: {
                'primaryColor': '#4B2E2B',
                'primary-light': '#5A3A36',
                'primary-dark': '#3E2522',
                'secondaryColor': '#D9A066',
                'secondary-light': '#E6B98C',
                'secondary-dark': '#C38B59',
                'card-border': '#EADBC8',
                'main': '#F5EBDD',
                'card': '#FFFFFF',
                'hover': '#F0E2D2',
                'primary-text': '#2B2B2B',
                'secondary-text': '#6B6B6B',
                'success': '#00D991',
                'success-bg': '#B3FFD8',
                'warning': '#EC9303',
                'warning-bg': '#FFF6D2',
                'danger': '#FF002C',
                'danger-bg': '#FFCED2',
                'infoColor': '#006FFF',
                'info-bg': '#B5D5FF',
                'background': '#F8F5F2',
                'black': '#000000'

            },
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
