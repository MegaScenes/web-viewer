import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "MegaScenes Web Viewer",
	description: "A web viewer for 3d reconstructions",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
			<GoogleAnalytics
				gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!}
			/>
		</html>
	);
}
