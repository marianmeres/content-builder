/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./node_modules/@marianmeres/stuic/dist/**/*.{js,svelte}',
		'./src/**/*.{html,js,svelte,ts}'
	],
	darkMode: 'class',
	theme: {
		extend: {}
	},
	plugins: []
};
