import type { Config } from "tailwindcss";

const config: Config = {
	mode: "jit",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			colors: {
				transparent: "transparent",
				greyish: "#252525",
				darkgrey: "#090909",
				whiteish: "#d0d0d0",
				offwhite: "#E0E0E0",
				offblack: "#202020",
			},
		},
	},
	plugins: [],
};
export default config;
