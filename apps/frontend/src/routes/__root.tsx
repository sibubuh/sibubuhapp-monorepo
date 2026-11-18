import { motion } from "framer-motion";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { DefaultCatchBoundary } from "#/components/errors/DefaultCatchBoundary";
import { NotFound } from "#/components/errors/NotFound";

import appCss from "../styles/global.css?url";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { getAnalyticsConfig } from "../../services/api";

export const Route = createRootRoute({
	loader: async () => await getAnalyticsConfig(),
	head: ({ loaderData }) => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{
				name: "theme-color",
				content: "#faf8f4",
				media: "(prefers-color-scheme: light)",
			},
			{
				name: "theme-color",
				content: "#2c2926",
				media: "(prefers-color-scheme: dark)",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
			},
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			// The blog lives on Blogger; pointing at its feed is what lets readers
			// and AI crawlers discover the post stream surfaced on the homepage.
			{
				rel: "alternate",
				type: "application/rss+xml",
				title: "Blog — bubuh.id",
				href: "https://www.blogger.com/feeds/7588128007666021062/posts/default?alt=rss",
			},
		],
		// GA4 and AdSense Auto Ads. Each is skipped entirely when the CMS has no
		// id, so a missing or cleared value never ships a broken tag.
		scripts: [
			...(loaderData?.gaId
				? [
						{
							src: `https://www.googletagmanager.com/gtag/js?id=${loaderData.gaId}`,
							async: true,
						},
						{
							children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${loaderData.gaId}');`,
						},
					]
				: []),
			...(loaderData?.adsensePubId
				? [
						{
							src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${loaderData.adsensePubId}`,
							async: true,
							crossOrigin: "anonymous" as const,
						},
					]
				: []),
		],
	}),
	errorComponent: (props: ErrorComponentProps) => (
		<RootDocument>
			<DefaultCatchBoundary {...props} />
		</RootDocument>
	),
	notFoundComponent: () => (
		<RootDocument>
			<NotFound />
		</RootDocument>
	),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var e=localStorage.getItem("theme");if(e==="dark"||(!e&&window.matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.setAttribute("data-theme","dark")}catch(e){}})()`,
					}}
				/>
				<HeadContent />
			</head>
			<body>
				<div className="min-h-screen bg-background text-foreground">
					<Navbar />
					{children}
				</div>

				{import.meta.env.DEV ? (
					<TanStackRouterDevtools position="bottom-right" />
				) : null}
				<Scripts />
				<Footer />
			</body>
		</html>
	);
}
