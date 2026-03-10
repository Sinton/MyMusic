/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Map CSS variables to Tailwind for consistency
                'text-main': 'var(--text-main)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                'glass-bg': 'var(--glass-bg)',
                'glass-border': 'var(--glass-border)',
                'accent': 'var(--accent-color)',
                'accent-hover': 'var(--accent-hover)',
                'bg': 'var(--bg-color)',
            },
            animation: {
                'assemble-tl': 'assemble-tl 3s ease-in-out infinite',
                'assemble-tr': 'assemble-tr 3s ease-in-out infinite',
                'assemble-bl': 'assemble-bl 3s ease-in-out infinite',
                'assemble-br': 'assemble-br 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'assemble-tl': {
                    '0%': { transform: 'rotate(0deg) translate(-18px, -18px) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '0.2' },
                    '60%': { transform: 'rotate(360deg) translate(-18px, -18px) rotate(-360deg)', opacity: '0.2' },
                    '85%, 100%': { transform: 'rotate(360deg) translate(0, 0) rotate(-360deg)', opacity: '0.2' },
                },
                'assemble-tr': {
                    '0%': { transform: 'rotate(0deg) translate(18px, -18px) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '0.2' },
                    '60%': { transform: 'rotate(360deg) translate(18px, -18px) rotate(-360deg)', opacity: '0.2' },
                    '85%, 100%': { transform: 'rotate(360deg) translate(0, 0) rotate(-360deg)', opacity: '0.2' },
                },
                'assemble-bl': {
                    '0%': { transform: 'rotate(0deg) translate(-18px, 18px) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '0.2' },
                    '60%': { transform: 'rotate(360deg) translate(-18px, 18px) rotate(-360deg)', opacity: '0.2' },
                    '85%, 100%': { transform: 'rotate(360deg) translate(0, 0) rotate(-360deg)', opacity: '0.2' },
                },
                'assemble-br': {
                    '0%': { transform: 'rotate(0deg) translate(18px, 18px) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '0.2' },
                    '60%': { transform: 'rotate(360deg) translate(18px, 18px) rotate(-360deg)', opacity: '0.2' },
                    '85%, 100%': { transform: 'rotate(360deg) translate(0, 0) rotate(-360deg)', opacity: '0.2' },
                }
            }
        },
    },
    plugins: [],
}
