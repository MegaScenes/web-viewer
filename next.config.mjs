/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: "/web-viewer",
	assetPrefix: "/web-viewer",
	images: { loader: "custom", loaderFile: "./loader.ts" },
	output: "export",
};

export default nextConfig;
