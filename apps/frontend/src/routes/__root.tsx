import { motion } from "motion/react";
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
import ThirdPartyScripts from "../components/ui/ThirdPartyScripts";
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
			// Both families are self-hosted (see @font-face in styles/global.css).
			// The two latin files are the ones every page uses, and a font is only
			// discovered once the stylesheet has parsed — preloading them removes
			// that second round trip. crossOrigin is required even same-origin:
			// fonts are always fetched in CORS mode.
			{
				rel: "preload",
				as: "font",
				type: "font/woff2",
				href: "/fonts/inter-latin.woff2",
				crossOrigin: "anonymous" as const,
			},
			{
				rel: "preload",
				as: "font",
				type: "font/woff2",
				href: "/fonts/lora-latin.woff2",
				crossOrigin: "anonymous" as const,
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
			...(loaderData?.gaId
				? [
						{
							rel: "preconnect",
							href: "https://www.googletagmanager.com",
						},
					]
				: []),
			...(loaderData?.adsensePubId
				? [
						{
							rel: "preconnect",
							href: "https://pagead2.googlesyndication.com",
							crossOrigin: "anonymous" as const,
						},
					]
				: []),
		],
		// GA4 and AdSense are injected after first paint by <ThirdPartyScripts>
		// below, so nothing here competes with the LCP. Preconnect still belongs
		// in the head: it opens the connections while the page is rendering, so
		// the deferred scripts do not pay for DNS and TLS when they finally run.
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
	const analytics = Route.useLoaderData();

	return (
		<RootDocument>
			<Outlet />
			<ThirdPartyScripts
				gaId={analytics?.gaId}
				adsensePubId={analytics?.adsensePubId}
			/>
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
