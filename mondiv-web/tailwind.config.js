/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',                    // ⬅️ 이 줄 추가
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {brand: {50: '#eef6ff', 600: '#2563eb', 700: '#1d4ed8'}},
        },
    },
    plugins: [],
}
