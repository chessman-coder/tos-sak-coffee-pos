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
                'text-light': '#F5EBDD',
                'primary-text': '#2B2B2B',
                'secondary-text': '#6B6B6B',
                'success': '#10B981',
                'success-bg': '#9FFFCE',
                'warning': '#F59E0B',
                'warning-bg': '#FFF0B4',
                'danger': '#F43F5E',
                'danger-bg': '#FEBDC2',
                'info': '#006FFF',
                'info-bg': '#8BBDFF',

            },
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
