/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				cjk: ['"Noto Sans CJK TC"', "sans-serif"], // 繁體中文字體
				sans: ["Inter", "sans-serif"], // 英文備用字體
			},
			colors: {
				primary: {
					light: "#F9A8D4", // 淺色模式主色
					dark: "#DB7777", // 深色模式主色
				},
				accent: {
					light: "#C4B5FD", // 淺色模式強調色
					dark: "#7C3AED", // 深色模式強調色
				},
				secondary: {
					light: "#A7F3D0", // 淺色模式輔助色
					dark: "#10B981", // 深色模式輔助色
				},
				background: {
					light: "#F5F5F5", // 淺色模式背景
					dark: "#1F2937", // 深色模式背景
				},
				text: {
					light: "#374151", // 淺色模式文字
					dark: "#D1D5DB", // 深色模式文字
				},
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-in-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};
