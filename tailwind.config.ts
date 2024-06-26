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
			fontFamily: {
				cursive: ['"Dancing Script"', "cursive"],
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			colors: {
				transparent: "transparent",
				greyish: "#252525",
				darkgrey: "#090909",
				offwhite: "#D0D0D0",
				lessoffwhite: "#E0E0E0",
				offblack: "#202020",
			},
			rotate: {
				"180": "180deg",
			},
		},
	},
	variants: {
		extend: {
			rotate: ["hover"],
		},
	},
	plugins: [],
};
export default config;
