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
                'spin-slow': 'spin 8s linear infinite',
            },
        },
    },
    plugins: [],
}
