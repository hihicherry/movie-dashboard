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
				primary: "#F9A8D4", // 粉紅（按鈕和表格頭）
				accent: "#C4B5FD", // 淡紫（懸停和圖表）
				primaryHover: "#F472B6", // 按鈕懸停粉紅
				accentHover: "#A78BFA", // 按鈕懸停淡紫
				secondary: "#A7F3D0", // 薄荷綠（輔助色）
				background: {
					light: "#F5F5F5", // 柔白（淺色模式背景）
					dark: "#1F2937", // 深灰（深色模式背景）
				},
				text: {
					light: "#374151", // 深灰（淺色模式文字）
					dark: "#D1D5DB", // 淺灰（深色模式文字）
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
