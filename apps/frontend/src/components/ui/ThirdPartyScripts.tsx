import { useEffect } from "react";

interface ThirdPartyScriptsProps {
	gaId?: string | null;
	adsensePubId?: string | null;
}

/**
 * Loads GA4 and AdSense Auto Ads once the browser is idle instead of from the
 * document head.
 *
 * In the <head>, even with `async`, these two cost 143ms of the page's 863ms
 * total blocking time and 257KB of transfer, because the browser starts
 * parsing and executing them while React is still hydrating. Waiting for idle
 * moves that work past the LCP.
 *
 * Idle, not first interaction: every visitor still loads both, so ad
 * impressions and pageview counts stay complete — they just arrive a second or
 * two later. Bounced visits are still measured.
 */
export default function ThirdPartyScripts({
	gaId,
	adsensePubId,
}: ThirdPartyScriptsProps) {
	useEffect(() => {
		if (!gaId && !adsensePubId) return;

		let cancelled = false;

		const load = () => {
			if (cancelled) return;

			if (gaId) {
				// Verbatim from Google's gtag.js snippet, including the push of
				// `arguments` rather than an array. Kept as an injected inline
				// script so the bootstrap stays byte-for-byte what GA documents.
				const bootstrap = document.createElement("script");
				bootstrap.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
				document.head.appendChild(bootstrap);

				const gtag = document.createElement("script");
				gtag.async = true;
				gtag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
				document.head.appendChild(gtag);
			}

			if (adsensePubId) {
				const ads = document.createElement("script");
				ads.async = true;
				ads.crossOrigin = "anonymous";
				ads.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`;
				document.head.appendChild(ads);
			}
		};

		// Safari has no requestIdleCallback; a timeout keeps it off the critical
		// path there too. The 2s cap stops a busy main thread from starving the
		// callback indefinitely.
		const idle = window.requestIdleCallback;
		if (idle) {
			const handle = idle(load, { timeout: 2000 });
			return () => {
				cancelled = true;
				window.cancelIdleCallback?.(handle);
			};
		}

		const handle = window.setTimeout(load, 2000);
		return () => {
			cancelled = true;
			window.clearTimeout(handle);
		};
	}, [gaId, adsensePubId]);

	return null;
}
