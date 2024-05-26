/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: "/web-viewer",
	assetPrefix: "/web-viewer",
	images: { unoptimized: true },
	output: "export",
};

export default nextConfig;
